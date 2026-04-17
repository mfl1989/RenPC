package com.recycle.dto;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ご相談フォーム送信結果。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactInquirySubmitResponseDTO {

    private String inquiryId;
    private Instant createdAt;
}