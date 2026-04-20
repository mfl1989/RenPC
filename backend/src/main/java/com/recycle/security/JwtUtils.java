package com.recycle.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

/**
 * JWT の生成・解析・検証を行うユーティリティ。
 */
@Component
@Slf4j
public class JwtUtils {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    /**
     * 認証情報から JWT を生成する。
     */
    public String generateJwtToken(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("認証ユーザー名が取得できません");
        }

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(username)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * JWT からユーザー名（subject）を取得する。
     */
    public String getUserNameFromJwtToken(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("JWT が未指定です");
        }

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    /**
     * JWT が有効かどうかを検証する。
     */
    public boolean validateJwtToken(String authToken) {
        if (authToken == null || authToken.isBlank()) {
            log.error("JWT 検証失敗: トークンが未指定です");
            return false;
        }

        try {
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(authToken);
            return true;
        } catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException e) {
            log.error("JWT 検証失敗: 署名が不正または形式が不正です。type={}", e.getClass().getSimpleName());
        } catch (ExpiredJwtException e) {
            log.error("JWT 検証失敗: 有効期限切れです");
        } catch (UnsupportedJwtException e) {
            log.error("JWT 検証失敗: 非対応トークンです");
        } catch (IllegalArgumentException e) {
            log.error("JWT 検証失敗: クレーム文字列が空です");
        } catch (JwtException e) {
            log.error("JWT 検証失敗: 予期しないJWT例外です。type={}", e.getClass().getSimpleName());
        }
        return false;
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(jwtSecret);
        } catch (RuntimeException ignored) {
            keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
