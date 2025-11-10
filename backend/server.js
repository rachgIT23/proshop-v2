// backend/server.js
// ESM-safe dotenv load & __dirname helper, then rest of app

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors'; // ✅ NEW — import cors
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// compute __filename / __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load .env from backend folder explicitly
dotenv.config({ path: path.join(__dirname, '.env') });

// debug - remove after you confirm working
console.log('MONGO_URI from .env:', process.env.MONGO_URI);

// connect DB
connectDB();

const app = express();
const port = process.env.PORT || 5000;

// ✅ Enable CORS — this allows requests from your React frontend
app.use(
  cors({
    origin: [
      'http://localhost:3000', // local dev
      'https://proshop-delta-gules.vercel.app', // 🔹 replace this with your actual Vercel frontend URL
    ],
    credentials: true,
  })
);

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/config/paypal', (req, res) =>
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID || 'sb' })
);

// static and uploads
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

// error handlers
app.use(notFound);
app.use(errorHandler);

// start server
app.listen(port, () =>
  console.log(
    `✅ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`
  )
);
