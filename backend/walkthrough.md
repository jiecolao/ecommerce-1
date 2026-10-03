# Walkthrough: Schema Features Integration

Successfully implemented all schema updates and expanded them across the backend API services and the frontend React client interface.

## Changes Made

### 1. Types and Interfaces (`shared`)
- Updated [index.ts](file:///d:/Repositories/CSE3/shared/src/index.ts):
  - Added `status` and `rating` fields to `Product` and `CreateProductDto`.
  - Added `activationGuide` to `ProductVariant` and nested variants within `CreateProductDto`.
  - Added `discountCode` support to `CheckoutDto`.
  - Updated `Order` to reference `customerId` and support `discountCode`, `discountAmount`, `paymentMethodId`, and `amountPaid`.

### 2. Backend Services & Controllers
- **Catalog Filter**: Updated [catalog.service.ts](file:///d:/Repositories/CSE3/backend/src/modules/catalog/catalog.service.ts) to filter products so only those with `status: 'ACTIVE'` are shown in the public catalog listing and detail retrieval.
- **Wishlist Endpoints**: Updated [buyer.controller.ts](file:///d:/Repositories/CSE3/backend/src/modules/buyer/buyer.controller.ts) and [buyer.service.ts](file:///d:/Repositories/CSE3/backend/src/modules/buyer/buyer.service.ts) to implement wishlist APIs (`POST/DELETE/GET /buyer/wishlist`).
- **Discount Checkout**: Expanded order checkout logic in `buyer.service.ts` to validate and apply the promo code `SAVE10` (10% off), calculating the discount amount and setting the amount paid accordingly.
- **Audit Logs**: Integrated audit logging into [admin.service.ts](file:///d:/Repositories/CSE3/backend/src/modules/admin/admin.service.ts) to write old and new value snapshots to the `Logs` table on product CREATE, UPDATE, and DELETE operations. Created a `GET /admin/logs` endpoint in [admin.controller.ts](file:///d:/Repositories/CSE3/backend/src/modules/admin/admin.controller.ts) to fetch and parse audit logs into human-readable descriptions.
- **DTOs**: Added class-validator decorators for status, rating, tags, system requirements, and activation guides in admin and buyer DTOs.

### 3. Frontend Pages & Routing
- **App Routes**: Added Route for `/buyer/wishlist` in [App.tsx](file:///d:/Repositories/CSE3/frontend/src/App.tsx).
- **Navigation**: Added a Wishlist link next to "My Games" in [Navbar.tsx](file:///d:/Repositories/CSE3/frontend/src/components/layout/Navbar.tsx).
- **Wishlist Page**: Created [WishlistPage.tsx](file:///d:/Repositories/CSE3/frontend/src/pages/buyer/WishlistPage.tsx) to list customer wishlists.
- **Storefront Details**: Updated [ProductDetailsPage.tsx](file:///d:/Repositories/CSE3/frontend/src/pages/buyer/ProductDetailsPage.tsx) to render system requirements, rating, tags as badges, and added a toggle button for wishlists.
- **Checkout Discount Input**: Added a promo code input and checkout logic in [CheckoutPage.tsx](file:///d:/Repositories/CSE3/frontend/src/pages/buyer/CheckoutPage.tsx) to display and apply the 10% coupon code.
- **Admin Forms**: Integrated fields for Product status, rating, tags, system requirements, and variant activation guide into [CreateProductPage.tsx](file:///d:/Repositories/CSE3/frontend/src/pages/admin/CreateProductPage.tsx).
- **Admin List**: Added Status and Rating columns to the products table in [ProductsPage.tsx](file:///d:/Repositories/CSE3/frontend/src/pages/admin/ProductsPage.tsx).

---

## Seeding & Verification
- Updated [seed.ts](file:///d:/Repositories/CSE3/backend/prisma/seed.ts) to first wipe all tables in the database (resolving dependency constraints), and then seed only the metadata lookup tables (Stores, Regions, Types, Payment Methods) and default users (Admin, Customer).
- Executed `npx prisma db seed` successfully.
- Ran frontend and backend compilation builds successfully:
  - Backend `npm run build`: Exited 0.
  - Frontend `npm run build`: Exited 0.
