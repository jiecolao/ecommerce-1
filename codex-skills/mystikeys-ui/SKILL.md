---
name: mystikeys-ui
description: Build or refine MystiKeys React frontend pages and components using the project's established comic storefront theme, layout conventions, assets, and interaction patterns. Use only for frontend UI work; do not apply this brand system to backend, shared, deployment, or unrelated project work.
---

# MystiKeys UI

These instructions are agent-agnostic. If an AI coding agent does not support Codex skills directly, treat this file and its references as plain frontend project guidance.

Maintain a cohesive, colorful comic-game storefront without drifting into neon, cyberpunk, generic SaaS, or marketing-page styling.

Use this skill only for MystiKeys frontend work. Before editing, inspect the relevant route, shared components, and existing assets. Reuse the app's React, Tailwind, React Router, Lucide, and shared component patterns. Preserve working data and backend boundaries unless the request explicitly changes them.

Read [references/design-system.md](references/design-system.md) before making visual or interaction decisions.

## Working Rules

- Use Orbitron for display headings, labels, prices, badges, and major actions. Use Space Grotesk for body copy, forms, descriptions, and dense content.
- Build on charcoal surfaces, dark purple panels, warm gold accents, white text, and muted lavender secondary text.
- Keep yellow intentional: active states, primary calls to action, small bars, icons, and key prices. Do not flood whole screens with yellow.
- Prefer angular geometry, hard borders, offset shadows, clipped accents, and occasional single-edge slants. Product cards use one diagonal top edge, not multiple clipped corners.
- Hover motion should feel physical and comic-like: slight lift, tiny tilt, artwork zoom, or shadow displacement. Do not introduce neon glows, cyan electric effects, or unrelated color changes.
- Keep cards readable and restrained. Avoid card nesting, excessive decoration, rounded SaaS cards, gradients as primary decoration, and one-note purple screens.
- Use Lucide icons for controls and system concepts. Use `public/icons.svg` for the existing social sprite when needed.
- Use existing visual assets before creating replacements. The current hero is `public/image.png`; catalog/product placeholder art is `public/palworld-cover.jpg`.
- Shared navigation, footer, and account sidebar must remain consistent across routes. Add new account destinations to `AccountSidebar` rather than duplicating it.
- Implement realistic local interactions for prototype pages: selection, quantities, reveal/copy, add/remove, empty states, dialogs, reset, and mock save feedback.
- Keep layouts responsive, with stable control dimensions and no overlapping text or controls.

## Delivery

After edits, run the frontend production build and fix TypeScript or Vite failures. Do not start the dev server unless the user asks. If the browser may be serving `frontend/dist`, rebuild that bundle so the change is observable.
