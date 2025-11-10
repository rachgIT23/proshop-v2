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

// ----------------------------------------------------
// Setup paths and environment
// ----------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file (from backend folder)
dotenv.config({ path: path.join(__dirname, '.env') });

// Debug log to verify env loaded
console.log('MONGO_URI from .env:', process.env.MONGO_URI);

// ----------------------------------------------------
// Initialize Express app & connect to MongoDB
// ----------------------------------------------------
const app = express();
const port = process.env.PORT || 5000;

connectDB();

// ----------------------------------------------------
// CORS setup (Render + Vercel + localhost)
// ----------------------------------------------------

// FRONTEND_URLS in Render should be like:
// https://your-vercel-app.vercel.app,http://localhost:3000

const rawFrontends = process.env.FRONTEND_URLS || '';
const allowedOrigins = rawFrontends
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, '')) // remove trailing /
  .filter(Boolean);

console.log('✅ Allowed frontend origins:', allowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow server or curl
    const originNormalized = origin.replace(/\/+$/, '');
    if (allowedOrigins.includes(originNormalized)) {
      return callback(null, true);
    }
    console.warn('❌ CORS blocked origin:', origin);
    callback(new Error(`CORS policy: origin ${origin} not allowed`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // handle preflight

// ----------------------------------------------------
// Middleware
// ----------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ----------------------------------------------------
// Routes
// ----------------------------------------------------
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/config/paypal', (req, res) =>
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID || 'sb' })
);

// ----------------------------------------------------
// Health check (optional but useful)
// ----------------------------------------------------
app.get('/health', (req, res) => {
  res.status(200).send('✅ Backend is live and healthy!');
});

// ----------------------------------------------------
// Static files (for production)
// ----------------------------------------------------
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

// ----------------------------------------------------
// Error handling
// ----------------------------------------------------
app.use(notFound);
app.use(errorHandler);

// ----------------------------------------------------
// Start server
// ----------------------------------------------------
app.listen(port, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`
  );
});
