package com.recycle.service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.recycle.dto.ContactInquiryDetailResponseDTO;
import com.recycle.dto.ContactInquiryListPageDTO;
import com.recycle.dto.ContactInquiryListResponseDTO;
import com.recycle.dto.ContactInquiryStatusSummaryDTO;
import com.recycle.dto.ContactInquiryStatusUpdateRequestDTO;
import com.recycle.dto.ContactInquirySubmitRequestDTO;
import com.recycle.dto.ContactInquirySubmitResponseDTO;
import com.recycle.entity.ContactInquiry;
import com.recycle.exception.ResourceNotFoundException;
import com.recycle.repository.ContactInquiryRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * ご相談フォームの受付処理。
 */
@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class ContactInquiryService {

    private static final ZoneId JST = ZoneId.of("Asia/Tokyo");
    private static final DateTimeFormatter CREATED_AT_FORMAT = DateTimeFormatter.ofPattern("uuuu/MM/dd HH:mm")
            .withZone(JST);

    private final ContactInquiryRepository contactInquiryRepository;
    private final ContactInquiryNotificationService contactInquiryNotificationService;

    @Transactional
    public ContactInquirySubmitResponseDTO submit(ContactInquirySubmitRequestDTO dto) {
        ContactInquiry inquiry = ContactInquiry.builder()
                .name(trimToNull(dto.getName()))
                .email(normalizeEmail(dto.getEmail()))
                .category(trimToNull(dto.getCategory()))
                .orderReference(trimToBlankAsNull(dto.getOrderId()))
                .message(trimToNull(dto.getMessage()))
                .privacyConsented(dto.isPrivacyConsent())
                .build();

        ContactInquiry saved = Objects.requireNonNull(contactInquiryRepository.save(inquiry));

        contactInquiryNotificationService.sendCustomerReceipt(saved);
        contactInquiryNotificationService.sendAdminNotification(saved);

        log.info("問い合わせを受け付けました。inquiryId={}", saved.getId());

        return ContactInquirySubmitResponseDTO.builder()
                .inquiryId(ContactInquiryNotificationService.formatInquiryId(saved.getId()))
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public ContactInquiryListPageDTO getAdminInquiryList(String keyword, String status, String assignedTo,
            Pageable pageable) {
        String normalizedKeyword = trimToNull(keyword);
        String normalizedStatus = normalizeFilterStatus(status);
        String normalizedAssignedTo = trimToNull(assignedTo);
        Page<ContactInquiry> page = contactInquiryRepository.findAllWithKeyword(normalizedKeyword, normalizedStatus,
                normalizedAssignedTo, pageable);
        List<ContactInquiryListResponseDTO> content = page.getContent().stream().map(this::toListResponse).toList();

        return ContactInquiryListPageDTO.builder()
                .content(content)
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .summary(buildStatusSummary())
                .build();
    }

    @Transactional(readOnly = true)
    public ContactInquiryDetailResponseDTO getAdminInquiryDetail(Long inquiryId) {
        ContactInquiry inquiry = contactInquiryRepository.findById(Objects.requireNonNull(inquiryId))
                .orElseThrow(() -> new ResourceNotFoundException("指定された問い合わせが存在しません"));

        return ContactInquiryDetailResponseDTO.builder()
                .inquiryId(inquiry.getId())
                .version(inquiry.getVersion())
                .name(inquiry.getName())
                .email(inquiry.getEmail())
                .category(formatCategory(inquiry.getCategory()))
                .inquiryStatus(formatStatus(inquiry.getInquiryStatus()))
                .assignedTo(inquiry.getAssignedTo())
                .orderReference(inquiry.getOrderReference())
                .message(inquiry.getMessage())
                .adminNote(inquiry.getAdminNote())
                .privacyConsented(inquiry.isPrivacyConsented())
                .createdAt(formatDateTime(inquiry.getCreatedAt()))
                .lastUpdatedAt(formatDateTime(inquiry.getUpdatedAt()))
                .handledAt(formatDateTime(inquiry.getHandledAt()))
                .build();
    }

    @Transactional
    public void updateAdminInquiryStatus(Long inquiryId, ContactInquiryStatusUpdateRequestDTO dto) {
        ContactInquiry inquiry = contactInquiryRepository.findById(Objects.requireNonNull(inquiryId))
                .orElseThrow(() -> new ResourceNotFoundException("指定された問い合わせが存在しません"));

        if (dto.getVersion() == null || !dto.getVersion().equals(inquiry.getVersion())) {
            throw new ObjectOptimisticLockingFailureException(ContactInquiry.class, inquiryId);
        }

        String nextStatus = normalizeStatus(dto.getStatus());
        inquiry.setInquiryStatus(nextStatus);
        inquiry.setAssignedTo(trimToNull(dto.getAssignedTo()));
        inquiry.setAdminNote(trimToNull(dto.getAdminNote()));
        inquiry.setHandledAt("RESOLVED".equals(nextStatus) ? Instant.now() : null);

        ContactInquiry saved = contactInquiryRepository.save(inquiry);
        log.info("問い合わせ対応状況を更新しました。inquiryId={}, status={}, operator={}", saved.getId(), saved.getInquiryStatus(),
                currentOperator());
    }

    private ContactInquiryListResponseDTO toListResponse(ContactInquiry inquiry) {
        return ContactInquiryListResponseDTO.builder()
                .inquiryId(inquiry.getId())
                .name(inquiry.getName())
                .email(inquiry.getEmail())
                .category(formatCategory(inquiry.getCategory()))
                .inquiryStatus(formatStatus(inquiry.getInquiryStatus()))
                .assignedTo(inquiry.getAssignedTo())
                .orderReference(inquiry.getOrderReference())
                .createdAt(formatDateTime(inquiry.getCreatedAt()))
                .build();
    }

    private ContactInquiryStatusSummaryDTO buildStatusSummary() {
        return ContactInquiryStatusSummaryDTO.builder()
                .openCount(contactInquiryRepository.countByInquiryStatus("OPEN"))
                .inProgressCount(contactInquiryRepository.countByInquiryStatus("IN_PROGRESS"))
                .resolvedCount(contactInquiryRepository.countByInquiryStatus("RESOLVED"))
                .build();
    }

    private static String formatDateTime(Instant value) {
        if (value == null) {
            return "";
        }
        return CREATED_AT_FORMAT.format(value);
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

    private static String formatStatus(String status) {
        if (status == null || status.isBlank()) {
            return "未対応";
        }
        return switch (status) {
            case "OPEN" -> "未対応";
            case "IN_PROGRESS" -> "対応中";
            case "RESOLVED" -> "対応完了";
            default -> status;
        };
    }

    private static String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("ステータスを指定してください");
        }
        String normalized = status.trim().toUpperCase(Locale.ROOT);
        if ("OPEN".equals(normalized) || "IN_PROGRESS".equals(normalized) || "RESOLVED".equals(normalized)) {
            return normalized;
        }
        throw new IllegalArgumentException("ステータスの値が不正です");
    }

    private static String normalizeFilterStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        return normalizeStatus(status);
    }

    private static String currentOperator() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return "system";
        }
        return authentication.getName();
    }

    private static String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase();
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static String trimToBlankAsNull(String value) {
        return trimToNull(value);
    }
}