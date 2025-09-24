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
});

// Mock Prisma Client
export const mockPrisma = {
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
  reset: () => {
    Object.values(mockPrisma).forEach((model) => {
      if (
        typeof model === "object" &&
        model !== null &&
        model !== mockPrisma.reset
      ) {
        Object.values(model).forEach((method) => {
          if (typeof method === "function") {
            vi.mocked(method).mockReset();
          }
        });
      }
    });
  },
} as unknown as PrismaClient;

// Mock the prisma instance
vi.mock("@/lib/infrastructure/database", () => ({
  prisma: mockPrisma,
}));
