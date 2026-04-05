package com.recycle.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ページネーション付き注文一覧（docs の標準 data 内フィールド）。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderListPageDTO {

    private List<OrderListResponseDTO> content;
    private int totalPages;
    private long totalElements;
}
