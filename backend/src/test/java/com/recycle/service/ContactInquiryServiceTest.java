package com.recycle.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.recycle.dto.ContactInquirySubmitRequestDTO;
import com.recycle.dto.ContactInquirySubmitResponseDTO;
import com.recycle.entity.ContactInquiry;
import com.recycle.repository.ContactInquiryRepository;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class ContactInquiryServiceTest {

    @Mock
    private ContactInquiryRepository contactInquiryRepository;

    @Mock
    private ContactInquiryNotificationService contactInquiryNotificationService;

    private ContactInquiryService contactInquiryService;

    @BeforeEach
    void setUp() {
        contactInquiryService = new ContactInquiryService(contactInquiryRepository, contactInquiryNotificationService);
    }

    @Test
    void submit_persistsInquiryAndSendsNotifications() {
        ContactInquirySubmitRequestDTO dto = ContactInquirySubmitRequestDTO.builder()
                .name("山田 太郎")
                .email("Demo@Example.com")
                .category("status")
                .orderId("12345")
                .message("申込状況を確認したいので折り返しをお願いします。")
                .privacyConsent(true)
                .build();

        ContactInquiry saved = ContactInquiry.builder()
                .id(12L)
                .name("山田 太郎")
                .email("demo@example.com")
                .category("status")
                .orderReference("12345")
                .message("申込状況を確認したいので折り返しをお願いします。")
                .privacyConsented(true)
                .createdAt(Instant.parse("2026-04-17T01:00:00Z"))
                .build();

        when(contactInquiryRepository.save(any(ContactInquiry.class))).thenReturn(saved);

        ContactInquirySubmitResponseDTO result = contactInquiryService.submit(dto);

        assertEquals("CI0000000012", result.getInquiryId());
        assertEquals(Instant.parse("2026-04-17T01:00:00Z"), result.getCreatedAt());
        verify(contactInquiryNotificationService).sendCustomerReceipt(saved);
        verify(contactInquiryNotificationService).sendAdminNotification(saved);
    }

    @Test
    void submit_setsDefaultInquiryStatus() {
        ContactInquirySubmitRequestDTO dto = ContactInquirySubmitRequestDTO.builder()
                .name("山田 太郎")
                .email("Demo@Example.com")
                .category("status")
                .message("申込状況を確認したいので折り返しをお願いします。")
                .privacyConsent(true)
                .build();

        when(contactInquiryRepository.save(any(ContactInquiry.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ContactInquirySubmitResponseDTO result = contactInquiryService.submit(dto);

        assertEquals("CI0000000000", result.getInquiryId());
        verify(contactInquiryRepository).save(any(ContactInquiry.class));
    }
}