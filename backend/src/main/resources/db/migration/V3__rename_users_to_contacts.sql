ALTER TABLE recycle_orders
    DROP CONSTRAINT fk_recycle_orders_users;

ALTER TABLE recycle_orders
    RENAME COLUMN user_id TO contact_id;

ALTER TABLE users
    RENAME TO contacts;

ALTER INDEX idx_users_email_active
    RENAME TO idx_contacts_email_active;

ALTER INDEX idx_recycle_orders_user_id
    RENAME TO idx_recycle_orders_contact_id;

ALTER TABLE contacts
    DROP COLUMN password_hash,
    DROP COLUMN role;

COMMENT ON TABLE contacts IS '回収申込の連絡先（論理削除）';
COMMENT ON COLUMN contacts.identity_verified IS '古物営業法対応の本人確認（MVP では未使用、将来拡張用）';

ALTER TABLE recycle_orders
    ADD CONSTRAINT fk_recycle_orders_contacts FOREIGN KEY (contact_id) REFERENCES contacts (id);