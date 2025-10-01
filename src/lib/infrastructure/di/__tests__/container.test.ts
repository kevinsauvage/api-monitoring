import { describe, it, expect, beforeEach, vi } from "vitest";
import { DIContainer, container } from "../container";
import { SERVICE_IDENTIFIERS } from "../service-identifiers";

describe("DIContainer", () => {
  let testContainer: DIContainer;

  beforeEach(() => {
    // Create a fresh container instance for testing
    testContainer = new (DIContainer as any)();
    vi.clearAllMocks();
  });

  describe("getInstance", () => {
    it("should return singleton instance", () => {
      const instance1 = DIContainer.getInstance();
      const instance2 = DIContainer.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe("register", () => {
    it("should register a service factory", () => {
      const factory = vi.fn(() => "test-service");
      const identifier = SERVICE_IDENTIFIERS.USER_REPOSITORY;

      testContainer.register(identifier, factory);

      expect(testContainer.has(identifier)).toBe(true);
    });

    it("should allow registering multiple services", () => {
      const factory1 = vi.fn(() => "service1");
      const factory2 = vi.fn(() => "service2");

      testContainer.register(SERVICE_IDENTIFIERS.USER_REPOSITORY, factory1);
      testContainer.register(
        SERVICE_IDENTIFIERS.CONNECTION_REPOSITORY,
        factory2
      );

      expect(testContainer.has(SERVICE_IDENTIFIERS.USER_REPOSITORY)).toBe(true);
      expect(testContainer.has(SERVICE_IDENTIFIERS.CONNECTION_REPOSITORY)).toBe(
        true
      );
    });
  });

  describe("registerSingleton", () => {
    it("should register a singleton service", () => {
      const factory = vi.fn(() => "singleton-service");
      const identifier = SERVICE_IDENTIFIERS.USER_REPOSITORY;

      testContainer.registerSingleton(identifier, factory);

      expect(testContainer.has(identifier)).toBe(true);
      expect(testContainer.singletons.has(identifier)).toBe(true);
    });

    it("should initialize singleton with null value", () => {
      const factory = vi.fn(() => "singleton-service");
      const identifier = SERVICE_IDENTIFIERS.USER_REPOSITORY;

      testContainer.registerSingleton(identifier, factory);

      expect(testContainer.singletons.get(identifier)).toBe(null);
    });
  });

  describe("resolve", () => {
    it("should resolve a registered service", () => {
      const serviceInstance = "test-service";
      const factory = vi.fn(() => serviceInstance);
      const identifier = SERVICE_IDENTIFIERS.USER_REPOSITORY;

      testContainer.register(identifier, factory);
      const result = testContainer.resolve(identifier);

      expect(result).toBe(serviceInstance);
      expect(factory).toHaveBeenCalledOnce();
    });

    it("should resolve singleton service only once", () => {
      const serviceInstance = "singleton-service";
      const factory = vi.fn(() => serviceInstance);
      const identifier = SERVICE_IDENTIFIERS.USER_REPOSITORY;

      testContainer.registerSingleton(identifier, factory);

      // First resolution
      const result1 = testContainer.resolve(identifier);
      // Second resolution
      const result2 = testContainer.resolve(identifier);

      expect(result1).toBe(serviceInstance);
      expect(result2).toBe(serviceInstance);
      expect(result1).toBe(result2); // Same instance
      expect(factory).toHaveBeenCalledOnce(); // Factory called only once
    });

    it("should throw error for unregistered service", () => {
      const identifier = SERVICE_IDENTIFIERS.USER_REPOSITORY;

      expect(() => testContainer.resolve(identifier)).toThrow(
        `Service with identifier '${String(identifier)}' not found`
      );
    });

    it("should create new instance for non-singleton service on each resolve", () => {
      const factory = vi.fn(() => ({ id: Math.random() }));
      const identifier = SERVICE_IDENTIFIERS.USER_REPOSITORY;

      testContainer.register(identifier, factory);

      const result1 = testContainer.resolve(identifier);
      const result2 = testContainer.resolve(identifier);

      expect(result1).not.toBe(result2); // Different instances
      expect(factory).toHaveBeenCalledTimes(2);
    });
  });

  describe("has", () => {
    it("should return true for registered service", () => {
      const factory = vi.fn(() => "test-service");
      const identifier = SERVICE_IDENTIFIERS.USER_REPOSITORY;

      testContainer.register(identifier, factory);

      expect(testContainer.has(identifier)).toBe(true);
    });

    it("should return false for unregistered service", () => {
      const identifier = SERVICE_IDENTIFIERS.USER_REPOSITORY;

      expect(testContainer.has(identifier)).toBe(false);
    });
  });

  describe("clear", () => {
    it("should clear all services and singletons", () => {
      const factory1 = vi.fn(() => "service1");
      const factory2 = vi.fn(() => "service2");

      testContainer.register(SERVICE_IDENTIFIERS.USER_REPOSITORY, factory1);
      testContainer.registerSingleton(
        SERVICE_IDENTIFIERS.CONNECTION_REPOSITORY,
        factory2
      );

      expect(testContainer.has(SERVICE_IDENTIFIERS.USER_REPOSITORY)).toBe(true);
      expect(testContainer.has(SERVICE_IDENTIFIERS.CONNECTION_REPOSITORY)).toBe(
        true
      );

      testContainer.clear();

      expect(testContainer.has(SERVICE_IDENTIFIERS.USER_REPOSITORY)).toBe(
        false
      );
      expect(testContainer.has(SERVICE_IDENTIFIERS.CONNECTION_REPOSITORY)).toBe(
        false
      );
      expect(testContainer.singletons.size).toBe(0);
    });
  });

  describe("singleton behavior", () => {
    it("should maintain singleton state across multiple resolves", () => {
      const factory = vi.fn(() => ({ timestamp: Date.now() }));
      const identifier = SERVICE_IDENTIFIERS.USER_REPOSITORY;

      testContainer.registerSingleton(identifier, factory);

      const result1 = testContainer.resolve(identifier);
      const result2 = testContainer.resolve(identifier);

      expect(result1).toBe(result2);
      expect(factory).toHaveBeenCalledOnce();
    });

    it("should handle singleton with complex objects", () => {
      const factory = vi.fn(() => ({
        id: "test-id",
        data: { nested: "value" },
        method: vi.fn(),
      }));
      const identifier = SERVICE_IDENTIFIERS.USER_REPOSITORY;

      testContainer.registerSingleton(identifier, factory);

      const result1 = testContainer.resolve(identifier);
      const result2 = testContainer.resolve(identifier);

      expect(result1).toBe(result2);
      expect(result1.id).toBe("test-id");
      expect(result1.data.nested).toBe("value");
      expect(typeof result1.method).toBe("function");
    });
  });
});

describe("Container Export", () => {
  it("should export singleton container instance", () => {
    expect(container).toBeDefined();
    expect(container).toBeInstanceOf(DIContainer);
  });

  it("should be the same instance as DIContainer.getInstance()", () => {
    const instance = DIContainer.getInstance();
    expect(container).toBe(instance);
  });
});
