import { vi } from "vitest";
import type { PrismaClient } from "@prisma/client";

// Create mock functions
const createMockModel = () => ({
  findUnique: vi.fn(),
  findFirst: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
  delete: vi.fn(),
  deleteMany: vi.fn(),
  count: vi.fn(),
  aggregate: vi.fn(),
  groupBy: vi.fn(),
});

// Mock Prisma Client
const prismaMock: any = {
  user: {
    ...createMockModel(),
    findByIdWithSubscription: vi.fn(),
  },
  apiConnection: {
    ...createMockModel(),
    findByUserIdWithHealthChecks: vi.fn(),
  },
  healthCheck: createMockModel(),
  checkResult: createMockModel(),
  $transaction: vi.fn(),
  $connect: vi.fn(),
  $disconnect: vi.fn(),
  reset() {
    Object.values(prismaMock).forEach((model) => {
      if (
        typeof model === "object" &&
        model !== null &&
        model !== prismaMock.reset
      ) {
        Object.values(model).forEach((method) => {
          if (typeof method === "function" && vi.isMockFunction(method)) {
            method.mockReset();
          }
        });
      }
    });
  },
};

export const mockPrisma = prismaMock as PrismaClient & typeof prismaMock;

// Mock the prisma instance
vi.mock("@/lib/infrastructure/database", () => ({
  prisma: mockPrisma,
}));
