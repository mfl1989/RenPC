package com.recycle.security.admin;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * application.yml の admin.* をバインドするプロパティ。
 *
 * MVP ではユーザー名・パスワードを平文で保持しません（起動時に BCrypt ハッシュ化してメモリ内で照合）。
 */
@Data
@Component
@ConfigurationProperties(prefix = "admin")
public class AdminAuthProperties {

    private String username;

    /**
     * 起動時に BCrypt ハッシュへ変換する元データ。
     * 認証後はクリアする。
     */
    private String password;
}

