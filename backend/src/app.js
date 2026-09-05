import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { ENV } from './config/env.js';

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// CORS Configuration
const allowedOrigins = [
  ENV.CLIENT_URL,
  ENV.ADMIN_URL,
  ENV.LANDING_URL,
  ENV.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl) or allowed origins
    if (!origin || allowedOrigins.includes(origin) || ENV.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('CORS blocked origin'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
}));

// Request logger
if (ENV.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing with Raw Body support for Razorpay webhooks
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiting
app.use(rateLimiter({ windowMs: 60000, max: 250 }));

// Mount all API routes
app.use('/api', routes);

// 404 Route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND'
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;
