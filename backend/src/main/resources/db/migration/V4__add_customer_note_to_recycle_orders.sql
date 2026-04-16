ALTER TABLE recycle_orders
    ADD COLUMN customer_note VARCHAR(1000);

COMMENT ON COLUMN recycle_orders.customer_note IS '申込者向けの個別案内メモ';