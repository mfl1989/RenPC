ALTER TABLE recycle_orders
    ADD COLUMN internal_note VARCHAR(1000);

COMMENT ON COLUMN recycle_orders.internal_note IS '管理画面専用の内部メモ';