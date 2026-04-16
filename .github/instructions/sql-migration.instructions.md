---
applyTo: "backend/src/main/resources/db/migration/**/*.sql"
description: "Use when creating or editing Flyway SQL migration files for PostgreSQL schema changes, constraints, indexes, and audit columns."
---

# SQL Migration Rules

- Use PostgreSQL-compatible SQL only.
- Manage all schema changes through Flyway migrations.
- Do not rely on manual DDL outside migration files.
- Use snake_case for table names and column names.
- Prefer plural table names.
- Include common audit columns unless there is a clear and documented exception.
- Use logical deletion with is_deleted instead of physical deletion.
- Use VARCHAR(7) for zip codes without hyphens.
- Use VARCHAR for phone numbers and store normalized values without hyphens when possible.
- Use INTEGER or BIGINT for monetary amounts.
- Add indexes for frequent search columns and foreign keys.
- Consider partial indexes for uniqueness on non-deleted rows when logical deletion is used.

# Reference Doc

- docs/02_db_guidelines.md