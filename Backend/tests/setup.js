import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { dbName: "jest" });
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({}))
  );
});

afterAll(async () => {
  // Clear all models to prevent "module is already linked" errors
  Object.keys(mongoose.models).forEach((modelName) => {
    delete mongoose.models[modelName];
  });
  Object.keys(mongoose.modelSchemas).forEach((schemaName) => {
    delete mongoose.modelSchemas[schemaName];
  });

  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
