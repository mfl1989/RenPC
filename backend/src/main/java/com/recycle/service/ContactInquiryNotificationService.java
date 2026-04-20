package com.recycle.service;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.recycle.config.NotificationMailProperties;
import com.recycle.entity.ContactInquiry;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 問い合わせ受付メールを送信する。
 * SMTP 未設定時や通知無効時はログ出力のみで継続する。
 */
@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class ContactInquiryNotificationService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final NotificationMailProperties properties;

    public void sendCustomerReceipt(ContactInquiry inquiry) {
        sendMail(
                inquiry.getEmail(),
                subjectPrefix() + "お問い合わせ受付のお知らせ",
                buildCustomerReceiptBody(inquiry));
    }

    public void sendAdminNotification(ContactInquiry inquiry) {
        String adminTo = trimToNull(properties.getContactAdminTo());
        if (adminTo == null) {
            log.info("問い合わせ管理者通知先が未設定のため送信をスキップします。inquiryId={}", inquiry.getId());
            return;
        }

        sendMail(
                adminTo,
                subjectPrefix() + "お問い合わせ受付通知",
                buildAdminNotificationBody(inquiry));
    }

    private void sendMail(String to, String subject, String body) {
        String recipient = trimToNull(to);
        if (recipient == null) {
            log.warn("送信先メールアドレスが未設定のため問い合わせ通知メールを送信できません。to={}", to);
            return;
        }

        if (!properties.isEnabled()) {
            log.info("問い合わせ通知メールは無効です。to={}", recipient);
            return;
        }

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.warn("JavaMailSender が未設定のため問い合わせ通知メールを送信できません。to={}", recipient);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setTo(recipient);
            String fromAddress = resolveFromAddress();
            String fromName = trimToNull(properties.getFromName());
            if (fromName != null) {
                helper.setFrom(fromAddress, fromName);
            } else {
                helper.setFrom(fromAddress);
            }
            String replyTo = trimToNull(properties.getReplyTo());
            if (replyTo != null) {
                helper.setReplyTo(replyTo, defaultSupportDeskName());
            }
            helper.setSubject(subject);
            helper.setText(body, false);
            mailSender.send(message);
            log.info("問い合わせ通知メールを送信しました。to={}", recipient);
        } catch (Exception ex) {
            log.warn("問い合わせ通知メールの送信に失敗しました。to={}", recipient, ex);
        }
    }

    private String buildCustomerReceiptBody(ContactInquiry inquiry) {
        return safeName(inquiry) + " 様\n\n"
                + defaultCompanyName() + " へお問い合わせいただき、ありがとうございます。\n"
                + "以下の内容でお問い合わせを受け付けました。内容を確認のうえ、原則として2営業日以内を目安に順次ご案内いたします。\n"
                + "お急ぎの場合は、本メール末尾のご連絡先をご確認ください。\n\n"
                + commonBody(inquiry)
                + "\n" + buildFooter();
    }

    private String buildAdminNotificationBody(ContactInquiry inquiry) {
        return defaultCompanyName() + " の問い合わせフォームから新しいお問い合わせを受け付けました。\n"
                + "内容を確認のうえ、対応を開始してください。\n"
                + "一次対応後は必要に応じてお客様へ返信またはお電話にてご案内してください。\n\n"
                + commonBody(inquiry)
                + "\n" + buildFooter();
    }

    private String commonBody(ContactInquiry inquiry) {
        StringBuilder body = new StringBuilder();
        body.append("受付番号: ").append(formatInquiryId(inquiry.getId())).append("\n")
                .append("お名前: ").append(safeName(inquiry)).append("\n")
                .append("メールアドレス: ").append(inquiry.getEmail()).append("\n")
                .append("お問い合わせ種別: ").append(formatCategory(inquiry.getCategory())).append("\n");
        if (inquiry.getOrderReference() != null && !inquiry.getOrderReference().isBlank()) {
            body.append("お申込み番号: ").append(inquiry.getOrderReference()).append("\n");
        }
        body.append("受付日時: ").append(inquiry.getCreatedAt()).append("\n")
                .append("本文:\n")
                .append(inquiry.getMessage())
                .append("\n");
        return body.toString();
    }

    private String buildFooter() {
        StringBuilder footer = new StringBuilder();
        footer.append("------------------------------\n")
                .append(defaultSupportDeskName()).append("\n")
                .append(defaultCompanyName()).append("\n")
                .append("受付時間: ").append(defaultSupportHours()).append("\n")
                .append("お問い合わせフォーム: ").append(normalizeBaseUrl(properties.getPublicBaseUrl())).append("/contact\n");
        String replyTo = trimToNull(properties.getReplyTo());
        if (replyTo != null) {
            footer.append("返信先メールアドレス: ").append(replyTo).append("\n");
        }
        footer.append("このメールは送信専用です。\n");
        return footer.toString();
    }

    private String subjectPrefix() {
        return "【" + defaultCompanyName() + "】";
    }

    private String resolveFromAddress() {
        String from = trimToNull(properties.getFrom());
        return from != null ? from : "no-reply@example.local";
    }

    private String defaultCompanyName() {
        String value = trimToNull(properties.getCompanyName());
        return value != null ? value : "RenPC";
    }

    private String defaultSupportDeskName() {
        String value = trimToNull(properties.getSupportDeskName());
        return value != null ? value : defaultCompanyName() + "サポート窓口";
    }

    private String defaultSupportHours() {
        String value = trimToNull(properties.getSupportHours());
        return value != null ? value : "平日 9:00〜18:00（土日祝日・年末年始を除く）";
    }

    private static String normalizeBaseUrl(String value) {
        if (value == null || value.isBlank()) {
            return "http://localhost:5173";
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    static String formatInquiryId(Long id) {
        if (id == null) {
            return "CI0000000000";
        }
        return String.format("CI%010d", id);
    }

    private static String formatCategory(String category) {
        if (category == null || category.isBlank()) {
            return "未指定";
        }
        return switch (category) {
            case "items" -> "回収対象について";
            case "packing" -> "梱包方法について";
            case "schedule" -> "回収日時について";
            case "status" -> "申込状況について";
            case "data-erasure" -> "データ消去について";
            case "other" -> "その他";
            default -> category;
        };
    }

    private static String safeName(ContactInquiry inquiry) {
        if (inquiry.getName() == null || inquiry.getName().isBlank()) {
            return "お客様";
        }
        return inquiry.getName().trim();
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}