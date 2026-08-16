# Developer Guide

## Start

1. Install dependencies: `npm install`
2. Configure environment: copy `.env.example` to `.env`
3. Generate Prisma client: `npm run prisma:generate`
4. Apply database schema: `npm run prisma:migrate:dev -- --name init`
5. Run app: `npm run dev`

## Role Simulation

Use headers for role simulation:

- `x-actor-id: seller-1`
- `x-actor-role: seller`

or

- `x-actor-id: buyer-1`
- `x-actor-role: buyer`

## Suggested Next Refactors

- Add real auth (e.g., session/JWT).
- Move role checks into middleware.
- Introduce DTOs for stable API versioning.
- Add integration tests for checkout transaction behavior.
