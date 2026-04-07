package com.recycle.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

/**
 * 会員ユーザー。パスワードは平文禁止（password_hash のみ保持）。
 */
@Entity
@Table(name = "users")
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, exclude = "recycleOrders")
@ToString(callSuper = true, exclude = "recycleOrders")
@SQLDelete(sql = "UPDATE users SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
public class User extends BaseAuditEntity {

    @Column(name = "email", nullable = false, length = 320)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    /** 氏名（漢字） */
    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "kana", nullable = false, length = 255)
    private String kana;

    @Column(name = "phone", nullable = false, length = 15)
    private String phone;

    /** ハイフンなし7桁 */
    @Column(name = "zip_code", nullable = false, length = 7)
    private String zipCode;

    @Column(name = "prefecture", nullable = false, length = 100)
    private String prefecture;

    @Column(name = "city", nullable = false, length = 255)
    private String city;

    @Column(name = "address_line1", nullable = false, length = 500)
    private String addressLine1;

    @Column(name = "address_line2", length = 500)
    private String addressLine2;

    /** 古物営業法・本人確認（MVP では未使用） */
    @Column(name = "identity_verified", nullable = false)
    @Builder.Default
    private boolean identityVerified = false;

    /**
     * アプリ権限（例: USER, ADMIN）。DB は ROLE_ なしで保持し、UserDetails では ROLE_ を付与する。
     */
    @Column(name = "role", nullable = false, length = 32)
    @Builder.Default
    private String role = "USER";

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @Builder.Default
    private List<RecycleOrder> recycleOrders = new ArrayList<>();
}
