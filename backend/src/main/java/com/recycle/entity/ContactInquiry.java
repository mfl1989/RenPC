package com.recycle.entity;

import java.time.Instant;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * ご相談フォームから受け付けた問い合わせ。
 */
@Entity
@Table(name = "contact_inquiries")
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@SQLDelete(sql = "UPDATE contact_inquiries SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
public class ContactInquiry extends BaseAuditEntity {

    @Column(name = "name", nullable = false, length = 60)
    private String name;

    @Column(name = "email", nullable = false, length = 320)
    private String email;

    @Column(name = "category", nullable = false, length = 32)
    private String category;

    @Column(name = "order_reference", length = 10)
    private String orderReference;

    @Column(name = "message", nullable = false, length = 1000)
    private String message;

    @Column(name = "privacy_consented", nullable = false)
    private boolean privacyConsented;

    @Column(name = "inquiry_status", nullable = false, length = 32)
    @Builder.Default
    private String inquiryStatus = "OPEN";

    @Column(name = "assigned_to", length = 100)
    private String assignedTo;

    @Column(name = "admin_note", length = 1000)
    private String adminNote;

    @Column(name = "handled_at")
    private Instant handledAt;
}