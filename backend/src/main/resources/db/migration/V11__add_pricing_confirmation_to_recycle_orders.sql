ALTER TABLE recycle_orders
    ADD COLUMN final_amount INTEGER,
    ADD COLUMN pricing_confirmed_at TIMESTAMP,
    ADD COLUMN pricing_confirmed_by VARCHAR(255),
    ADD COLUMN pricing_confirmation_note VARCHAR(500);