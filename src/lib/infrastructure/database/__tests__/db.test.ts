import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock PrismaClient
const mockPrismaClient = {
  $connect: vi.fn(),
  $disconnect: vi.fn(),
  user: {},
  apiConnection: {},
  healthCheck: {},
  checkResult: {},
};

vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn(() => mockPrismaClient),
}));

describe("Database", () => {
  let originalEnv: NodeJS.ProcessEnv;
  let originalGlobal: any;

  beforeEach(() => {
    originalEnv = process.env;
    originalGlobal = globalThis;
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    globalThis = originalGlobal;
  });

  it("should create PrismaClient instance", async () => {
    // Clear module cache to ensure fresh import
    vi.resetModules();

    const { prisma } = await import("../db");

    expect(prisma).toBeDefined();
    expect(prisma).toBe(mockPrismaClient);
  });

  it("should reuse existing instance in non-production environment", async () => {
    process.env.NODE_ENV = "development";

    // Clear module cache
    vi.resetModules();

    // Mock globalThis with existing prisma instance
    const existingPrisma = { existing: true };
    (globalThis as any).prisma = existingPrisma;

    const { prisma } = await import("../db");

    expect(prisma).toBe(existingPrisma);
  });

  it("should create new instance in production environment", async () => {
    process.env.NODE_ENV = "production";

    // Clear module cache
    vi.resetModules();

    // Mock globalThis without existing prisma
    delete (globalThis as any).prisma;

    const { prisma } = await import("../db");

    expect(prisma).toBeDefined();
    expect(prisma).toBe(mockPrismaClient);
  });

  it("should not store instance in globalThis in production", async () => {
    process.env.NODE_ENV = "production";

    // Clear module cache
    vi.resetModules();

    // Mock globalThis without existing prisma
    delete (globalThis as any).prisma;

    await import("../db");

    // In production, globalThis.prisma should remain undefined
    expect((globalThis as any).prisma).toBeUndefined();
  });

  it("should store instance in globalThis in non-production", async () => {
    process.env.NODE_ENV = "development";

    // Clear module cache
    vi.resetModules();

    // Mock globalThis without existing prisma
    delete (globalThis as any).prisma;

    await import("../db");

    // In non-production, globalThis.prisma should be set
    expect((globalThis as any).prisma).toBe(mockPrismaClient);
  });

  it("should handle undefined NODE_ENV", async () => {
    delete process.env.NODE_ENV;

    // Clear module cache
    vi.resetModules();

    // Mock globalThis without existing prisma
    delete (globalThis as any).prisma;

    await import("../db");

    // When NODE_ENV is undefined, it should be treated as non-production
    expect((globalThis as any).prisma).toBe(mockPrismaClient);
  });
});
