package com.recycle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 管理画面向けの内部メモ履歴。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderInternalNoteHistoryResponseDTO {

    private Long historyId;
    private String previousNote;
    private String newNote;
    private String changedBy;
    private String changedAt;
}