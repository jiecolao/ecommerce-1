# Prisma Layer

This folder defines the data contract for Neon Postgres using Prisma ORM.

## Responsibilities

- Owns schema and relational constraints.
- Keeps product, order, and invoice entities normalized.
- Supports seller and buyer reporting flows.

## Setup

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` to a Neon Postgres connection string.
3. Run `npm run prisma:generate`.
4. Run `npm run prisma:migrate:dev -- --name init`.

## Design Notes

- Payment integration is intentionally not externalized; `paymentReference` is system-assumed placeholder data.
- Product image records persist Vercel Blob URLs.
