# Project Guidelines & Context

## Tech Stack
- Frontend: Nest.js (App Router), React, Tailwind CSS
- Backend / DB: Supabase PostgreSQL with Prisma ORM
- Language: TypeScript (strict mode enabled)

## Code Standards & Conventions
- 

## Dev Workflow
- Start dev server: `npm run dev`
- Run test suite: `npm test`

- [x] Verify that the copilot-instructions.md file in the .github directory is created.
- [x] Clarify project requirements.
- [x] Scaffold the project.
- [x] Customize the project.
- [x] Install required extensions (none required).
- [x] Compile the project.
- [x] Create and run task (not required).
- [x] Launch the project (deferred to user execution of npm run dev).
- [x] Ensure documentation is complete.

Workspace coding notes:

- Keep architecture modular by domain under `src/modules`.
- Keep route handlers thin and push business logic into services.
- Preserve backend-first focus and minimal monochrome UI until product UI design begins.
- Treat payment as an internal placeholder assumption until a dedicated payment module is approved.
