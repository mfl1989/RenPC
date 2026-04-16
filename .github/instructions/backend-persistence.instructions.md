---
applyTo: "backend/src/main/java/com/recycle/entity/**/*.java,backend/src/main/java/com/recycle/repository/**/*.java,backend/src/main/java/com/recycle/config/**/*.java"
description: "Use when editing JPA entities, repositories, or backend persistence-related config for audit columns, logical deletion, locking, and data modeling."
---

# Backend Persistence Rules

- Use snake_case database naming in schema-related mappings.
- Align entity design with common audit columns such as created_at, updated_at, created_by, updated_by, and is_deleted.
- Prefer logical deletion over physical deletion.
- Add or preserve optimistic locking with version fields on core entities when concurrent updates matter.
- Keep repository methods aligned with logical deletion behavior.
- Do not store passwords or sensitive personal data in plain text.
- For date and common formatting logic, reuse shared utilities before adding new inline helpers.

# Query And Performance Awareness

- Repository access should support common search and list scenarios efficiently.
- Be mindful of indexes implied by search fields, foreign keys, and unique business keys.

# Reference Docs

- docs/02_db_guidelines.md
- docs/04_business_requirements.md