CREATE TABLE contact_inquiries (
    id                BIGSERIAL PRIMARY KEY,
    name              VARCHAR(60) NOT NULL,
    email             VARCHAR(320) NOT NULL,
    category          VARCHAR(32) NOT NULL,
    order_reference   VARCHAR(10),
    message           VARCHAR(1000) NOT NULL,
    privacy_consented BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by        VARCHAR(255),
    updated_by        VARCHAR(255),
    is_deleted        BOOLEAN NOT NULL DEFAULT FALSE,
    version           BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_contact_inquiries_category CHECK (
        category IN ('items', 'packing', 'schedule', 'status', 'data-erasure', 'other')
    ),
    CONSTRAINT chk_contact_inquiries_order_reference CHECK (
        order_reference IS NULL OR order_reference ~ '^\\d{1,10}$'
    )
);

COMMENT ON TABLE contact_inquiries IS 'ご相談フォームから受け付けた問い合わせ';

CREATE INDEX idx_contact_inquiries_email ON contact_inquiries (email);
CREATE INDEX idx_contact_inquiries_created_at ON contact_inquiries (created_at DESC);
CREATE INDEX idx_contact_inquiries_order_reference ON contact_inquiries (order_reference);