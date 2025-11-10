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

// compute __filename / __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load .env from backend folder explicitly
dotenv.config({ path: path.join(__dirname, '.env') });

// debug - remove after you confirm working
console.log('MONGO_URI from .env:', process.env.MONGO_URI);

// app config & connect DB
const port = process.env.PORT || 5000;
connectDB();

const app = express();

// --- CORS setup ---
// FRONTEND_URL should contain your Vercel frontend URL (set in Render env vars),
// e.g. https://proshop-xxxxx.vercel.app
// Allow localhost during local dev.
const FRONTEND_URL = process.env.FRONTEND_URL || '';
const allowedOrigins = [
  FRONTEND_URL,                   // your Vercel frontend (set in Render env)
  'http://localhost:3000',        // local dev
  'http://127.0.0.1:3000'         // local dev variant
].filter(Boolean); // remove empty values

// Use credentials true if your frontend sends cookies/auth and backend uses cookies
const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, same-origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // otherwise block
    return callback(new Error('CORS policy: origin not allowed'), false);
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS']
};

app.use(cors(corsOptions));
// handle preflight
app.options('*', cors(corsOptions));

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

app.use(notFound);
app.use(errorHandler);

app.listen(port, () =>
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`)
);
