import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import prisma from "../services/prismaClient.js";

let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { dbName: "jest" });

  // Ensure Prisma database table exists for tests (sqlite file: ./dev.db)
  try {
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "AiFeedback" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "submissionId" TEXT NOT NULL UNIQUE,
      "prompt" TEXT NOT NULL,
      "response" TEXT NOT NULL,
      "source" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`);
  } catch (e) {
    console.warn("Prisma table setup warning:", e?.message || e);
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({}))
  );
  try {
    // keep prisma aiFeedback table empty between tests
    await prisma.aiFeedback.deleteMany();
  } catch (e) {
    // ignore
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
  try {
    await prisma.$disconnect();
  } catch {}
});
