package com.recycle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 管理画面向けの注文ステータス更新履歴。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusHistoryResponseDTO {

    private Long historyId;
    private String previousStatus;
    private String newStatus;
    private String changedBy;
    private String changedAt;
    private String changeReason;
}