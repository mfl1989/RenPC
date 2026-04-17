package com.recycle.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 管理画面で問い合わせ対応状況を更新するリクエスト。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactInquiryStatusUpdateRequestDTO {

    @NotBlank(message = "ステータスを指定してください")
    @Pattern(regexp = "^(OPEN|IN_PROGRESS|RESOLVED)$", message = "ステータスの値が不正です")
    private String status;

    @NotNull(message = "version は必須です")
    private Long version;

    @Size(max = 100, message = "担当者名は100文字以内で入力してください")
    private String assignedTo;

    @Size(max = 1000, message = "管理メモは1000文字以内で入力してください")
    private String adminNote;
}