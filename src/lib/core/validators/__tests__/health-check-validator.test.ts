import { describe, it, expect } from "vitest";
import { HealthCheckValidator } from "../health-check-validator";
import { ValidationError } from "zod";

describe("HealthCheckValidator", () => {
  describe("validateCreateData", () => {
    it("should validate valid health check data", () => {
      const connectionId = "test-connection-id";
      const data = {
        endpoint: "/health",
        method: "GET",
        expectedStatus: 200,
        timeout: 5000,
        interval: 300,
        headers: { "Content-Type": "application/json" },
        body: undefined,
        queryParams: { debug: "true" },
      };

      const result = HealthCheckValidator.validateCreateData(
        connectionId,
        data
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe("Validation successful");
    });

    it("should validate health check data with minimal fields", () => {
      const connectionId = "test-connection-id";
      const data = {
        endpoint: "/health",
        method: "GET",
        expectedStatus: 200,
        timeout: 5000,
        interval: 300,
      };

      const result = HealthCheckValidator.validateCreateData(
        connectionId,
        data
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe("Validation successful");
    });

    it("should handle invalid endpoint", () => {
      const connectionId = "test-connection-id";
      const data = {
        endpoint: "", // Invalid: empty string
      };

      const result = HealthCheckValidator.validateCreateData(
        connectionId,
        data
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Validation failed");
      expect(result.zodError).toBeDefined();
    });

    it("should handle invalid method", () => {
      const connectionId = "test-connection-id";
      const data = {
        endpoint: "/health",
        method: "INVALID", // Invalid method
      };

      const result = HealthCheckValidator.validateCreateData(
        connectionId,
        data
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Validation failed");
      expect(result.zodError).toBeDefined();
    });

    it("should handle invalid expected status", () => {
      const connectionId = "test-connection-id";
      const data = {
        endpoint: "/health",
        expectedStatus: 999, // Invalid status code
      };

      const result = HealthCheckValidator.validateCreateData(
        connectionId,
        data
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Validation failed");
      expect(result.zodError).toBeDefined();
    });

    it("should handle invalid timeout", () => {
      const connectionId = "test-connection-id";
      const data = {
        endpoint: "/health",
        timeout: 0, // Invalid: must be positive
      };

      const result = HealthCheckValidator.validateCreateData(
        connectionId,
        data
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Validation failed");
      expect(result.zodError).toBeDefined();
    });

    it("should handle invalid interval", () => {
      const connectionId = "test-connection-id";
      const data = {
        endpoint: "/health",
        interval: 59, // Invalid: must be at least 60 seconds
      };

      const result = HealthCheckValidator.validateCreateData(
        connectionId,
        data
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Validation failed");
      expect(result.zodError).toBeDefined();
    });

    it("should handle invalid headers", () => {
      const connectionId = "test-connection-id";
      const data = {
        endpoint: "/health",
        headers: "invalid", // Invalid: should be object
      };

      const result = HealthCheckValidator.validateCreateData(
        connectionId,
        data
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Validation failed");
      expect(result.zodError).toBeDefined();
    });

    it("should handle invalid query params", () => {
      const connectionId = "test-connection-id";
      const data = {
        endpoint: "/health",
        queryParams: "invalid", // Invalid: should be object
      };

      const result = HealthCheckValidator.validateCreateData(
        connectionId,
        data
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Validation failed");
      expect(result.zodError).toBeDefined();
    });

    it("should handle missing connection ID", () => {
      const connectionId = ""; // Invalid: empty string
      const data = {
        endpoint: "/health",
      };

      const result = HealthCheckValidator.validateCreateData(
        connectionId,
        data
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Validation failed");
      expect(result.zodError).toBeDefined();
    });

    it("should handle valid data with all optional fields", () => {
      const connectionId = "test-connection-id";
      const data = {
        endpoint: "/api/health",
        method: "POST",
        expectedStatus: 201,
        timeout: 10000,
        interval: 600,
        headers: { Authorization: "Bearer token" },
        body: JSON.stringify({ test: true }),
        queryParams: { version: "v1" },
      };

      const result = HealthCheckValidator.validateCreateData(
        connectionId,
        data
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe("Validation successful");
    });
  });
});
