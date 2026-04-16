---
applyTo: "frontend/src/**/*.ts,frontend/src/**/*.tsx,frontend/src/**/*.css"
description: "Use when editing React, TypeScript, Vite, or Tailwind frontend files including forms, validation, page flows, and API integration."
---

# Frontend Implementation Rules

- Tech stack: React, TypeScript, Vite, Tailwind CSS.
- Avoid any unless there is no practical alternative.
- Keep UI text and validation messages in Japanese.
- Follow the documented multi-step recycle order flow.
- Preserve or implement Japanese-specific validation where required, such as zip code, kana, and phone formats.
- Prefer Tailwind utility classes over inline styles.
- Split reusable pieces into shared components when duplication becomes clear.
- Respect the common API response shape with code, data, and message.
- Implement loading state, disabled state, and double-submit prevention for form submissions.

# Feature Scope

- Landing page
- Multi-step apply flow
- Completion page
- Admin login and order management pages

# Reference Docs

- docs/01_dev_standards.md
- docs/03_frontend_features.md
- docs/04_business_requirements.md