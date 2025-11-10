// backend/server.js

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// compute __filename / __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load .env from backend folder explicitly
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('MONGO_URI from .env:', process.env.MONGO_URI);

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';   // ✅ Added this
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Connect to MongoDB
const port = process.env.PORT || 5000;
connectDB();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Enable CORS — allow requests from your frontend URL
const allowedOrigins = [
  'http://localhost:3000',
  'https://proshop-git-main-rachana-rs-projects-aa77cf12.vercel.app', // 🟢 your actual Vercel URL
  'https://proshop-a0qkv7qff-rachana-rs-projects-aa77cf12.vercel.app', // (add both if shown in Vercel)
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/config/paypal', (req, res) =>
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID || 'sb' })
);

// Serve static files
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

app.use(notFound);
app.use(errorHandler);

app.listen(port, () =>
  console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`)
);
