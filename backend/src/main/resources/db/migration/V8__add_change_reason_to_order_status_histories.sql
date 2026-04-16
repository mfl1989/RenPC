ALTER TABLE order_status_histories
    ADD COLUMN change_reason VARCHAR(500);

COMMENT ON COLUMN order_status_histories.change_reason IS '注文ステータス変更理由';