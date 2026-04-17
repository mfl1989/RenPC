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
    private String fromName;
    private String replyTo;
    private String contactAdminTo;
    private String companyName = "RenPC";
    private String supportDeskName = "RenPCサポート窓口";
    private String supportHours = "平日 10:00〜17:00";
    private String publicBaseUrl = "http://localhost:5173";
}