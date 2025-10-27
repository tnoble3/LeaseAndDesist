import dotenv from 'dotenv';
import prisma from './lib/prismaClient.js';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL is not set. Prisma will be unable to connect to your database.');
}

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET is not set. Authentication tokens will fail to sign.');
}

let server;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL via Prisma');

    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server', err);
    process.exit(1);
  }
};

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

startServer();

export { app, startServer, gracefulShutdown };
