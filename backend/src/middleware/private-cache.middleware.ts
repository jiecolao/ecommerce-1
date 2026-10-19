import type { RequestHandler } from 'express';

// Mount with Express path matching so segment boundaries, case and trailing
// slashes follow the same rules as the routes. Keep public buyer routes separate.
export const PRIVATE_API_PATHS = [
  '/api/auth',
  '/api/admin',
  '/api/buyer/profile',
  '/api/buyer/cart',
  '/api/buyer/orders',
  '/api/buyer/wishlist',
];

// Register before CORS/body parsing/guards so redirects and errors are covered.
// This controls HTTP caching; it does not clear frontend state or stored tokens.
export const privateResponseCacheControl: RequestHandler = (_request, response, next) => {
  response.setHeader('Cache-Control', 'no-store');
  next();
};
