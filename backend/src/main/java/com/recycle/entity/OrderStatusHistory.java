package com.recycle.entity;

import java.time.Instant;

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
 * 注文ステータスの更新履歴。
 */
@Entity
@Table(name = "order_status_histories")
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, exclude = "recycleOrder")
@ToString(callSuper = true, exclude = "recycleOrder")
@SQLDelete(sql = "UPDATE order_status_histories SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
public class OrderStatusHistory extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recycle_order_id", nullable = false, foreignKey = @ForeignKey(name = "fk_order_status_histories_orders"))
    private RecycleOrder recycleOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", length = 32)
    private OrderStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 32)
    private OrderStatus newStatus;

    @Column(name = "changed_by", length = 255)
    private String changedBy;

    @Column(name = "change_reason", length = 500)
    private String changeReason;

    @Column(name = "changed_at", nullable = false)
    private Instant changedAt;
}