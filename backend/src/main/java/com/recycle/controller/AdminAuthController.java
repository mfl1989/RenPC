package com.recycle.controller;

import com.recycle.common.ApiResponse;
import com.recycle.dto.AdminLoginRequestDTO;
import com.recycle.dto.AdminLoginResponseDTO;
import com.recycle.service.AdminAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 管理者認証 API（MVP）。
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    /**
     * POST /api/admin/login
     */
    @PostMapping("/login")
    public ApiResponse<AdminLoginResponseDTO> login(
            @Valid @RequestBody AdminLoginRequestDTO body) {
        String token = adminAuthService.login(body.getUsername(), body.getPassword());
        return ApiResponse.ok("成功", AdminLoginResponseDTO.builder().token(token).build());
    }
}

