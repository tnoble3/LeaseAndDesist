import prisma from '../lib/prismaClient.js';

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});
