package com.recycle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 管理画面向け注文一覧の1行分（Entity は返さない）。
 * 日付・日時はサービス層で JST 基準の表示用文字列に整形済み。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderListResponseDTO {

    private Long orderId;

    /** 申込時点の氏名（漢字） */
    private String userName;

    /** 申込時点の電話番号（保存形式のまま） */
    private String userPhone;

    /** 回収希望日（例: 2026年4月5日） */
    private String collectionDate;

    /** 回収希望時間帯の表示ラベル */
    private String collectionTime;

    /** {@link com.recycle.enums.OrderStatus#name()} */
    private String orderStatus;

    /** 日本円の最小通貨単位 */
    private Integer totalAmount;

    /** 申込日時（例: 2026/04/05 14:30） */
    private String createdAt;
}
