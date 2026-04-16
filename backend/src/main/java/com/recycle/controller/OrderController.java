package com.recycle.controller;

import com.recycle.common.ApiResponse;
import com.recycle.dto.OrderStatusUpdateRequestDTO;
import com.recycle.dto.OrderSubmitRequestDTO;
import com.recycle.dto.OrderSubmitResponseDTO;
import com.recycle.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

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
