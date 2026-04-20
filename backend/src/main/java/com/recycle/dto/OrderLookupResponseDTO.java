package com.recycle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 申込者向け注文照会レスポンス。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderLookupResponseDTO {

    private Long orderId;
    private String contactName;
    private String email;
    private String orderStatusCode;
    private String orderStatus;
    private String progressSummary;
    private String collectionDate;
    private String collectionTimeSlot;
    private String createdAt;
    private String lastUpdatedAt;
    private Integer totalAmount;
    private Integer pcCount;
    private Integer monitorCount;
    private Integer smallApplianceBoxCount;
    private String dataErasureOptionLabel;
    private String cardboardDeliveryLabel;
    private String customerNote;
}