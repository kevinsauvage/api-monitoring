import { vi } from "vitest";

// Mock logger
export const mockLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

vi.mock("@/lib/shared/utils/logger", () => ({
  log: mockLogger,
}));


