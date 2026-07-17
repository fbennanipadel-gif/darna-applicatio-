import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import visitRoutes from './routes/visitRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler, notFound } from './middleware/error.js';

function sanitize(value) {
  if (Array.isArray(value)) {
    value.forEach(sanitize);
    return;
  }

  if (!value || typeof value !== 'object') return;

  Object.keys(value).forEach((key) => {
    if (key.startsWith('$') || key.includes('.')) {
      delete value[key];
      return;
    }

    sanitize(value[key]);
  });
}

function getAllowedOrigins() {
  const configured = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const vercelRuntimeUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : null;

  return new Set([...configured, vercelRuntimeUrl].filter(Boolean));
}

function isAllowedOrigin(origin) {
  if (!origin) return true;
  return getAllowedOrigins().has(origin);
}

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({
    origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
    credentials: true,
  }));

  const skipInDev = () => process.env.NODE_ENV === 'development';

  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: skipInDev,
  }));

  app.use('/api/auth', rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: skipInDev,
  }));

  app.use(express.json({ limit: '1mb' }));
  app.use((req, res, next) => {
    sanitize(req.body);
    sanitize(req.params);
    next();
  });
  app.use(cookieParser());

  if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

  app.get('/api/health', async (req, res) => {
    const mongoose = (await import('mongoose')).default;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    let dbPing = null;
    if (mongoose.connection.readyState === 1) {
      const t0 = Date.now();
      try {
        await mongoose.connection.db.admin().ping();
        dbPing = Date.now() - t0;
      } catch {
        dbPing = -1;
      }
    }
    res.json({
      status: 'ok',
      service: 'darna-api',
      db: states[mongoose.connection.readyState] || 'unknown',
      dbPingMs: dbPing,
      time: new Date().toISOString(),
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/restaurants', restaurantRoutes);
  app.use('/api/visits', visitRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/users', userRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
