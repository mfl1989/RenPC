package com.recycle.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

/**
 * 申込通知メール設定。
 */
@Data
@Component
@ConfigurationProperties(prefix = "notification.mail")
public class NotificationMailProperties {

    private boolean enabled;
    private String from;
    private String replyTo;
    private String publicBaseUrl = "http://localhost:5173";
}