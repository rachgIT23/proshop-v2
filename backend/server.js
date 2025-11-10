// backend/server.js

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// -------------------------------------
// Setup paths and environment
// -------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Debug log (optional)
console.log('MONGO_URI from .env:', process.env.MONGO_URI);

// -------------------------------------
// Initialize app and database
// -------------------------------------
const app = express();
const port = process.env.PORT || 5000;

// Connect MongoDB
connectDB();

// -------------------------------------
// CORS setup (IMPORTANT for Render + Vercel)
// -------------------------------------

// FRONTEND_URLS should be set in Render env as:
// https://your-vercel-app.vercel.app,http://localhost:3000
const allowedOrigins = (process.env.FRONTEND_URLS || '')
  .split(',')
  .map(url => url.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow no-origin requests (e.g. curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // handle preflight requests

// -------------------------------------
// Middleware
// -------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// -------------------------------------
// Routes
// -------------------------------------
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/config/paypal', (req, res) =>
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID || 'sb' })
);

// -------------------------------------
// Static & production build handling
// -------------------------------------
if (process.env.NODE_ENV === 'production') {
  app.use('/uploads', express.static('/var/data/uploads'));
  app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, '..', 'frontend', 'build', 'index.html'))
  );
} else {
  app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
  app.get('/', (req, res) => res.send('API is running....'));
}

// -------------------------------------
// Error Handling
// -------------------------------------
app.use(notFound);
app.use(errorHandler);

// -------------------------------------
// Start Server
// -------------------------------------
app.listen(port, () => {
  console.log(
    `✅ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`
  );
});
