import { describe, it, expect, beforeEach, vi } from "vitest";
import { MonitoringRepository } from "../monitoring.repository";
import { mockPrisma, resetAllMocks } from "../../../../test/utils/test-helpers";
import {
  createTestHealthCheck,
  createTestCheckResult,
} from "../../../../test/utils/test-data";

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

      mockPrisma.healthCheck.findMany.mockResolvedValue(mockHealthChecks);
      const aggregatedResults = [
        {
          healthCheckId: mockHealthChecks[0].id,
          status: "SUCCESS",
          _count: { _all: 9 },
          _avg: { responseTime: 150 },
        },
        {
          healthCheckId: mockHealthChecks[0].id,
          status: "FAILURE",
          _count: { _all: 1 },
          _avg: { responseTime: 150 },
        },
      ];

      mockPrisma.checkResult.groupBy.mockResolvedValueOnce(aggregatedResults);

      const result = await repository.getHealthChecksWithStats(connectionId);

      expect(mockPrisma.healthCheck.findMany).toHaveBeenCalledWith({
        where: { apiConnectionId: connectionId },
        orderBy: { createdAt: "desc" },
      });
      expect(mockPrisma.checkResult.groupBy).toHaveBeenCalledWith({
        by: ["healthCheckId", "status"],
        where: {
          healthCheckId: { in: [mockHealthChecks[0].id] },
          timestamp: {
            gte: expect.any(Date),
          },
        },
        _count: { _all: true },
        _avg: { responseTime: true },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("stats", {
        totalChecks: 10,
        successRate: 90,
        averageResponseTime: 150,
        recentFailures: 1,
      });
    });
  });

  describe("getHealthCheckStats", () => {
    it("should get statistics for a health check", async () => {
      const healthCheckId = "test-health-check-id";
      const days = 7;
      const aggregatedResults = [
        {
          healthCheckId,
          status: "SUCCESS",
          _count: { _all: 2 },
          _avg: { responseTime: 150 },
        },
        {
          healthCheckId,
          status: "FAILURE",
          _count: { _all: 1 },
          _avg: { responseTime: 150 },
        },
      ];

      mockPrisma.checkResult.groupBy.mockResolvedValueOnce(aggregatedResults);

      const result = await repository.getHealthCheckStats(healthCheckId, days);

      expect(mockPrisma.checkResult.groupBy).toHaveBeenCalledWith({
        by: ["healthCheckId", "status"],
        where: {
          healthCheckId: { in: [healthCheckId] },
          timestamp: {
            gte: expect.any(Date),
          },
        },
        _count: { _all: true },
        _avg: { responseTime: true },
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
      mockPrisma.checkResult.aggregate.mockResolvedValue({
        _count: { _all: 3 },
        _avg: { responseTime: 150 },
      });
      mockPrisma.checkResult.count.mockResolvedValue(2);

      const result = await repository.getDashboardStats(userId);

      expect(mockPrisma.checkResult.aggregate).toHaveBeenCalledWith({
        where: {
          healthCheck: {
            apiConnection: { userId },
          },
          timestamp: {
            gte: expect.any(Date),
          },
        },
        _count: { _all: true },
        _avg: { responseTime: true },
      });
      expect(mockPrisma.checkResult.count).toHaveBeenCalledWith({
        where: {
          healthCheck: {
            apiConnection: { userId },
          },
          timestamp: {
            gte: expect.any(Date),
          },
          status: "SUCCESS",
        },
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
