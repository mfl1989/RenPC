package com.recycle.dto;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderDetailResponseDTO {
    private Long orderId;
    private Long version;
    private String orderStatus;
    private String collectionDate;
    private String collectionTimeSlot;
    private Integer totalAmount;
    private String createdAt;
    private String lastUpdatedAt;

    private Integer pcCount;
    private Integer monitorCount;
    private Integer smallApplianceBoxCount;
    private String dataErasureOption;
    private boolean cardboardDeliveryRequested;

    private String customerNameKanji;
    private String customerNameKana;
    private String postalCode;
    private String prefecture;
    private String city;
    private String addressLine1;
    private String addressLine2;
    private String phone;
    private String email;
    private String customerNote;
    private String internalNote;
    private List<OrderInternalNoteHistoryResponseDTO> internalNoteHistories;
    private List<OrderStatusHistoryResponseDTO> statusHistories;
}