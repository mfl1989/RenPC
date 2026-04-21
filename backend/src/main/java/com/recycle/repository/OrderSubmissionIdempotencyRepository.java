package com.recycle.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import lombok.RequiredArgsConstructor;

/**
 * 回収申込の冪等性キーを保持し、二重送信を抑止する。
 */
@Repository
@RequiredArgsConstructor
public class OrderSubmissionIdempotencyRepository {

    private final JdbcTemplate jdbcTemplate;

    public boolean tryReserve(String idempotencyKey) {
        return jdbcTemplate.update(
                """
                        INSERT INTO order_submission_idempotencies (
                            idempotency_key,
                            recycle_order_id,
                            created_at,
                            updated_at,
                            is_deleted,
                            version
                        )
                        VALUES (?, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, FALSE, 0)
                        ON CONFLICT (idempotency_key) WHERE is_deleted = FALSE DO NOTHING
                        """,
                idempotencyKey) > 0;
    }

    public Optional<Long> findCompletedOrderId(String idempotencyKey) {
        List<Long> results = jdbcTemplate.query(
                """
                        SELECT recycle_order_id
                        FROM order_submission_idempotencies
                        WHERE idempotency_key = ?
                          AND is_deleted = FALSE
                          AND recycle_order_id IS NOT NULL
                        """,
                (rs, rowNum) -> rs.getLong("recycle_order_id"),
                idempotencyKey);

        return results.stream().findFirst();
    }

    public boolean hasActiveReservation(String idempotencyKey) {
        Integer count = jdbcTemplate.queryForObject(
                """
                        SELECT COUNT(*)
                        FROM order_submission_idempotencies
                        WHERE idempotency_key = ?
                          AND is_deleted = FALSE
                        """,
                Integer.class,
                idempotencyKey);
        return count != null && count > 0;
    }

    public void attachOrder(String idempotencyKey, Long orderId) {
        jdbcTemplate.update(
                """
                        UPDATE order_submission_idempotencies
                        SET recycle_order_id = ?,
                            updated_at = CURRENT_TIMESTAMP,
                            version = version + 1
                        WHERE idempotency_key = ?
                          AND is_deleted = FALSE
                        """,
                orderId,
                idempotencyKey);
    }
}