package com.recycle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 問い合わせ対応状況の件数サマリー。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactInquiryStatusSummaryDTO {

    private long openCount;
    private long inProgressCount;
    private long resolvedCount;
}