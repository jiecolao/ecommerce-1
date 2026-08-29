# Implement Schema Features in API and Frontend

Expand the NestJS backend and React frontend to support the new database fields (Product status & rating, ProductVariant activation guide & language support, Order discount code/amount & amount paid) and add the Wishlist functionality.

## User Review Required

> [!IMPORTANT]
> - Backend:
>   - Filters catalog endpoints so only `status: 'ACTIVE'` products are listed or fetched by customers.
>   - Automatically creates audit logs in the `Logs` table when an admin publishes, updates, or deletes a product. // regarding the logs structure, make sure the proper structure following the old and new key pair structure like in the ERD for the json update_diff is followed and the record_id is properly fetched along with the table name, add initial parsing in the log to make the changes description based on the given enums
>   - Supports coupon application during checkout (e.g. `SAVE10` gives 10% discount).
> - Frontend:
>   - Adds a Wishlist tab to the header and implements `WishlistPage.tsx`.
>   - Integrates product status and rating in admin product list and creation forms.
>   - Displays rating, tags, system requirements, and activation guides in product detail views.
>   - Adds a promo code field in checkout.

## Proposed Changes

### Shared Module

#### [MODIFY] [shared index.ts](file:///d:/Repositories/CSE3/shared/src/index.ts)
- Add `status` and `rating` to the `Product` interface.
- Add `activationGuide` to the `ProductVariant` interface.
- Add `status` and `rating` to `CreateProductDto`.
- Add `activationGuide` to the nested variant type in `CreateProductDto`.
- Add `discountCode` optional field to `CheckoutDto`.
- Update `Order` interface fields to support `customerId`, `discountCode`, `discountAmount`, `paymentMethodId`, and `amountPaid`.

---

### Backend Services

#### [MODIFY] [catalog.service.ts](file:///d:/Repositories/CSE3/backend/src/modules/catalog/catalog.service.ts)
- Filter `listProducts` and `getProductById` to only return active products (`status: 'ACTIVE'`).

#### [MODIFY] [buyer.service.ts](file:///d:/Repositories/CSE3/backend/src/modules/buyer/buyer.service.ts)
- Add wishlist management functions: `addToWishlist`, `removeFromWishlist`, `getWishlist`.
- Add discount code validation logic in the `checkout` method (supporting code `SAVE10` for 10% off).

#### [MODIFY] [buyer.controller.ts](file:///d:/Repositories/CSE3/backend/src/modules/buyer/buyer.controller.ts)
- Add routes for Wishlist management: `POST /buyer/wishlist`, `DELETE /buyer/wishlist/:productId`, and `GET /buyer/wishlist`.

#### [MODIFY] [checkout.dto.ts](file:///d:/Repositories/CSE3/backend/src/modules/buyer/dto/checkout.dto.ts)
- Add optional `discountCode?: string` field.

#### [MODIFY] [create-admin-product.dto.ts](file:///d:/Repositories/CSE3/backend/src/modules/admin/dto/create-admin-product.dto.ts) & [update-admin-product.dto.ts](file:///d:/Repositories/CSE3/backend/src/modules/admin/dto/update-admin-product.dto.ts)
- Add new properties to creation and update validation DTOs (e.g. `status`, `rating`, `systemRequirements` for products, and `activationGuide` for variants).

#### [MODIFY] [admin.service.ts](file:///d:/Repositories/CSE3/backend/src/modules/admin/admin.service.ts)
- Write audit logs using `this.prisma.logs.create` for Product CREATE, UPDATE, and DELETE operations.

---

### Frontend Components & Pages

#### [MODIFY] [Navbar.tsx](file:///d:/Repositories/CSE3/frontend/src/components/layout/Navbar.tsx)
- Add Wishlist link under the buyer nav section.

#### [NEW] [WishlistPage.tsx](file:///d:/Repositories/CSE3/frontend/src/pages/buyer/WishlistPage.tsx)
- Create a new view showing the list of wishlisted products for the buyer, allowing quick navigation or removal.

#### [MODIFY] [App.tsx](file:///d:/Repositories/CSE3/frontend/src/App.tsx)
- Add Route for `/buyer/wishlist`.

#### [MODIFY] [CatalogPage.tsx](file:///d:/Repositories/CSE3/frontend/src/pages/buyer/CatalogPage.tsx)
- Display tags and product ratings (if available).

#### [MODIFY] [ProductDetailsPage.tsx](file:///d:/Repositories/CSE3/frontend/src/pages/buyer/ProductDetailsPage.tsx)
- Display the product rating, system requirements, list of tags (as badges), and variant details. Add a Wishlist heart toggle button.

#### [MODIFY] [CheckoutPage.tsx](file:///d:/Repositories/CSE3/frontend/src/pages/buyer/CheckoutPage.tsx)
- Add a promo code input field. If `SAVE10` is applied, show a 10% price discount before checkout submission.

#### [MODIFY] [CreateProductPage.tsx](file:///d:/Repositories/CSE3/frontend/src/pages/admin/CreateProductPage.tsx)
- Add inputs for Product `status` and `rating` and variant `activationGuide`.

#### [MODIFY] [ProductsPage.tsx](file:///d:/Repositories/CSE3/frontend/src/pages/admin/ProductsPage.tsx)
- Show Product `status` and `rating` in the admin products list.

---

### Database Seeding

#### [MODIFY] [seed.ts](file:///d:/Repositories/CSE3/backend/prisma/seed.ts)
- Add Payment Methods and seed a mock active Product with a global Steam variant and keys to populate the database properly.

---

## Verification Plan

### Automated Tests
- Run `npm run build` inside `backend` and `frontend` folders to verify zero compilation errors.
- Run the NestJS server and verify API endpoints.
- Rerun the database seeding command: `npx prisma db seed`.
