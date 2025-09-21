import { describe, it, expect, beforeEach, vi } from "vitest";
import { MonitoringRepository } from "../monitoring.repository";
import { mockPrisma, resetAllMocks } from "@/test/utils/test-helpers";
import {
  createTestHealthCheck,
  createTestCheckResult,
} from "@/test/utils/test-data";

describe("MonitoringRepository", () => {
  let repository: MonitoringRepository;

  beforeEach(() => {
    resetAllMocks();
    repository = new MonitoringRepository();
  });

  describe("getHealthChecksWithStats", () => {
    it("should get health checks with statistics", async () => {
      const connectionId = "test-connection-id";
      const mockHealthChecks = [createTestHealthCheck()];
      const mockStats = {
        totalChecks: 10,
        successRate: 90,
        averageResponseTime: 150,
        recentFailures: 1,
      };

      mockPrisma.healthCheck.findMany.mockResolvedValue(mockHealthChecks);
      mockPrisma.checkResult.findMany.mockResolvedValue([
        createTestCheckResult({ status: "SUCCESS" }),
        createTestCheckResult({ status: "FAILURE" }),
      ]);

      const result = await repository.getHealthChecksWithStats(connectionId);

      expect(mockPrisma.healthCheck.findMany).toHaveBeenCalledWith({
        where: { apiConnectionId: connectionId },
        orderBy: { createdAt: "desc" },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("stats");
    });
  });

  describe("getHealthCheckStats", () => {
    it("should get statistics for a health check", async () => {
      const healthCheckId = "test-health-check-id";
      const days = 7;
      const mockResults = [
        createTestCheckResult({ status: "SUCCESS", responseTime: 100 }),
        createTestCheckResult({ status: "SUCCESS", responseTime: 200 }),
        createTestCheckResult({ status: "FAILURE", responseTime: 150 }),
      ];

      mockPrisma.checkResult.findMany.mockResolvedValue(mockResults);

      const result = await repository.getHealthCheckStats(healthCheckId, days);

      expect(mockPrisma.checkResult.findMany).toHaveBeenCalledWith({
        where: {
          healthCheckId,
          timestamp: {
            gte: expect.any(Date),
          },
        },
        orderBy: { timestamp: "desc" },
      });

      expect(result).toEqual({
        totalChecks: 3,
        successRate: 66.66666666666666,
        averageResponseTime: 150,
        recentFailures: 1,
      });
    });
  });

  describe("getDashboardStats", () => {
    it("should get dashboard statistics for user", async () => {
      const userId = "test-user-id";
      const mockResults = [
        createTestCheckResult({ status: "SUCCESS", responseTime: 100 }),
        createTestCheckResult({ status: "SUCCESS", responseTime: 200 }),
        createTestCheckResult({ status: "FAILURE", responseTime: 150 }),
      ];

      mockPrisma.checkResult.findMany.mockResolvedValue(mockResults);

      const result = await repository.getDashboardStats(userId);

      expect(mockPrisma.checkResult.findMany).toHaveBeenCalledWith({
        where: {
          healthCheck: {
            apiConnection: { userId },
          },
          timestamp: {
            gte: expect.any(Date),
          },
        },
        orderBy: { timestamp: "desc" },
      });

      expect(result).toEqual({
        totalChecks: 3,
        successRate: 66.66666666666666,
        averageResponseTime: 150,
        recentFailures: 1,
      });
    });
  });

  describe("storeResult", () => {
    it("should store a health check result", async () => {
      const resultData = {
        healthCheckId: "test-health-check-id",
        status: "SUCCESS" as const,
        responseTime: 150,
        statusCode: 200,
        errorMessage: null,
        metadata: { url: "https://api.example.com/health" },
      };

      const mockResult = createTestCheckResult();
      mockPrisma.checkResult.create.mockResolvedValue(mockResult);

      const result = await repository.storeResult(resultData);

      expect(mockPrisma.checkResult.create).toHaveBeenCalledWith({
        data: {
          healthCheckId: resultData.healthCheckId,
          status: resultData.status,
          responseTime: resultData.responseTime,
          statusCode: resultData.statusCode,
          errorMessage: resultData.errorMessage,
          metadata: resultData.metadata,
        },
      });
      expect(result).toEqual(mockResult);
    });
  });
});


