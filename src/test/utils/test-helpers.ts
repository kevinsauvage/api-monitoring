import { vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { mockPrisma } from "../mocks/prisma.mock";

// Re-export mockPrisma for convenience
export { mockPrisma };

// Helper to setup repository mocks
export const setupRepositoryMocks = () => {
  return {
    prisma: mockPrisma,
  };
};

// Helper to mock successful database operations
export const mockSuccessfulOperation = <T>(data: T) => {
  return vi.fn().mockResolvedValue(data);
};

// Helper to mock failed database operations
export const mockFailedOperation = (error: Error) => {
  return vi.fn().mockRejectedValue(error);
};

// Helper to create mock repository responses
export const createMockRepositoryResponse = <T>(data: T | T[]) => {
  return {
    data: Array.isArray(data) ? data : [data],
    count: Array.isArray(data) ? data.length : 1,
  };
};

// Helper to wait for async operations
export const waitFor = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Helper to create mock error
export const createMockError = (message: string, code?: string) => {
  const error = new Error(message);
  if (code) {
    (error as any).code = code;
  }
  return error;
};

// Helper to mock Prisma transaction
export const mockTransaction = <T>(result: T) => {
  mockPrisma.$transaction.mockImplementation(
    async (callback: (db: typeof mockPrisma) => Promise<unknown> | unknown) =>
      callback(mockPrisma)
  );
  return result;
};

// Helper to reset all mocks
export const resetAllMocks = () => {
  vi.clearAllMocks();
  // Don't reset the mock structure, just clear the mock calls
  if (mockPrisma) {
    Object.values(mockPrisma).forEach((model) => {
      if (
        typeof model === "object" &&
        model !== null &&
        model !== mockPrisma.reset
      ) {
        Object.values(model).forEach((method) => {
          if (typeof method === "function") {
            if (vi.isMockFunction(method)) {
              method.mockReset();
            }
          }
        });
      }
    });
  }
};
