package com.recycle.controller;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.recycle.common.ApiResponse;
import com.recycle.dto.OrderLookupRequestDTO;
import com.recycle.dto.OrderLookupResponseDTO;
import com.recycle.dto.OrderStatusUpdateRequestDTO;
import com.recycle.dto.OrderSubmitRequestDTO;
import com.recycle.dto.OrderSubmitResponseDTO;
import com.recycle.service.OrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 回収申込 API および管理向け注文一覧。
 */
@RestController
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/api/orders")
    public ApiResponse<OrderSubmitResponseDTO> submit(@Valid @RequestBody OrderSubmitRequestDTO body) {
        OrderSubmitResponseDTO data = orderService.submitOrder(body);
        return ApiResponse.ok("成功", data);
    }

    @PostMapping("/api/orders/lookup")
    public ApiResponse<OrderLookupResponseDTO> lookup(@Valid @RequestBody OrderLookupRequestDTO body) {
        OrderLookupResponseDTO data = orderService.lookupOrder(body.getOrderId(), body.getEmail());
        return ApiResponse.ok("成功", data);
    }

    /**
     * 管理画面：注文ステータス更新（楽観的ロック対応）。
     */
    @PutMapping("/api/admin/orders/{id}/status")
    public ApiResponse<Void> updateAdminOrderStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody OrderStatusUpdateRequestDTO body) {
        orderService.updateAdminOrderStatus(id, body);
        return ApiResponse.ok("成功", null);
    }
}
