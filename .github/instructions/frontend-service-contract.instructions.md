---
applyTo: "frontend/src/api/**/*.ts,frontend/src/services/**/*.ts,frontend/src/lib/axios.ts"
description: "Use when editing frontend API clients, axios setup, response parsing, error mapping, and backend contract integration."
---

# Frontend Service Contract Rules

- Assume backend responses follow the common shape: code, data, message.
- Normalize API handling so UI code receives predictable success and error structures.
- Do not leak backend stack traces or raw transport errors directly into the UI.
- Map validation and business errors into Japanese messages suitable for users or operators.
- Keep request payloads aligned with backend DTO expectations.
- Preserve loading, cancellation, and retry behavior where it already exists.

# Integration Awareness

- ZIP code search and order submission should remain isolated and readable.
- Shared axios configuration should centralize repetitive transport behavior.

# Reference Docs

- docs/01_dev_standards.md
- docs/03_frontend_features.md