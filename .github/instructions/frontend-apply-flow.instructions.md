---
applyTo: "frontend/src/pages/apply/**/*.tsx,frontend/src/context/**/*.tsx,frontend/src/schemas/**/*.ts,frontend/src/services/orderApi.ts,frontend/src/services/zipcloudSearch.ts,frontend/src/lib/zodToRhfErrors.ts"
description: "Use when editing the multi-step recycle order apply flow, form schemas, ZIP lookup, validation, pricing display, and submission handling."
---

# Apply Flow Rules

- Keep the apply flow aligned with the documented Step 1 to Step 5 journey.
- Preserve cross-step form state and avoid losing user input during navigation.
- Keep Japanese validation rules for zip code, kana, phone number, and agreement checks.
- ZIP code lookup should support normalized 7-digit input and user-safe error handling.
- Confirmation and submit steps must clearly show loading state and prevent double submission.
- Fee display should remain consistent with the documented pricing rules and summary expectations.
- Completion view should show the order identifier and completion guidance.

# UX Expectations

- Show actionable Japanese validation messages.
- Keep the submit path resilient when API calls fail.
- Prefer explicit disabled states over only visual loading cues.

# Reference Docs

- docs/03_frontend_features.md
- docs/04_business_requirements.md