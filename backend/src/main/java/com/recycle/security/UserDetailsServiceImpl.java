package com.recycle.security;

import com.recycle.entity.User;
import com.recycle.repository.UserRepository;
import com.recycle.security.admin.AdminAuthProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * DB ユーザーおよび MVP 管理者（application.yml）の認証情報を読み込む。
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;
    private final AdminAuthProperties adminAuthProperties;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        if (email == null || email.isBlank()) {
            throw new UsernameNotFoundException("メールアドレスが未指定です。");
        }

        String trimmed = email.trim();

        // MVP: 設定ファイルの管理者 ID（ユーザー名）と一致する場合は DB に依存しない ADMIN
        if (adminAuthProperties.getUsername() != null
                && adminAuthProperties.getUsername().equals(trimmed)) {
            return org.springframework.security.core.userdetails.User.builder()
                    .username(trimmed)
                    .password("{noop}unused")
                    .authorities("ROLE_ADMIN")
                    .accountExpired(false)
                    .accountLocked(false)
                    .credentialsExpired(false)
                    .disabled(false)
                    .build();
        }

        User user =
                userRepository
                        .findByEmail(trimmed)
                        .orElseThrow(
                                () ->
                                        new UsernameNotFoundException(
                                                "指定されたメールアドレスのユーザーが見つかりません。"));

        String rawRole =
                user.getRole() == null || user.getRole().isBlank() ? "USER" : user.getRole().trim();
        String authority = rawRole.startsWith("ROLE_") ? rawRole : "ROLE_" + rawRole;

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(authority)
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }
}
