package com.recycle.service;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.recycle.config.NotificationMailProperties;
import com.recycle.entity.RecycleOrder;
import com.recycle.util.OrderIdFormatUtil;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 申込受付・ステータス更新メールを送信する。
 * SMTP 未設定時はログのみで業務処理を継続する。
 */
@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class OrderNotificationService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final NotificationMailProperties properties;

    public void sendOrderSubmitted(RecycleOrder order, String statusLabel, String progressSummary) {
        sendMail(
                order,
                subjectPrefix() + "回収お申し込み受付のお知らせ",
                buildSubmittedBody(order, statusLabel, progressSummary));
    }

    public void sendOrderStatusUpdated(RecycleOrder order, String statusLabel, String progressSummary) {
        sendMail(
                order,
                subjectPrefix() + "回収お申し込み状況更新のお知らせ",
                buildStatusUpdatedBody(order, statusLabel, progressSummary));
    }

    public void sendOrderPricingConfirmed(RecycleOrder order, String statusLabel, String progressSummary) {
        sendMail(
                order,
                subjectPrefix() + "正式料金確定のお知らせ",
                buildPricingConfirmedBody(order, statusLabel, progressSummary));
    }

    private void sendMail(RecycleOrder order, String subject, String body) {
        String recipient = trimToNull(order.getEmail());
        if (recipient == null) {
            log.warn("送信先メールアドレスが未設定のため通知メールを送信できません。orderId={}", order.getId());
            return;
        }

        if (!properties.isEnabled()) {
            log.info("通知メールは無効です。orderId={}", order.getId());
            return;
        }

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.warn("JavaMailSender が未設定のため通知メールを送信できません。orderId={}", order.getId());
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
            log.info("通知メールを送信しました。orderId={}", order.getId());
        } catch (Exception ex) {
            log.warn("通知メールの送信に失敗しました。orderId={}", order.getId(), ex);
        }
    }

    private String buildSubmittedBody(RecycleOrder order, String statusLabel, String progressSummary) {
        return safeContactName(order) + " 様\n\n"
                + defaultCompanyName() + " の回収サービスへお申し込みいただき、ありがとうございます。\n"
                + "以下の内容でお申し込みを受け付けました。\n\n"
                + commonBody(order, statusLabel, progressSummary)
                + "\n内容確認のうえ、必要に応じて " + defaultSupportDeskName() + " よりご連絡いたします。\n"
                + "段ボール配送や回収手配に関する追加確認が必要な場合は、メールまたはお電話でご案内します。\n\n"
                + buildFooter();
    }

    private String buildStatusUpdatedBody(RecycleOrder order, String statusLabel, String progressSummary) {
        return safeContactName(order) + " 様\n\n"
                + "お申し込み状況を更新しました。現在の内容は以下のとおりです。\n\n"
                + commonBody(order, statusLabel, progressSummary)
                + "\n最新状況は注文照会ページからもご確認いただけます。\n"
                + "本メールと行き違いで追加のご案内をお送りする場合があります。\n\n"
                + buildFooter();
    }

    private String buildPricingConfirmedBody(RecycleOrder order, String statusLabel, String progressSummary) {
        return safeContactName(order) + " 様\n\n"
                + "お申し込みの正式料金が確定しました。内容は以下のとおりです。\n\n"
                + commonBody(order, statusLabel, progressSummary)
                + "正式料金: " + formatAmount(order.getFinalAmount()) + "\n"
                + buildPricingConfirmationNoteBlock(order)
                + "最新状況は注文照会ページからもご確認いただけます。\n"
                + "ご不明点がある場合は、お問い合わせフォームよりご連絡ください。\n\n"
                + buildFooter();
    }

    private String commonBody(RecycleOrder order, String statusLabel, String progressSummary) {
        String baseUrl = normalizeBaseUrl(properties.getPublicBaseUrl());
        String customerNoteBlock = buildCustomerNoteBlock(order);
        return "お申し込み番号: " + OrderIdFormatUtil.formatOrderId(order.getId()) + "\n"
                + "現在の状況: " + statusLabel + "\n"
                + "ご案内: " + progressSummary + "\n"
                + "回収希望日: " + order.getCollectionDate() + " " + safeTimeSlot(order) + "\n"
                + "回収内容: " + buildItemSummary(order) + "\n"
                + "データ消去: " + formatDataErasureOption(order.getDataErasureOption()) + "\n"
                + "段ボール配送: " + (order.isCardboardDeliveryRequested() ? "希望する" : "希望しない") + "\n"
                + customerNoteBlock
                + "照会ページ: " + baseUrl + "/orders/lookup\n"
                + "照会時は、お申し込み番号とメールアドレス（" + order.getEmail() + "）をご利用ください。\n";
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
        return value != null ? value : defaultCompanyName() + "カスタマーサポート";
    }

    private String defaultSupportHours() {
        String value = trimToNull(properties.getSupportHours());
        return value != null ? value : "平日 9:00〜18:00（土日祝日・年末年始を除く）";
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static String buildCustomerNoteBlock(RecycleOrder order) {
        if (order.getCustomerNote() == null || order.getCustomerNote().isBlank()) {
            return "";
        }
        return "個別案内: " + order.getCustomerNote().trim() + "\n";
    }

    private static String buildPricingConfirmationNoteBlock(RecycleOrder order) {
        if (order.getPricingConfirmationNote() == null || order.getPricingConfirmationNote().isBlank()) {
            return "";
        }
        return "料金確定メモ: " + order.getPricingConfirmationNote().trim() + "\n";
    }

    private static String buildItemSummary(RecycleOrder order) {
        return "パソコン " + defaultZero(order.getPcCount()) + "台 / モニター " + defaultZero(order.getMonitorCount())
                + "台 / 小型家電ダンボール " + defaultZero(order.getSmallApplianceBoxCount()) + "箱";
    }

    private static int defaultZero(Integer value) {
        return value == null ? 0 : value;
    }

    private static String formatAmount(Integer amount) {
        if (amount == null) {
            return "未確定";
        }
        return String.format(java.util.Locale.JAPAN, "%,d円", amount);
    }

    private static String safeContactName(RecycleOrder order) {
        if (order.getCustomerNameKanji() == null || order.getCustomerNameKanji().isBlank()) {
            return "お客様";
        }
        return order.getCustomerNameKanji().trim();
    }

    private static String safeTimeSlot(RecycleOrder order) {
        if (order.getCollectionTimeSlot() == null || order.getCollectionTimeSlot().isBlank()) {
            return "";
        }
        return switch (order.getCollectionTimeSlot()) {
            case "unspecified" -> "指定なし";
            case "morning" -> "午前中";
            case "t12_14" -> "12時〜14時";
            case "t14_16" -> "14時〜16時";
            case "t16_18" -> "16時〜18時";
            case "t18_21" -> "18時〜21時";
            default -> order.getCollectionTimeSlot();
        };
    }

    private static String formatDataErasureOption(String code) {
        if (code == null || code.isBlank()) {
            return "未指定";
        }
        return switch (code) {
            case "self_erase_free" -> "ご自身で事前に消去する";
            case "full_service_paid" -> "おまかせ消去サービスを利用";
            default -> code;
        };
    }

    private static String normalizeBaseUrl(String value) {
        if (value == null || value.isBlank()) {
            return "http://localhost:5173";
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}