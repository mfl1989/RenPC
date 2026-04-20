package com.recycle.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.recycle.dto.ContactInquiryDetailResponseDTO;
import com.recycle.dto.ContactInquiryListPageDTO;
import com.recycle.dto.ContactInquiryStatusUpdateRequestDTO;
import com.recycle.entity.ContactInquiry;
import com.recycle.exception.ResourceNotFoundException;
import com.recycle.repository.ContactInquiryRepository;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class ContactInquiryAdminServiceTest {

        @Mock
        private ContactInquiryRepository contactInquiryRepository;

        @Mock
        private ContactInquiryNotificationService contactInquiryNotificationService;

        private ContactInquiryService contactInquiryService;

        @BeforeEach
        void setUp() {
                contactInquiryService = new ContactInquiryService(contactInquiryRepository,
                                contactInquiryNotificationService);
                SecurityContextHolder.clearContext();
        }

        @Test
        void getAdminInquiryList_formatsRows() {
                Pageable pageable = Pageable.ofSize(20);
                ContactInquiry inquiry = ContactInquiry.builder()
                                .id(3L)
                                .name("山田 太郎")
                                .email("demo@example.com")
                                .category("status")
                                .inquiryStatus("OPEN")
                                .assignedTo("田中")
                                .orderReference("12345")
                                .message("進捗を確認したいです。")
                                .createdAt(Instant.parse("2026-04-17T01:30:00Z"))
                                .build();
                when(contactInquiryRepository.countByInquiryStatus("OPEN")).thenReturn(2L);
                when(contactInquiryRepository.countByInquiryStatus("IN_PROGRESS")).thenReturn(1L);
                when(contactInquiryRepository.countByInquiryStatus("RESOLVED")).thenReturn(4L);
                when(contactInquiryRepository.findAllWithKeyword(eq("demo"), eq("OPEN"), eq("田中"), eq(false),
                                eq(pageable)))
                                .thenReturn(new PageImpl<>(java.util.List.of(inquiry), pageable, 1));

                ContactInquiryListPageDTO result = contactInquiryService.getAdminInquiryList("demo", "OPEN", "田中",
                                false, pageable);

                assertEquals(1, result.getContent().size());
                assertEquals(3L, result.getContent().get(0).getInquiryId());
                assertEquals("申込状況について", result.getContent().get(0).getCategory());
                assertEquals("未対応", result.getContent().get(0).getInquiryStatus());
                assertEquals("田中", result.getContent().get(0).getAssignedTo());
                assertEquals("2026/04/17 10:30", result.getContent().get(0).getCreatedAt());
                assertEquals(2L, result.getSummary().getOpenCount());
                assertEquals(1L, result.getSummary().getInProgressCount());
                assertEquals(4L, result.getSummary().getResolvedCount());
        }

        @Test
        void getAdminInquiryList_acceptsEmptyStatusFilter() {
                Pageable pageable = Pageable.ofSize(20);
                when(contactInquiryRepository.countByInquiryStatus("OPEN")).thenReturn(0L);
                when(contactInquiryRepository.countByInquiryStatus("IN_PROGRESS")).thenReturn(0L);
                when(contactInquiryRepository.countByInquiryStatus("RESOLVED")).thenReturn(0L);
                when(contactInquiryRepository.findAllWithKeyword(eq(null), eq(null), eq(null), eq(false),
                                eq(pageable)))
                                .thenReturn(new PageImpl<>(java.util.List.of(), pageable, 0));

                ContactInquiryListPageDTO result = contactInquiryService.getAdminInquiryList(null, null, null,
                                false, pageable);

                assertEquals(0, result.getContent().size());
        }

        @Test
        void getAdminInquiryList_normalizesStatusFilter() {
                Pageable pageable = Pageable.ofSize(20);
                when(contactInquiryRepository.countByInquiryStatus("OPEN")).thenReturn(0L);
                when(contactInquiryRepository.countByInquiryStatus("IN_PROGRESS")).thenReturn(0L);
                when(contactInquiryRepository.countByInquiryStatus("RESOLVED")).thenReturn(0L);
                when(contactInquiryRepository.findAllWithKeyword(eq(null), eq("IN_PROGRESS"), eq(null), eq(false),
                                eq(pageable)))
                                .thenReturn(new PageImpl<>(java.util.List.of(), pageable, 0));

                ContactInquiryListPageDTO result = contactInquiryService.getAdminInquiryList(null, "in_progress", null,
                                false, pageable);

                assertEquals(0, result.getContent().size());
        }

        @Test
        void getAdminInquiryList_marksChangeRequestRows() {
                Pageable pageable = Pageable.ofSize(20);
                ContactInquiry inquiry = ContactInquiry.builder()
                                .id(8L)
                                .name("山田 太郎")
                                .email("demo@example.com")
                                .category("schedule")
                                .inquiryStatus("OPEN")
                                .message("変更種別: 回収希望日の変更\n対象注文: 0000000008\n\nご依頼内容:\n4月25日に変更したいです。")
                                .createdAt(Instant.parse("2026-04-17T01:30:00Z"))
                                .build();
                when(contactInquiryRepository.countByInquiryStatus("OPEN")).thenReturn(0L);
                when(contactInquiryRepository.countByInquiryStatus("IN_PROGRESS")).thenReturn(0L);
                when(contactInquiryRepository.countByInquiryStatus("RESOLVED")).thenReturn(0L);
                when(contactInquiryRepository.findAllWithKeyword(eq(null), eq(null), eq(null), eq(true), eq(pageable)))
                                .thenReturn(new PageImpl<>(java.util.List.of(inquiry), pageable, 1));

                ContactInquiryListPageDTO result = contactInquiryService.getAdminInquiryList(null, null, null,
                                true, pageable);

                assertEquals(true, result.getContent().get(0).isChangeRequest());
                assertEquals("回収希望日の変更", result.getContent().get(0).getChangeRequestTopic());
        }

        @Test
        void getAdminInquiryDetail_returnsFormattedDetail() {
                ContactInquiry inquiry = ContactInquiry.builder()
                                .id(5L)
                                .name("佐藤 花子")
                                .email("hanako@example.com")
                                .category("other")
                                .inquiryStatus("RESOLVED")
                                .assignedTo("佐藤")
                                .orderReference(null)
                                .message("詳細を確認したいです。")
                                .adminNote("電話連絡済み")
                                .privacyConsented(true)
                                .createdAt(Instant.parse("2026-04-17T02:00:00Z"))
                                .updatedAt(Instant.parse("2026-04-17T03:00:00Z"))
                                .handledAt(Instant.parse("2026-04-17T03:30:00Z"))
                                .build();
                when(contactInquiryRepository.findById(5L)).thenReturn(Optional.of(inquiry));

                ContactInquiryDetailResponseDTO result = contactInquiryService.getAdminInquiryDetail(5L);

                assertEquals(5L, result.getInquiryId());
                assertEquals("その他", result.getCategory());
                assertEquals("対応完了", result.getInquiryStatus());
                assertEquals("佐藤", result.getAssignedTo());
                assertEquals("電話連絡済み", result.getAdminNote());
                assertEquals("2026/04/17 11:00", result.getCreatedAt());
                assertEquals("2026/04/17 12:00", result.getLastUpdatedAt());
                assertEquals("2026/04/17 12:30", result.getHandledAt());
        }

        @Test
        void getAdminInquiryDetail_throwsWhenMissing() {
                when(contactInquiryRepository.findById(999L)).thenReturn(Optional.empty());

                assertThrows(ResourceNotFoundException.class, () -> contactInquiryService.getAdminInquiryDetail(999L));
        }

        @Test
        void updateAdminInquiryStatus_updatesFields() {
                SecurityContextHolder.getContext().setAuthentication(
                                new UsernamePasswordAuthenticationToken("admin", null, java.util.List.of()));
                ContactInquiry inquiry = ContactInquiry.builder()
                                .id(10L)
                                .version(1L)
                                .inquiryStatus("OPEN")
                                .build();
                ContactInquiryStatusUpdateRequestDTO request = ContactInquiryStatusUpdateRequestDTO.builder()
                                .status("RESOLVED")
                                .version(1L)
                                .assignedTo("山田")
                                .adminNote("メール返信済み")
                                .build();
                when(contactInquiryRepository.findById(10L)).thenReturn(Optional.of(inquiry));
                when(contactInquiryRepository.save(any(ContactInquiry.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));

                contactInquiryService.updateAdminInquiryStatus(10L, request);

                assertEquals("RESOLVED", inquiry.getInquiryStatus());
                assertEquals("山田", inquiry.getAssignedTo());
                assertEquals("メール返信済み", inquiry.getAdminNote());
                verify(contactInquiryRepository).save(inquiry);
        }

        @Test
        void updateAdminInquiryStatus_throwsOnVersionMismatch() {
                ContactInquiry inquiry = ContactInquiry.builder()
                                .id(10L)
                                .version(2L)
                                .inquiryStatus("OPEN")
                                .build();
                ContactInquiryStatusUpdateRequestDTO request = ContactInquiryStatusUpdateRequestDTO.builder()
                                .status("IN_PROGRESS")
                                .version(1L)
                                .build();
                when(contactInquiryRepository.findById(10L)).thenReturn(Optional.of(inquiry));

                assertThrows(ObjectOptimisticLockingFailureException.class,
                                () -> contactInquiryService.updateAdminInquiryStatus(10L, request));
        }
}