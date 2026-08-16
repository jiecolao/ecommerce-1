# E-Commerce Platform (NestJS + Supabase + Vercel Blob)

This project is a backend-first e-commerce platform scaffold built with NestJS and TypeScript. It targets Vercel deployment and uses Supabase for persistence and Vercel Blob for placeholder product asset hosting.

## Stack

- NestJS / TypeScript
- Prisma ORM
- Supabase Postgres
- Vercel Blob
- Jest + Supertest

## Features

- Seller catalog management
- Product listing and featured product retrieval
- Buyer checkout flow with assumed internal payment handling
- Order and invoice generation
- Seller reporting aggregates
- Health and integration-ready API surface

## Setup

1. Copy `.env.example` to `.env`
2. Set your Supabase and Vercel Blob environment variables
3. Run `npm install`
4. Run `npm run prisma:generate`
5. Run `npm run prisma:migrate:dev -- --name init`
6. Run `npm run dev`

## Common commands

- `npm run dev`
- `npm run build`
- `npm run test`
- `npm run lint`
- `npm run prisma:studio`

## Platform assumptions

- Payment handling is intentionally placeholder-only and internal to the system
- Product images use Vercel Blob placeholder URLs until a production asset pipeline exists
- Supabase credentials must be added in `.env` before runtime testing

## Vercel deployment notes

- Use a Node runtime with a NestJS server entrypoint
- Set environment variables in Vercel project settings
- Use Postgres connection details from Supabase and blob token from Vercel
