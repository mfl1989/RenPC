package com.recycle.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 管理者ログインリクエスト（POST /api/admin/login）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminLoginRequestDTO {

    @NotBlank(message = "管理者ユーザー名を入力してください")
    private String username;

    @NotBlank(message = "管理者パスワードを入力してください")
    private String password;
}

