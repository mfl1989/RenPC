---
applyTo: "backend/src/main/java/**/*.java,backend/src/main/resources/**/*.yml,backend/src/main/resources/**/*.yaml"
description: "Use when editing Spring Boot backend code or backend configuration for controllers, services, repositories, DTOs, validation, exceptions, and API responses."
---

# Backend Implementation Rules

- Tech stack: Java 17 plus, Spring Boot 3.x, Spring Data JPA, PostgreSQL, Flyway.
- Keep the 3-layer structure strict: Controller -> Service -> Repository -> DB.
- Controllers must only handle request and response mapping and delegate business logic to services.
- Never expose Entity objects directly to the frontend. Convert to DTO or response objects.
- Prefer MapStruct or builder-based mapping where the project already uses those patterns.
- All APIs should align to the common response contract with code, data, and message.
- Use RestControllerAdvice for centralized exception handling.
- Use jakarta.validation or Bean Validation for request DTO validation.
- Do not leak stack traces to frontend responses.
- Use Pageable for list endpoints that return collections.
- Sensitive data such as passwords or personal information must never be stored in plain text.
- Before adding utility logic for date, string, or money processing, check com.recycle.util and reuse existing helpers.
- Keep business comments and JavaDoc in Japanese.
- Keep code symbols in English.

# Business Requirements To Respect

- Prevent duplicate submissions where applicable.
- Consider optimistic locking on core entities when update conflicts are involved.
- Use transactional boundaries for multi-step write operations.
- Keep order status transitions aligned with the documented lifecycle.

# Reference Docs

- docs/01_dev_standards.md
- docs/04_business_requirements.md