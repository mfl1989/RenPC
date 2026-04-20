package com.recycle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 管理画面向け問い合わせ一覧の1行。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactInquiryListResponseDTO {

    private Long inquiryId;
    private String name;
    private String email;
    private String category;
    private boolean changeRequest;
    private String changeRequestTopic;
    private String inquiryStatus;
    private String assignedTo;
    private String orderReference;
    private String createdAt;
}