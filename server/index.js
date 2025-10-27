import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import prisma from './lib/prismaClient.js';
import { authenticate } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL is not set. Prisma will be unable to connect to your database.');
}

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET is not set. Authentication tokens will fail to sign.');
}

app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

const boot = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL via Prisma');
  } catch (err) {
    console.error('❌ Failed to connect to database', err);
    process.exit(1);
  }
};

app.use('/api/auth', authRoutes);

app.get('/api', (req, res) => {
  res.json({ message: 'Hello from Express + Prisma + PostgreSQL!' });
});

app.get('/api/ping', authenticate, (req, res) => {
  res.json({ message: 'pong', userId: req.user.id });
});

let server;

boot()
  .then(() => {
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(() => {
    process.exit(1);
  });

const gracefulShutdown = async () => {
  console.log('Shutting down gracefully…');
  await prisma.$disconnect();
  if (server) {
    server.close(() => process.exit(0));
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
