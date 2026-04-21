package com.recycle.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Properties;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;

import com.recycle.config.NotificationMailProperties;
import com.recycle.entity.Contact;
import com.recycle.entity.RecycleOrder;
import com.recycle.enums.OrderStatus;

import jakarta.mail.Message;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class OrderNotificationServiceTest {

    @Mock
    private ObjectProvider<JavaMailSender> mailSenderProvider;

    @Mock
    private JavaMailSender mailSender;

    private NotificationMailProperties properties;
    private OrderNotificationService orderNotificationService;

    @BeforeEach
    void setUp() {
        properties = new NotificationMailProperties();
        properties.setEnabled(true);
        properties.setFrom("no-reply@renpc.local");
        properties.setFromName("RenPC");
        properties.setReplyTo("support@renpc.local");
        properties.setCompanyName("RenPC");
        properties.setSupportDeskName("RenPCサポート窓口");
        properties.setSupportHours("平日 10:00〜17:00");
        properties.setPublicBaseUrl("http://localhost:5173");

        orderNotificationService = new OrderNotificationService(mailSenderProvider, properties);
    }

    @Test
    void sendOrderPricingConfirmed_sendsMailWithPricingDetails() throws Exception {
        RecycleOrder order = buildOrder();
        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSenderProvider.getIfAvailable()).thenReturn(mailSender);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        orderNotificationService.sendOrderPricingConfirmed(
                order,
                "受付済",
                "正式料金が確定しました。注文照会ページで金額をご確認いただけます。");

        ArgumentCaptor<MimeMessage> messageCaptor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender).send(messageCaptor.capture());

        MimeMessage sentMessage = messageCaptor.getValue();
        assertEquals("【RenPC】正式料金確定のお知らせ", sentMessage.getSubject());
        assertEquals("test@example.com", sentMessage.getRecipients(Message.RecipientType.TO)[0].toString());

        String body = sentMessage.getContent().toString();
        assertTrue(body.contains("お申し込みの正式料金が確定しました。内容は以下のとおりです。"));
        assertTrue(body.contains("正式料金: 3,550円"));
        assertTrue(body.contains("料金確定メモ: 到着品の確認が完了したため、正式料金を確定しました。"));
        assertTrue(body.contains("個別案内: 金額差分についてご不明な点があればご連絡ください。"));
        assertTrue(body.contains("照会ページ: http://localhost:5173/orders/lookup"));
        assertTrue(body.contains("返信先メールアドレス: support@renpc.local"));
    }

    @Test
    void sendOrderPricingConfirmed_doesNotSendWhenDisabled() {
        RecycleOrder order = buildOrder();
        properties.setEnabled(false);

        orderNotificationService.sendOrderPricingConfirmed(
                order,
                "受付済",
                "正式料金が確定しました。注文照会ページで金額をご確認いただけます。");

        verify(mailSenderProvider, never()).getIfAvailable();
        verify(mailSender, never()).send(org.mockito.ArgumentMatchers.any(MimeMessage.class));
    }

    private static RecycleOrder buildOrder() {
        Contact contact = Contact.builder()
                .id(10L)
                .email("test@example.com")
                .name("田中一郎")
                .build();

        return RecycleOrder.builder()
                .id(1L)
                .contact(contact)
                .orderStatus(OrderStatus.RECEIVED)
                .collectionDate(LocalDate.of(2026, 4, 20))
                .collectionTimeSlot("t14_16")
                .totalAmount(3000)
                .finalAmount(3550)
                .pcCount(1)
                .monitorCount(2)
                .smallApplianceBoxCount(1)
                .dataErasureOption("full_service_paid")
                .cardboardDeliveryRequested(true)
                .customerNameKanji("田中一郎")
                .email("test@example.com")
                .customerNote("金額差分についてご不明な点があればご連絡ください。")
                .pricingConfirmationNote("到着品の確認が完了したため、正式料金を確定しました。")
                .createdAt(Instant.parse("2026-04-15T00:30:00Z"))
                .updatedAt(Instant.parse("2026-04-15T00:30:00Z"))
                .build();
    }
}