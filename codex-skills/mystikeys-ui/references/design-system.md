# MystiKeys Design System

## Direction

Create a playful digital game-key storefront with printed-comic and arcade-poster influence. It should be energetic and colorful while remaining practical for repeated shopping and account workflows.

Avoid neon/cyberpunk treatment, cyan hover glows, gradient blobs, generic white SaaS cards, excessive rounding, and multiple clipped corners where one slanted edge is enough.

## Tokens

- Page charcoal: `#1c191f`
- Header/footer: `#18151b` / `#171419`
- Utility surface: `#211d23` / `#252028`
- Dark purple panel: `#241333`
- Selected purple: `#2b183c`
- Strong purple: `#6b2fa2`
- Purple shadow: `#2c0c46`
- Border: `#49345d` or `#5b4767`
- Primary gold: `#f4b72b`
- Gold hover: `#ffd45e`
- Primary text: `#ffffff` / `#f4eef9`
- Secondary text: `#a99bb5` / `#b9adc4`
- Quiet text: `#8f8398`

Use Orbitron for display text and Space Grotesk for readable body text. Do not use viewport-scaled font sizes or negative tracking.

## Geometry and Motion

- Primary buttons are gold with dark text. Secondary buttons use dark fills and purple borders.
- Comic panels use a 1px purple border and a `7px 7px 0 #2c0c46` offset shadow.
- Product cards use one top slope: `clip-path: polygon(0 20px, 100% 0, 100% 100%, 0 100%)`.
- Product-page artwork stays rectangular unless explicitly requested otherwise.
- Hover may lift 4-7px, rotate at most about 0.25 degrees, displace the fixed shadow, or zoom artwork slightly.
- Do not change card colors on hover. Category hover uses gold, not cyan.
- Respect `prefers-reduced-motion`.

## Shared Structure

Header includes the key mark, Store/Seller navigation, category search, currency, wishlist, cart, and account state. Footer includes brand copy, social sprite icons, shop/support navigation, newsletter, and legal links.

Reuse `src/components/account/AccountSidebar.tsx` on account pages. While authentication is disconnected, use the mock John Doe identity and local interactions.

## Page Patterns

- Catalog: hero uses `public/image.png`; cards use `public/palworld-cover.jpg`; region badges sit below the slope; whole cards are clickable.
- Product detail: breadcrumb, rectangular cover, rating, tags, selectable packages, subtotal, payment icons, and redemption guidance.
- Cart: items left; guest details, payment, and summary right; local quantity/removal updates.
- Order completion: show activation keys only, hidden until reveal, with copy feedback and redemption steps.
- Account pages: two-column shared sidebar/content layout with local add/remove/default/reset/save behavior and useful empty states.

## Implementation

- Route pages in `src/App.tsx`.
- Prefer shared data and layout components over duplication.
- Use links for navigation and buttons for in-place actions; never nest interactive elements.
- Keep mock data local and easy to replace with API data.
- Use ASCII unless existing content requires otherwise.
- Validate with `npm run build --workspace frontend` from the repository root.
