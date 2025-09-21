import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the service registry
const mockRegisterAllServices = vi.fn();
vi.mock("../service-registry", () => ({
  registerAllServices: mockRegisterAllServices,
}));

describe("DI Initialization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the module state by clearing the module cache
    vi.resetModules();
  });

  describe("initializeDI", () => {
    it("should register all services on first call", async () => {
      // Re-import to get fresh module state
      const { initializeDI } = await import("../init");

      initializeDI();

      expect(mockRegisterAllServices).toHaveBeenCalledOnce();
    });

    it("should not register services on subsequent calls", async () => {
      // Re-import to get fresh module state
      const { initializeDI } = await import("../init");

      // First call
      initializeDI();
      expect(mockRegisterAllServices).toHaveBeenCalledTimes(1);

      // Second call
      initializeDI();
      expect(mockRegisterAllServices).toHaveBeenCalledTimes(1); // Should not be called again

      // Third call
      initializeDI();
      expect(mockRegisterAllServices).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it("should be safe to call multiple times", async () => {
      // Re-import to get fresh module state
      const { initializeDI } = await import("../init");

      expect(() => {
        initializeDI();
        initializeDI();
        initializeDI();
      }).not.toThrow();
    });

    it("should call registerAllServices exactly once", async () => {
      // Re-import to get fresh module state
      const { initializeDI } = await import("../init");

      initializeDI();
      initializeDI();
      initializeDI();

      expect(mockRegisterAllServices).toHaveBeenCalledTimes(1);
    });
  });

  describe("isDIInitialized", () => {
    it("should return false before initialization", async () => {
      // Re-import to get fresh module state
      const { isDIInitialized } = await import("../init");

      expect(isDIInitialized()).toBe(false);
    });

    it("should return true after initialization", async () => {
      // Re-import to get fresh module state
      const { initializeDI, isDIInitialized } = await import("../init");

      expect(isDIInitialized()).toBe(false);

      initializeDI();

      expect(isDIInitialized()).toBe(true);
    });

    it("should remain true after multiple initialization calls", async () => {
      // Re-import to get fresh module state
      const { initializeDI, isDIInitialized } = await import("../init");

      initializeDI();
      expect(isDIInitialized()).toBe(true);

      initializeDI();
      expect(isDIInitialized()).toBe(true);

      initializeDI();
      expect(isDIInitialized()).toBe(true);
    });
  });

  describe("module state management", () => {
    it("should maintain state across multiple imports", async () => {
      // First import and initialization
      const module1 = await import("../init");
      module1.initializeDI();
      expect(module1.isDIInitialized()).toBe(true);

      // Second import should see the same state
      const module2 = await import("../init");
      expect(module2.isDIInitialized()).toBe(true);

      // Third import should also see the same state
      const module3 = await import("../init");
      expect(module3.isDIInitialized()).toBe(true);
    });

    it("should handle concurrent initialization calls", async () => {
      // Re-import to get fresh module state
      const { initializeDI, isDIInitialized } = await import("../init");

      // Simulate concurrent calls
      const promises = Array.from({ length: 10 }, () =>
        Promise.resolve(initializeDI())
      );

      return Promise.all(promises).then(() => {
        expect(isDIInitialized()).toBe(true);
        expect(mockRegisterAllServices).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("error handling", () => {
    it("should handle errors in registerAllServices", async () => {
      const error = new Error("Registration failed");
      mockRegisterAllServices.mockImplementation(() => {
        throw error;
      });

      // Re-import to get fresh module state
      const { initializeDI, isDIInitialized } = await import("../init");

      expect(() => initializeDI()).toThrow("Registration failed");
      expect(isDIInitialized()).toBe(false);
    });

    it("should not initialize if registration fails", async () => {
      const error = new Error("Registration failed");
      mockRegisterAllServices.mockImplementation(() => {
        throw error;
      });

      // Re-import to get fresh module state
      const { initializeDI, isDIInitialized } = await import("../init");

      try {
        initializeDI();
      } catch (e) {
        // Expected to throw
      }

      expect(isDIInitialized()).toBe(false);
    });
  });
});
