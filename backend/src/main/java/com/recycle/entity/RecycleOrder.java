package com.recycle.entity;

import java.time.Instant;
import java.time.LocalDate;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import com.recycle.enums.OrderStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

/**
 * 回収申込注文。申込時点の連絡先・品目台数を保持し、連絡先更新後も履歴として参照可能。
 */
@Entity
@Table(name = "recycle_orders")
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, exclude = "contact")
@ToString(callSuper = true, exclude = "contact")
@SQLDelete(sql = "UPDATE recycle_orders SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
public class RecycleOrder extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "contact_id", nullable = false, foreignKey = @ForeignKey(name = "fk_recycle_orders_contacts"))
    private Contact contact;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false, length = 32)
    private OrderStatus orderStatus;

    @Column(name = "collection_date", nullable = false)
    private LocalDate collectionDate;

    @Column(name = "collection_time_slot", nullable = false, length = 32)
    private String collectionTimeSlot;

    /** 日本円の最小通貨単位（整数） */
    @Column(name = "total_amount", nullable = false)
    private Integer totalAmount;

    @Column(name = "pc_count", nullable = false)
    private Integer pcCount;

    @Column(name = "monitor_count", nullable = false)
    private Integer monitorCount;

    @Column(name = "small_appliance_box_count", nullable = false)
    private Integer smallApplianceBoxCount;

    @Column(name = "data_erasure_option", nullable = false, length = 32)
    private String dataErasureOption;

    @Column(name = "cardboard_delivery_requested", nullable = false)
    private boolean cardboardDeliveryRequested;

    @Column(name = "terms_accepted_at", nullable = false)
    private Instant termsAcceptedAt;

    @Column(name = "customer_name_kanji", nullable = false, length = 255)
    private String customerNameKanji;

    @Column(name = "customer_name_kana", nullable = false, length = 255)
    private String customerNameKana;

    @Column(name = "postal_code", nullable = false, length = 7)
    private String postalCode;

    @Column(name = "prefecture", nullable = false, length = 100)
    private String prefecture;

    @Column(name = "city", nullable = false, length = 255)
    private String city;

    @Column(name = "address_line1", nullable = false, length = 500)
    private String addressLine1;

    @Column(name = "address_line2", length = 500)
    private String addressLine2;

    @Column(name = "phone", nullable = false, length = 15)
    private String phone;

    @Column(name = "email", nullable = false, length = 320)
    private String email;

    @Column(name = "customer_note", length = 1000)
    private String customerNote;

    @Column(name = "internal_note", length = 1000)
    private String internalNote;
}
