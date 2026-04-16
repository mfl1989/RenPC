CREATE TABLE order_internal_note_histories (
    id BIGSERIAL PRIMARY KEY,
    recycle_order_id BIGINT NOT NULL,
    previous_note VARCHAR(1000),
    new_note VARCHAR(1000),
    changed_by VARCHAR(255),
    changed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_internal_note_histories_orders
        FOREIGN KEY (recycle_order_id) REFERENCES recycle_orders (id)
);

CREATE INDEX idx_internal_note_histories_order_changed_at
    ON order_internal_note_histories (recycle_order_id, changed_at DESC);

COMMENT ON TABLE order_internal_note_histories IS '注文の内部メモ更新履歴';
COMMENT ON COLUMN order_internal_note_histories.previous_note IS '変更前の内部メモ';
COMMENT ON COLUMN order_internal_note_histories.new_note IS '変更後の内部メモ';
COMMENT ON COLUMN order_internal_note_histories.changed_by IS '更新者';
COMMENT ON COLUMN order_internal_note_histories.changed_at IS '更新日時';