# Architecture Overview

This project is a backend-first e-commerce platform scaffold with a minimal monochrome interface.

## Runtime Stack

- Next.js (App Router) on Vercel.
- TypeScript for strict typing and maintainability.
- Neon Postgres via Prisma ORM.
- Vercel Blob for product asset placeholders.

## Functional Domains

1. Buyer
   - Featured home feed.
   - Checkout process (internal payment assumption).
   - Orders listing and invoice retrieval.
2. Seller
   - Product lifecycle management.
   - Product asset attachment (blob URL placeholders).
   - Revenue and volume reporting.

## Payment Assumption

No external payment plugin is integrated.

The checkout process marks payment as successful through placeholder references and generates an invoice.

## Extensibility Notes

- Replace `getRequestActor` with real authentication middleware.
- Replace placeholder payment reference generation with an internal payment gateway service.
- Add queue/event layers for order fulfillment as needed.
