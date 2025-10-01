import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock loglevel
const mockLog = {
  setLevel: vi.fn(),
  trace: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

vi.mock("loglevel", () => ({
  default: mockLog,
}));

describe("Logger", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should set log level to info in production", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.NEXT_PUBLIC_LOG_LEVEL;

    // Re-import to trigger the module initialization
    vi.resetModules();
    await import("../logger");

    expect(mockLog.setLevel).toHaveBeenCalledWith("info");
  });

  it("should use LOG_LEVEL environment variable when set", async () => {
    process.env.NEXT_PUBLIC_LOG_LEVEL = "warn";

    // Re-import to trigger the module initialization
    vi.resetModules();
    await import("../logger");

    expect(mockLog.setLevel).toHaveBeenCalledWith("warn");
  });

  it("should export log instance", async () => {
    const { log, default: defaultLog } = await import("../logger");

    expect(log).toBe(mockLog);
    expect(defaultLog).toBe(mockLog);
  });
});
