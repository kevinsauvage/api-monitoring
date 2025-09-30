import { PrismaClient } from "@prisma/client";

import { envPrivate } from "@/lib/shared/utils/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (envPrivate().NODE_ENV !== "production") globalForPrisma.prisma = prisma;
