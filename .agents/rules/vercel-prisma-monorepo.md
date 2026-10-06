---
name: Vercel Prisma Monorepo Builds
description: Architectural constraints for compiling a Prisma backend on Vercel using @vercel/node in a monorepo workspace.
---

# Vercel + Prisma + Monorepo Deployment Guidelines

When modifying build scripts or troubleshooting deployment issues in this project, adhere to the following strict architectural constraints. 

*Note: Past issues with `npm install` failing were symptomatic of misconfigured `postinstall` hooks crashing due to missing hoisted modules (like `dotenv`) or Vercel restoring corrupted Prisma 6/7 binary caches.*

## 1. Do NOT use Root `postinstall` Hooks
Never add a `postinstall` script to the root `package.json`. Vercel's dependency hoisting and caching mechanisms for monorepos will cause unpredictable binary resolution issues (especially with Prisma 7 WebAssembly modules).

## 2. Workspace-Isolated Prisma Generation
Because the `backend` uses `@vercel/node` in `vercel.json`, Vercel bypasses `turbo run build` and directly compiles the `src/` files. Therefore, to ensure the Prisma Client is generated before compilation, the generation script must live exactly in the backend workspace.

**Enforced State**:
`backend/package.json` must strictly contain:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```
*(By keeping it isolated to the backend, `npm install` runs it purely in the context of the backend dependencies, avoiding root-hoisting crashes).*

## 3. Environment Variables in `prisma.config.ts`
Do NOT import `dotenv/config` inside `prisma.config.ts`. This was the root cause of previous `npm install` crashes when Prisma attempted to resolve `dotenv` during the postinstall generation step. Vercel injects environment variables natively. 

Rely strictly on `process.env.DIRECT_URL` wrapped in a `try/catch` to gracefully fall back on native environments during isolated workspace builds.
