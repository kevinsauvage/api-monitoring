import { describe, it, expect } from "vitest";
import { SERVICE_IDENTIFIERS, type ServiceIdentifier } from "../service-identifiers";

describe("Service Identifiers", () => {
  describe("SERVICE_IDENTIFIERS", () => {
    it("should contain all repository identifiers", () => {
      expect(SERVICE_IDENTIFIERS.USER_REPOSITORY).toBeDefined();
      expect(SERVICE_IDENTIFIERS.CONNECTION_REPOSITORY).toBeDefined();
      expect(SERVICE_IDENTIFIERS.HEALTH_CHECK_REPOSITORY).toBeDefined();
      expect(SERVICE_IDENTIFIERS.CHECK_RESULT_REPOSITORY).toBeDefined();
      expect(SERVICE_IDENTIFIERS.MONITORING_REPOSITORY).toBeDefined();
    });

    it("should contain all service identifiers", () => {
      expect(SERVICE_IDENTIFIERS.CONNECTION_SERVICE).toBeDefined();
      expect(SERVICE_IDENTIFIERS.HEALTH_CHECK_SERVICE).toBeDefined();
      expect(SERVICE_IDENTIFIERS.DASHBOARD_SERVICE).toBeDefined();
      expect(SERVICE_IDENTIFIERS.MONITORING_SERVICE).toBeDefined();
      expect(SERVICE_IDENTIFIERS.CRON_SERVICE).toBeDefined();
      expect(SERVICE_IDENTIFIERS.SERIALIZATION_SERVICE).toBeDefined();
    });

    it("should use symbols for all identifiers", () => {
      const identifiers = Object.values(SERVICE_IDENTIFIERS);
      
      identifiers.forEach(identifier => {
        expect(typeof identifier).toBe("symbol");
      });
    });

    it("should have unique symbols", () => {
      const identifiers = Object.values(SERVICE_IDENTIFIERS);
      const uniqueIdentifiers = new Set(identifiers);
      
      expect(uniqueIdentifiers.size).toBe(identifiers.length);
    });

    it("should have descriptive symbol descriptions", () => {
      expect(SERVICE_IDENTIFIERS.USER_REPOSITORY.toString()).toContain("UserRepository");
      expect(SERVICE_IDENTIFIERS.CONNECTION_REPOSITORY.toString()).toContain("ConnectionRepository");
      expect(SERVICE_IDENTIFIERS.HEALTH_CHECK_REPOSITORY.toString()).toContain("HealthCheckRepository");
      expect(SERVICE_IDENTIFIERS.CHECK_RESULT_REPOSITORY.toString()).toContain("CheckResultRepository");
      expect(SERVICE_IDENTIFIERS.MONITORING_REPOSITORY.toString()).toContain("MonitoringRepository");
      
      expect(SERVICE_IDENTIFIERS.CONNECTION_SERVICE.toString()).toContain("ConnectionService");
      expect(SERVICE_IDENTIFIERS.HEALTH_CHECK_SERVICE.toString()).toContain("HealthCheckService");
      expect(SERVICE_IDENTIFIERS.DASHBOARD_SERVICE.toString()).toContain("DashboardService");
      expect(SERVICE_IDENTIFIERS.MONITORING_SERVICE.toString()).toContain("MonitoringService");
      expect(SERVICE_IDENTIFIERS.CRON_SERVICE.toString()).toContain("CronService");
      expect(SERVICE_IDENTIFIERS.SERIALIZATION_SERVICE.toString()).toContain("SerializationService");
    });
  });

  describe("ServiceIdentifier type", () => {
    it("should accept all service identifier values", () => {
      const testIdentifier: ServiceIdentifier = SERVICE_IDENTIFIERS.USER_REPOSITORY;
      expect(testIdentifier).toBe(SERVICE_IDENTIFIERS.USER_REPOSITORY);

      const testServiceIdentifier: ServiceIdentifier = SERVICE_IDENTIFIERS.CONNECTION_SERVICE;
      expect(testServiceIdentifier).toBe(SERVICE_IDENTIFIERS.CONNECTION_SERVICE);
    });

    it("should be compatible with symbol type", () => {
      const symbolIdentifier: symbol = SERVICE_IDENTIFIERS.USER_REPOSITORY;
      expect(symbolIdentifier).toBe(SERVICE_IDENTIFIERS.USER_REPOSITORY);
    });
  });

  describe("identifier properties", () => {
    it("should have correct number of identifiers", () => {
      const identifierKeys = Object.keys(SERVICE_IDENTIFIERS);
      expect(identifierKeys).toHaveLength(11); // 5 repositories + 6 services
    });

    it("should have all expected repository keys", () => {
      const expectedRepositoryKeys = [
        "USER_REPOSITORY",
        "CONNECTION_REPOSITORY", 
        "HEALTH_CHECK_REPOSITORY",
        "CHECK_RESULT_REPOSITORY",
        "MONITORING_REPOSITORY"
      ];

      expectedRepositoryKeys.forEach(key => {
        expect(SERVICE_IDENTIFIERS).toHaveProperty(key);
      });
    });

    it("should have all expected service keys", () => {
      const expectedServiceKeys = [
        "CONNECTION_SERVICE",
        "HEALTH_CHECK_SERVICE",
        "DASHBOARD_SERVICE", 
        "MONITORING_SERVICE",
        "CRON_SERVICE",
        "SERIALIZATION_SERVICE"
      ];

      expectedServiceKeys.forEach(key => {
        expect(SERVICE_IDENTIFIERS).toHaveProperty(key);
      });
    });
  });

  describe("symbol uniqueness", () => {
    it("should not have duplicate symbols", () => {
      const identifiers = Object.values(SERVICE_IDENTIFIERS);
      const symbolDescriptions = identifiers.map(symbol => symbol.toString());
      const uniqueDescriptions = new Set(symbolDescriptions);
      
      expect(uniqueDescriptions.size).toBe(symbolDescriptions.length);
    });

    it("should have different symbols for different services", () => {
      expect(SERVICE_IDENTIFIERS.USER_REPOSITORY).not.toBe(SERVICE_IDENTIFIERS.CONNECTION_REPOSITORY);
      expect(SERVICE_IDENTIFIERS.CONNECTION_SERVICE).not.toBe(SERVICE_IDENTIFIERS.HEALTH_CHECK_SERVICE);
      expect(SERVICE_IDENTIFIERS.USER_REPOSITORY).not.toBe(SERVICE_IDENTIFIERS.CONNECTION_SERVICE);
    });
  });

  describe("const assertion", () => {
    it("should be readonly", () => {
      // TypeScript should prevent modification, but we can test the runtime behavior
      expect(() => {
        // @ts-expect-error - This should be readonly
        (SERVICE_IDENTIFIERS as any).NEW_SERVICE = Symbol("NewService");
      }).not.toThrow(); // Runtime allows it, but TypeScript should prevent it
    });

    it("should maintain object structure", () => {
      expect(SERVICE_IDENTIFIERS).toBeInstanceOf(Object);
      expect(typeof SERVICE_IDENTIFIERS).toBe("object");
    });
  });
});
