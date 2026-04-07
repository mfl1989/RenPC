-- 会員ユーザーのロール（Spring Security 権限と対応）
ALTER TABLE users
    ADD COLUMN role VARCHAR(32) NOT NULL DEFAULT 'USER';

COMMENT ON COLUMN users.role IS 'アプリ権限（USER / ADMIN 等）。Spring Security では ROLE_ プレフィックス付きで扱う。';
