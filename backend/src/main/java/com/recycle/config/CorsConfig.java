package com.recycle.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * ローカル開発時のフロント（Vite）からの CORS を許可する。
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    /** Vite 既定ポート（npm run dev） */
    private static final String VITE_DEFAULT_ORIGIN = "http://localhost:5173";

    /** 別名スクリプト用（npm run dev:recycle） */
    private static final String VITE_RECYCLE_ORIGIN = "http://localhost:5174";

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(VITE_DEFAULT_ORIGIN, VITE_RECYCLE_ORIGIN)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
