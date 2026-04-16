package com.recycle.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.recycle.security.admin.AdminAuthProperties;

import lombok.RequiredArgsConstructor;

/**
 * 管理画面用 JWT の subject を解決するための UserDetailsService。
 * 申込者の連絡先レコードは認証主体として扱わない。
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

        private static final String JWT_SUBJECT_PLACEHOLDER_PASSWORD = "{noop}jwt-subject-only";

        private final AdminAuthProperties adminAuthProperties;

        @Override
        public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
                if (username == null || username.isBlank()) {
                        throw new UsernameNotFoundException("ユーザー名が未指定です。");
                }

                String trimmed = username.trim();
                String adminUsername = adminAuthProperties.getUsername();
                if (adminUsername == null || !adminUsername.equals(trimmed)) {
                        throw new UsernameNotFoundException("指定された管理者が見つかりません。");
                }

                return org.springframework.security.core.userdetails.User.builder()
                                .username(trimmed)
                                .password(JWT_SUBJECT_PLACEHOLDER_PASSWORD)
                                .authorities("ROLE_ADMIN")
                                .accountExpired(false)
                                .accountLocked(false)
                                .credentialsExpired(false)
                                .disabled(false)
                                .build();
        }
}
