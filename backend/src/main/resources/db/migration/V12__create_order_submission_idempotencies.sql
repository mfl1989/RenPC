CREATE TABLE order_submission_idempotencies (
    id               BIGSERIAL PRIMARY KEY,
    idempotency_key  VARCHAR(36) NOT NULL,
    recycle_order_id BIGINT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       VARCHAR(255),
    updated_by       VARCHAR(255),
    is_deleted       BOOLEAN NOT NULL DEFAULT FALSE,
    version          BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_order_submission_idempotencies_order
        FOREIGN KEY (recycle_order_id) REFERENCES recycle_orders (id)
);

COMMENT ON TABLE order_submission_idempotencies IS '回収申込の二重送信防止用冪等性キー';
COMMENT ON COLUMN order_submission_idempotencies.idempotency_key IS 'フロントエンドが申込ごとに生成する送信識別子';

CREATE UNIQUE INDEX idx_order_submission_idempotencies_key_active
    ON order_submission_idempotencies (idempotency_key)
    WHERE is_deleted = FALSE;

CREATE INDEX idx_order_submission_idempotencies_order_id
    ON order_submission_idempotencies (recycle_order_id);