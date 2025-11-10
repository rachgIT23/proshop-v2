// backend/server.js (full file with CORS)
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// compute __filename / __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load .env from backend folder explicitly
dotenv.config({ path: path.join(__dirname, '.env') });

// now imports (after dotenv)
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const port = process.env.PORT || 5000;
connectDB();

const app = express();

// ===== CORS setup =====
// Read allowed origins from env variable FRONTEND_URLS (comma-separated)
const raw = process.env.FRONTEND_URLS || '';
const allowedOrigins = raw.split(',').map(s => s.trim()).filter(Boolean);
// Example FRONTEND_URLS:
//   https://proshop-xxxxx.vercel.app,http://localhost:3000

const corsOptions = {
  origin: (origin, callback) => {
    // allow non-browser requests with no origin (curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: origin not allowed'), false);
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
// =======================

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
