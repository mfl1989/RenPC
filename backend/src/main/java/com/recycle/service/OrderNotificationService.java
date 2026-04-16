package com.recycle.service;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.recycle.config.NotificationMailProperties;
import com.recycle.entity.RecycleOrder;
import com.recycle.util.OrderIdFormatUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 申込受付・ステータス更新メールを送信する。
 * SMTP 未設定時はログのみで業務処理を継続する。
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderNotificationService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final NotificationMailProperties properties;

    public void sendOrderSubmitted(RecycleOrder order, String statusLabel, String progressSummary) {
        sendMail(
                order,
                "【RenPC】お申し込みを受け付けました",
                buildSubmittedBody(order, statusLabel, progressSummary));
    }

    public void sendOrderStatusUpdated(RecycleOrder order, String statusLabel, String progressSummary) {
        sendMail(
                order,
                "【RenPC】お申し込み状況を更新しました",
                buildStatusUpdatedBody(order, statusLabel, progressSummary));
    }

    private void sendMail(RecycleOrder order, String subject, String body) {
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
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(order.getEmail());
            message.setFrom(properties.getFrom());
            if (properties.getReplyTo() != null && !properties.getReplyTo().isBlank()) {
                message.setReplyTo(properties.getReplyTo());
            }
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("通知メールを送信しました。orderId={}", order.getId());
        } catch (Exception ex) {
            log.warn("通知メールの送信に失敗しました。orderId={}", order.getId(), ex);
        }
    }

    private String buildSubmittedBody(RecycleOrder order, String statusLabel, String progressSummary) {
        return safeContactName(order) + " 様\n\n"
                + "回収のお申し込みを受け付けました。\n\n"
                + commonBody(order, statusLabel, progressSummary)
                + "\n担当者が内容を確認後、メールまたはお電話でご連絡いたします。\n";
    }

    private String buildStatusUpdatedBody(RecycleOrder order, String statusLabel, String progressSummary) {
        return safeContactName(order) + " 様\n\n"
                + "お申し込み状況を更新しました。\n\n"
                + commonBody(order, statusLabel, progressSummary)
                + "\n最新状況は注文照会ページからも確認できます。\n";
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

    private static String buildCustomerNoteBlock(RecycleOrder order) {
        if (order.getCustomerNote() == null || order.getCustomerNote().isBlank()) {
            return "";
        }
        return "個別案内: " + order.getCustomerNote().trim() + "\n";
    }

    private static String buildItemSummary(RecycleOrder order) {
        return "パソコン " + defaultZero(order.getPcCount()) + "台 / モニター " + defaultZero(order.getMonitorCount())
                + "台 / 小型家電ダンボール " + defaultZero(order.getSmallApplianceBoxCount()) + "箱";
    }

    private static int defaultZero(Integer value) {
        return value == null ? 0 : value;
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
            case "none" -> "希望しない";
            case "self" -> "自分で消去予定";
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