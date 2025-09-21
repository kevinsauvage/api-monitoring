import { beforeAll, afterAll, afterEach } from "vitest";
import { mockPrisma } from "./mocks/prisma.mock";

// Cleanup after each test
afterEach(() => {
  mockPrisma.reset();
});

// Global test setup
beforeAll(async () => {
  // Setup any global test configuration here
});

// Global test teardown
afterAll(async () => {
  // Cleanup any global test resources here
});
