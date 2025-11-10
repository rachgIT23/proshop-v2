// frontend/src/constants.js

// Use the backend base URL from environment variable
// React (Create React App) only reads REACT_APP_... variables at build time
// When running locally, it will use localhost:5000 if env var is missing

export const BASE_URL =
  process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

// API endpoints (use BASE_URL so they work for both local and deployed setups)
export const PRODUCTS_URL = `${BASE_URL}/api/products`;
export const USERS_URL = `${BASE_URL}/api/users`;
export const ORDERS_URL = `${BASE_URL}/api/orders`;
export const PAYPAL_URL = `${BASE_URL}/api/config/paypal`;
