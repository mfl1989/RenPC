CREATE TABLE order_status_histories (
    id BIGSERIAL PRIMARY KEY,
    recycle_order_id BIGINT NOT NULL,
    previous_status VARCHAR(32),
    new_status VARCHAR(32) NOT NULL,
    changed_by VARCHAR(255),
    changed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_order_status_histories_orders
        FOREIGN KEY (recycle_order_id) REFERENCES recycle_orders (id)
);

CREATE INDEX idx_order_status_histories_order_changed_at
    ON order_status_histories (recycle_order_id, changed_at DESC);

COMMENT ON TABLE order_status_histories IS '注文ステータス更新履歴';
COMMENT ON COLUMN order_status_histories.previous_status IS '変更前の注文ステータス';
COMMENT ON COLUMN order_status_histories.new_status IS '変更後の注文ステータス';
COMMENT ON COLUMN order_status_histories.changed_by IS '更新者';
COMMENT ON COLUMN order_status_histories.changed_at IS '更新日時';