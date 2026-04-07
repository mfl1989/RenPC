package com.recycle.security.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recycle.common.ApiResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Spring Security の認証失敗（401）を統一 JSON（ApiResponse）で返す。
 */
@Component
@RequiredArgsConstructor
public class JsonAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException)
            throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");

        String message = "認証に失敗しました";
        if (authException instanceof BadCredentialsException) {
            message = "無効なトークンです";
        }

        ApiResponse<Void> body = ApiResponse.fail(401, message);
        objectMapper.writeValue(response.getWriter(), body);
    }
}

