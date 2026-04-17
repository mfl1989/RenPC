package com.recycle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 管理画面向け問い合わせ詳細。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactInquiryDetailResponseDTO {

    private Long inquiryId;
    private Long version;
    private String name;
    private String email;
    private String category;
    private String inquiryStatus;
    private String assignedTo;
    private String orderReference;
    private String message;
    private String adminNote;
    private boolean privacyConsented;
    private String createdAt;
    private String lastUpdatedAt;
    private String handledAt;
}