package com.recycle.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 管理者による注文ステータス更新リクエスト。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusUpdateRequestDTO {

    @NotBlank(message = "ステータスを指定してください")
    private String status;

    @NotNull(message = "version は必須です")
    private Long version;

    @Size(max = 1000, message = "個別案内は1000文字以内で入力してください")
    private String customerNote;

    @Size(max = 1000, message = "内部メモは1000文字以内で入力してください")
    private String internalNote;

    @Size(max = 500, message = "ステータス変更理由は500文字以内で入力してください")
    private String statusChangeReason;
}
