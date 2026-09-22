# Frontend Agent Instructions

These instructions apply only to files inside `frontend/`. They are for any AI coding agent working on the MystiKeys frontend, regardless of vendor or model.

For backend, shared package, deployment, or repository-wide work, do not apply this frontend visual system unless the task explicitly touches frontend UI.

## MystiKeys UI Skill

When creating or refining React pages, routes, components, styles, or frontend interactions, follow the MystiKeys UI guidance in:

- `../codex-skills/mystikeys-ui/SKILL.md`
- `../codex-skills/mystikeys-ui/references/design-system.md`

If your agent environment does not support Codex skills directly, treat those files as plain project instructions.

## Scope

- Use the UI skill for `src/**/*.tsx`, `src/**/*.css`, frontend assets, route wiring, and frontend build behavior.
- Keep the comic storefront design language local to the frontend application.
- Do not use the UI skill to change API contracts, backend services, Prisma schema, shared package types, or deployment config unless the user explicitly asks for a frontend-driven integration change.
- Validate frontend changes with `npm run build --workspace frontend` from the repository root.
