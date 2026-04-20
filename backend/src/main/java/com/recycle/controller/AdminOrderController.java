package com.recycle.controller;

import java.nio.charset.StandardCharsets;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.recycle.common.ApiResponse;
import com.recycle.dto.OrderDetailResponseDTO;
import com.recycle.dto.OrderListPageDTO;
import com.recycle.dto.OrderPricingConfirmRequestDTO;
import com.recycle.service.OrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 管理画面の注文一覧・詳細・CSV 出力 API。
 */
@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public ApiResponse<OrderListPageDTO> getOrders(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "createdAt", direction = Direction.DESC) Pageable pageable) {
        OrderListPageDTO response = orderService.getAdminOrderList(keyword, pageable);
        return ApiResponse.ok("成功", response);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportOrders(@RequestParam(required = false) String keyword) {
        String csvData = orderService.exportOrdersToCsv(keyword);
        byte[] csvBytes = csvData.getBytes(StandardCharsets.UTF_8);
        String filename = "orders_" + System.currentTimeMillis() + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }

    @GetMapping("/{id}")
    public ApiResponse<OrderDetailResponseDTO> getOrderDetail(@PathVariable Long id) {
        OrderDetailResponseDTO detail = orderService.getAdminOrderDetail(id);
        return ApiResponse.ok("成功", detail);
    }

    @PutMapping("/{id}/pricing")
    public ApiResponse<Void> confirmPricing(@PathVariable Long id,
            @Valid @RequestBody OrderPricingConfirmRequestDTO body) {
        orderService.confirmAdminOrderPricing(id, body);
        return ApiResponse.ok("成功", null);
    }
}