package com.recycle.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.recycle.security.web.JsonAccessDeniedHandler;
import com.recycle.security.web.JsonAuthenticationEntryPoint;

import lombok.RequiredArgsConstructor;

/**
 * Spring Security 設定（JWT / 認可 / CORS）。
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final JsonAuthenticationEntryPoint jsonAuthenticationEntryPoint;
        private final JsonAccessDeniedHandler jsonAccessDeniedHandler;

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration)
                        throws Exception {
                return configuration.getAuthenticationManager();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration cors = new CorsConfiguration();
                cors.setAllowedOrigins(
                                List.of("http://localhost:5173", "http://localhost:5174"));
                cors.setAllowedMethods(
                                List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                cors.setAllowedHeaders(List.of("*"));
                cors.setAllowCredentials(true);
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", cors);
                return source;
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http.cors(Customizer.withDefaults())
                                .csrf(AbstractHttpConfigurer::disable)
                                .httpBasic(AbstractHttpConfigurer::disable)
                                .formLogin(AbstractHttpConfigurer::disable)
                                .sessionManagement(
                                                sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(
                                                auth -> auth.requestMatchers(HttpMethod.POST, "/api/auth/**")
                                                                .permitAll()
                                                                .requestMatchers(HttpMethod.POST, "/api/admin/login")
                                                                .permitAll()
                                                                // 公開 API（申込・郵便番号検索・疎通）
                                                                .requestMatchers(HttpMethod.POST, "/api/orders")
                                                                .permitAll()
                                                                .requestMatchers(HttpMethod.POST, "/api/orders/lookup")
                                                                .permitAll()
                                                                .requestMatchers("/api/zip/**")
                                                                .permitAll()
                                                                .requestMatchers(HttpMethod.GET, "/api/hello")
                                                                .permitAll()
                                                                .requestMatchers("/api/admin/**")
                                                                .hasRole("ADMIN")
                                                                .anyRequest()
                                                                .authenticated())
                                .exceptionHandling(
                                                ex -> ex.authenticationEntryPoint(jsonAuthenticationEntryPoint)
                                                                .accessDeniedHandler(jsonAccessDeniedHandler))
                                .addFilterBefore(
                                                jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }
}
