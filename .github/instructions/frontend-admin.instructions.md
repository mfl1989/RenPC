---
applyTo: "frontend/src/pages/admin/**/*.tsx,frontend/src/components/ProtectedRoute.tsx,frontend/src/contexts/AuthContext.tsx"
description: "Use when editing admin login, protected routes, order list management, authentication state, and admin-side status updates."
---

# Admin Frontend Rules

- Keep admin authentication flows explicit and safe, including loading and error states.
- Protected routes should redirect predictably when authentication is missing or expired.
- Status update UI must respect the documented order lifecycle and should avoid invalid backward transitions.
- Admin screens should surface concurrency or update failures clearly to the operator.
- Prevent duplicate admin actions while an update request is in flight.

# Data Contract Expectations

- Keep admin screens aligned with backend response shapes and optimistic locking fields such as version where applicable.
- Show user-safe Japanese messages for login failures and status update errors.

# Reference Docs

- docs/03_frontend_features.md
- docs/04_business_requirements.md