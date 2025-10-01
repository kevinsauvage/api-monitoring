import "@testing-library/jest-dom/vitest";

import { beforeAll, afterAll, afterEach, vi, beforeEach } from "vitest";
import { mockPrisma } from "./mocks/prisma.mock";

beforeEach(() => {
  vi.stubEnv("NEXTAUTH_SECRET", "test");
  vi.stubEnv("GOOGLE_CLIENT_ID", "test");
  vi.stubEnv("GOOGLE_CLIENT_SECRET", "test");
  vi.stubEnv("GITHUB_CLIENT_ID", "test");
  vi.stubEnv("GITHUB_CLIENT_SECRET", "test");
  vi.stubEnv("CRON_SECRET", "test");
  vi.stubEnv("ENCRYPTION_KEY", "12345678901234567890123456789012");
  vi.stubEnv("NODE_ENV", "test");
});

// Cleanup after each test
afterEach(() => {
  mockPrisma.reset();
});

// Global test setup
beforeAll(async () => {
  vi.stubEnv("NEXTAUTH_SECRET", "test");
  vi.stubEnv("GOOGLE_CLIENT_ID", "test");
  vi.stubEnv("GOOGLE_CLIENT_SECRET", "test");
  vi.stubEnv("GITHUB_CLIENT_ID", "test");
  vi.stubEnv("GITHUB_CLIENT_SECRET", "test");
  vi.stubEnv("CRON_SECRET", "test");
  vi.stubEnv("ENCRYPTION_KEY", "12345678901234567890123456789012");
  vi.stubEnv("NODE_ENV", "test");

  // Setup any global test configuration here
});

// Global test teardown
afterAll(async () => {
  // Cleanup any global test resources here
});
