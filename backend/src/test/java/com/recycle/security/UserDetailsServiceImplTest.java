package com.recycle.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.recycle.security.admin.AdminAuthProperties;

class UserDetailsServiceImplTest {

    private UserDetailsServiceImpl userDetailsService;

    @BeforeEach
    void setUp() {
        AdminAuthProperties properties = new AdminAuthProperties();
        properties.setUsername("admin");
        userDetailsService = new UserDetailsServiceImpl(properties);
    }

    @Test
    void loadUserByUsername_returnsAdminPrincipal() {
        UserDetails userDetails = userDetailsService.loadUserByUsername("admin");

        assertEquals("admin", userDetails.getUsername());
        assertTrue(
                userDetails.getAuthorities().stream()
                        .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority())));
    }

    @Test
    void loadUserByUsername_rejectsNonAdminPrincipal() {
        assertThrows(
                UsernameNotFoundException.class,
                () -> userDetailsService.loadUserByUsername("customer@example.com"));
    }
}