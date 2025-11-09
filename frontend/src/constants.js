// frontend/src/constants.js
// Use an env var for the backend base URL (CRA reads REACT_APP_... at build time)
export const BASE_URL = process.env.REACT_APP_BASE_URL || '';

// Endpoints (use BASE_URL so requests go to the backend service)
export const PRODUCTS_URL = `${BASE_URL}/api/products`;
export const USERS_URL    = `${BASE_URL}/api/users`;
export const ORDERS_URL   = `${BASE_URL}/api/orders`;
export const PAYPAL_URL   = `${BASE_URL}/api/config/paypal`;
