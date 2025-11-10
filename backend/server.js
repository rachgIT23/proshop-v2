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
import cors from 'cors';                  // <-- added
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const port = process.env.PORT || 5000;
connectDB();

const app = express();

// CORS config - allow Vercel domain + local dev
const allowedOrigins = [
  'http://localhost:3000',
  'https://proshop-backend-k60c.onrender.com', // keep backend host if needed
  'https://proshop-7j0kx5g2a-rachana-rs-projects-aa77c7f2.vercel.app/' // <-- REPLACE with your Vercel URL
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (mobile, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // For development you can allow all by using callback(null, true)
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

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

app.use(notFound);
app.use(errorHandler);

app.listen(port, () =>
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`)
);
