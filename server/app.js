import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import { authenticate } from './middleware/authMiddleware.js';

dotenv.config();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

export const createApp = () => {
  const app = express();

  app.use(cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  }));
  app.use(cookieParser());
  app.use(express.json());

  app.use('/api/auth', authRoutes);

  app.get('/api', (req, res) => {
    res.json({ message: 'Hello from Express + Prisma + PostgreSQL!' });
  });

  app.get('/api/ping', authenticate, (req, res) => {
    res.json({ message: 'pong', userId: req.user.id });
  });

  return app;
};

const app = createApp();

export default app;
