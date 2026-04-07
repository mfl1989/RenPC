package com.recycle.service;

import com.recycle.security.JwtUtils;
import com.recycle.security.admin.AdminAuthProperties;
import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * 管理者ログイン認証（MVP）。
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminAuthService {

    private final AdminAuthProperties adminAuthProperties;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;

    private String adminUsername;
    private String adminPasswordHash;

    @PostConstruct
    void init() {
        this.adminUsername = adminAuthProperties.getUsername();
        String rawPassword = adminAuthProperties.getPassword();

        if (adminUsername == null || adminUsername.isBlank()) {
            throw new IllegalStateException("admin.username が未設定です");
        }
        if (rawPassword == null || rawPassword.isBlank()) {
            throw new IllegalStateException("admin.password が未設定です");
        }

        this.adminPasswordHash = passwordEncoder.encode(rawPassword);
        // 起動後の照合に不要な平文パスワード参照を消す
        adminAuthProperties.setPassword(null);

        log.info("管理者認証を初期化しました。username={}", adminUsername);
    }

    /**
     * 管理者資格情報の照合 → JWT 発行。
     */
    public String login(String username, String password) {
        if (!Objects.equals(username, adminUsername)) {
            throw new BadCredentialsException("認証に失敗しました");
        }
        if (password == null || !passwordEncoder.matches(password, adminPasswordHash)) {
            throw new BadCredentialsException("認証に失敗しました");
        }
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        adminUsername,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        return jwtUtils.generateJwtToken(authentication);
    }
}

