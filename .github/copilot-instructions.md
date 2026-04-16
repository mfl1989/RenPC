# RenPC Workspace Instructions

## Overview
- This repository contains a Spring Boot backend and a React plus TypeScript frontend for a Japanese recycle order system.
- Keep changes minimal, task-focused, and aligned with the existing repository structure.

## Language Rules
- Use Japanese for user-facing text, validation messages, comments, JavaDoc, Swagger descriptions, and assistant responses unless a task explicitly requires another language.
- Keep code symbols such as class names, method names, variables, table names, and column names in English.

## Backend Rules
- Keep the backend layered as Controller -> Service -> Repository.
- Do not place business logic in controllers.
- Do not return entities directly from APIs. Return DTOs or response objects.
- Align API responses to the unified JSON shape: code, data, message.
- Use global exception handling with RestControllerAdvice.
- Use Bean Validation for request validation.
- Support pagination with Pageable for list APIs when appropriate.
- Reuse shared logic from com.recycle.util before adding inline helper logic.

## Database Rules
- Use PostgreSQL and Flyway migrations only for schema changes.
- Use snake_case for table names and column names.
- Prefer logical deletion with is_deleted instead of physical deletion.
- Keep common audit columns aligned with the project conventions.
- Use INTEGER or BIGINT for money values.

## Frontend Rules
- Use TypeScript types instead of any whenever practical.
- Prefer Tailwind utility classes and avoid inline styles unless there is a strong reason.
- Keep reusable UI parts in shared components when duplication becomes clear.
- Preserve Japanese business validations such as zip code, kana, and phone formatting where applicable.
- Prevent double submission for submit actions and show loading states clearly.

## Existing Source Documents
- Development standards: docs/01_dev_standards.md
- Database guidelines: docs/02_db_guidelines.md
- Frontend feature scope: docs/03_frontend_features.md
- Business requirements: docs/04_business_requirements.md

## Migration Note
- This file and the instruction files under .github/instructions are the VS Code compatible replacement for the old Cursor-specific .cursorrules workflow.