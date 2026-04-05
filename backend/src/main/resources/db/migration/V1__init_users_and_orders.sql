-- ユーザー（会員）テーブル
CREATE TABLE users (
    id                 BIGSERIAL PRIMARY KEY,
    email              VARCHAR(320) NOT NULL,
    password_hash      VARCHAR(255) NOT NULL,
    name               VARCHAR(255) NOT NULL,
    kana               VARCHAR(255) NOT NULL,
    phone              VARCHAR(15) NOT NULL,
    zip_code           VARCHAR(7) NOT NULL,
    prefecture         VARCHAR(100) NOT NULL,
    city               VARCHAR(255) NOT NULL,
    address_line1      VARCHAR(500) NOT NULL,
    address_line2      VARCHAR(500),
    identity_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by         VARCHAR(255),
    updated_by         VARCHAR(255),
    is_deleted         BOOLEAN NOT NULL DEFAULT FALSE,
    version            BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_users_zip_code_len CHECK (char_length(zip_code) = 7)
);

COMMENT ON TABLE users IS '会員ユーザー（論理削除）';
COMMENT ON COLUMN users.identity_verified IS '古物営業法対応の本人確認（MVP では未使用、将来拡張用）';

CREATE UNIQUE INDEX idx_users_email_active ON users (email) WHERE is_deleted = FALSE;

-- 回収注文テーブル
CREATE TABLE recycle_orders (
    id                          BIGSERIAL PRIMARY KEY,
    user_id                     BIGINT NOT NULL,
    order_status                VARCHAR(32) NOT NULL DEFAULT 'RECEIVED',
    collection_date             DATE NOT NULL,
    collection_time_slot        VARCHAR(32) NOT NULL,
    total_amount                INTEGER NOT NULL DEFAULT 0,
    pc_count                    INTEGER NOT NULL DEFAULT 0,
    monitor_count               INTEGER NOT NULL DEFAULT 0,
    small_appliance_box_count   INTEGER NOT NULL DEFAULT 0,
    data_erasure_option         VARCHAR(32) NOT NULL,
    cardboard_delivery_requested BOOLEAN NOT NULL DEFAULT FALSE,
    terms_accepted_at           TIMESTAMPTZ NOT NULL,
    customer_name_kanji         VARCHAR(255) NOT NULL,
    customer_name_kana          VARCHAR(255) NOT NULL,
    postal_code                 VARCHAR(7) NOT NULL,
    prefecture                  VARCHAR(100) NOT NULL,
    city                        VARCHAR(255) NOT NULL,
    address_line1               VARCHAR(500) NOT NULL,
    address_line2               VARCHAR(500),
    phone                       VARCHAR(15) NOT NULL,
    email                       VARCHAR(320) NOT NULL,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by                  VARCHAR(255),
    updated_by                  VARCHAR(255),
    is_deleted                  BOOLEAN NOT NULL DEFAULT FALSE,
    version                     BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_recycle_orders_users FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT chk_recycle_orders_postal_code_len CHECK (char_length(postal_code) = 7),
    CONSTRAINT chk_recycle_orders_line_items CHECK (
        pc_count + monitor_count + small_appliance_box_count >= 1
    )
);

COMMENT ON TABLE recycle_orders IS '回収申込注文（申込時点の連絡先を保持）';

CREATE INDEX idx_recycle_orders_user_id ON recycle_orders (user_id);
CREATE INDEX idx_recycle_orders_order_status ON recycle_orders (order_status);
CREATE INDEX idx_recycle_orders_collection_date ON recycle_orders (collection_date);
