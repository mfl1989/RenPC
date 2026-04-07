package com.recycle.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
}

