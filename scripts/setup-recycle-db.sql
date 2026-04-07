-- 与 backend/src/main/resources/application.yml 默认连接一致：
-- jdbc:postgresql://localhost:5432/recycle  用户 recycle / 密码 recycle
--
-- 在 PowerShell 中执行（将 YOUR_POSTGRES_PASSWORD 换成安装 PostgreSQL 时为 postgres 用户设置的密码）：
--   $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
--   $env:PGPASSWORD = 'YOUR_POSTGRES_PASSWORD'
--   psql -U postgres -h localhost -d postgres -v ON_ERROR_STOP=1 -f scripts/setup-recycle-db.sql

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'recycle') THEN
    CREATE ROLE recycle WITH LOGIN PASSWORD 'recycle';
  ELSE
    ALTER ROLE recycle WITH PASSWORD 'recycle';
  END IF;
END
$$;

SELECT format('CREATE DATABASE %I OWNER recycle', 'recycle')
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'recycle')
\gexec
