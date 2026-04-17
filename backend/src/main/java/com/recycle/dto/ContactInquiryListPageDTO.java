package com.recycle.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ページネーション付き問い合わせ一覧。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactInquiryListPageDTO {

    private List<ContactInquiryListResponseDTO> content;
    private int totalPages;
    private long totalElements;
    private ContactInquiryStatusSummaryDTO summary;
}