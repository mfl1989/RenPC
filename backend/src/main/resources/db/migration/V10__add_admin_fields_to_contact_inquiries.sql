ALTER TABLE contact_inquiries
    ADD COLUMN inquiry_status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    ADD COLUMN assigned_to VARCHAR(100),
    ADD COLUMN admin_note VARCHAR(1000),
    ADD COLUMN handled_at TIMESTAMPTZ;

ALTER TABLE contact_inquiries
    ADD CONSTRAINT chk_contact_inquiries_status CHECK (
        inquiry_status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')
    );

CREATE INDEX idx_contact_inquiries_status_created_at ON contact_inquiries (inquiry_status, created_at DESC);