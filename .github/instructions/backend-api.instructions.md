---
applyTo: "backend/src/main/java/com/recycle/controller/**/*.java,backend/src/main/java/com/recycle/service/**/*.java,backend/src/main/java/com/recycle/dto/**/*.java,backend/src/main/java/com/recycle/exception/**/*.java"
description: "Use when editing backend controllers, services, DTOs, and exception handling for API contracts, validation, transactions, and response design."
---

# Backend API Contract Rules

- Keep controllers thin and move business logic into services.
- Return DTOs or response objects only. Do not expose entities directly.
- Keep API responses aligned to the shared shape: code, data, message.
- Use Bean Validation on request DTOs and return user-safe Japanese error messages.
- Use RestControllerAdvice for centralized exception handling.
- Do not expose stack traces or internal framework details in API responses.
- Support pagination with Pageable and include standard page metadata when listing data.
- Use @Transactional for multi-step write operations such as user registration plus order creation.
- Consider idempotency or duplicate submission prevention for create operations.

# Status And Lifecycle Awareness

- Order status changes must follow the documented lifecycle and should not move backward without explicit business approval.
- Admin-side updates should respect optimistic locking when concurrent edits are possible.

# Reference Docs

- docs/01_dev_standards.md
- docs/04_business_requirements.md