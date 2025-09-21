import { describe, it, expect } from "vitest";
import {
  serializeHealthCheck,
  serializeHealthChecks,
  serializeHealthCheckWithStats,
} from "../health-check.serializer";
import { createTestHealthCheck } from "@/test/utils/test-data";

describe("Health Check Serializers", () => {
  describe("serializeHealthCheck", () => {
    it("should serialize a single health check", () => {
      const healthCheck = createTestHealthCheck();
      const result = serializeHealthCheck(healthCheck);

      expect(result).toEqual({
        id: healthCheck.id,
        apiConnectionId: healthCheck.apiConnectionId,
        endpoint: healthCheck.endpoint,
        method: healthCheck.method,
        expectedStatus: healthCheck.expectedStatus,
        timeout: healthCheck.timeout,
        interval: healthCheck.interval,
        headers: healthCheck.headers,
        body: healthCheck.body,
        queryParams: healthCheck.queryParams,
        isActive: healthCheck.isActive,
        lastExecutedAt: null,
        createdAt: healthCheck.createdAt.toISOString(),
        updatedAt: healthCheck.updatedAt.toISOString(),
      });
    });

    it("should handle date serialization correctly", () => {
      const healthCheck = createTestHealthCheck({
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-02T00:00:00Z"),
        lastExecutedAt: new Date("2024-01-03T00:00:00Z"),
      });
      const result = serializeHealthCheck(healthCheck);

      expect(result.createdAt).toBe("2024-01-01T00:00:00.000Z");
      expect(result.updatedAt).toBe("2024-01-02T00:00:00.000Z");
      expect(result.lastExecutedAt).toBe("2024-01-03T00:00:00.000Z");
    });

    it("should handle null lastExecutedAt", () => {
      const healthCheck = createTestHealthCheck({
        lastExecutedAt: null,
      });
      const result = serializeHealthCheck(healthCheck);

      expect(result.lastExecutedAt).toBeNull();
    });

    it("should handle string dates", () => {
      const healthCheck = {
        ...createTestHealthCheck(),
        createdAt: "2024-01-01T00:00:00Z" as any,
        updatedAt: "2024-01-02T00:00:00Z" as any,
        lastExecutedAt: "2024-01-03T00:00:00Z" as any,
      };
      const result = serializeHealthCheck(healthCheck);

      expect(result.createdAt).toBe("2024-01-01T00:00:00Z");
      expect(result.updatedAt).toBe("2024-01-02T00:00:00Z");
      expect(result.lastExecutedAt).toBe("2024-01-03T00:00:00Z");
    });
  });

  describe("serializeHealthChecks", () => {
    it("should serialize multiple health checks", () => {
      const healthChecks = [
        createTestHealthCheck({ id: "hc-1", endpoint: "/health" }),
        createTestHealthCheck({ id: "hc-2", endpoint: "/status" }),
      ];
      const result = serializeHealthChecks(healthChecks);

      expect(result).toHaveLength(2);
      expect(result[0].endpoint).toBe("/health");
      expect(result[1].endpoint).toBe("/status");
    });
  });

  describe("serializeHealthCheckWithStats", () => {
    it("should serialize health check with stats", () => {
      const healthCheck = {
        ...createTestHealthCheck(),
        stats: {
          totalChecks: 10,
          successRate: 90,
          averageResponseTime: 150,
          recentFailures: 1,
        },
      };
      const result = serializeHealthCheckWithStats(healthCheck);

      expect(result).toHaveProperty("stats");
      expect(result.stats).toEqual({
        totalChecks: 10,
        successRate: 90,
        averageResponseTime: 150,
        recentFailures: 1,
      });
    });

    it("should handle health check without stats", () => {
      const healthCheck = createTestHealthCheck();
      const result = serializeHealthCheck(healthCheck);

      expect(result).not.toHaveProperty("stats");
    });
  });
});
