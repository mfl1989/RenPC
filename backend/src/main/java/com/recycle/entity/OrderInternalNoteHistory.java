package com.recycle.entity;

import java.time.Instant;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
 * 注文内部メモの更新履歴。
 */
@Entity
@Table(name = "order_internal_note_histories")
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, exclude = "recycleOrder")
@ToString(callSuper = true, exclude = "recycleOrder")
@SQLDelete(sql = "UPDATE order_internal_note_histories SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
public class OrderInternalNoteHistory extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recycle_order_id", nullable = false, foreignKey = @ForeignKey(name = "fk_internal_note_histories_orders"))
    private RecycleOrder recycleOrder;

    @Column(name = "previous_note", length = 1000)
    private String previousNote;

    @Column(name = "new_note", length = 1000)
    private String newNote;

    @Column(name = "changed_by", length = 255)
    private String changedBy;

    @Column(name = "changed_at", nullable = false)
    private Instant changedAt;
}