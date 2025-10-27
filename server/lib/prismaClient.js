import { PrismaClient } from '@prisma/client';

const prismaGlobal = globalThis;

const prisma = prismaGlobal.prismaClient ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  prismaGlobal.prismaClient = prisma;
}

export default prisma;
