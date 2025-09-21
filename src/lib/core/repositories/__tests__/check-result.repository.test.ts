import { describe, it, expect, beforeEach, vi } from "vitest";
import { CheckResultRepository } from "../check-result.repository";
import { mockPrisma, resetAllMocks } from "../../../../test/utils/test-helpers";
import {
  createTestUser,
  createTestConnection,
  createTestHealthCheck,
} from "../../../../test/utils/test-data";

describe("CheckResultRepository", () => {
  let repository: CheckResultRepository;

  beforeEach(() => {
    resetAllMocks();
    repository = new CheckResultRepository();
    // Mock the prisma property
    (repository as any).prisma = mockPrisma;
  });

  describe("findByUserIdWithDetails", () => {
    it("should find check results for user with details", async () => {
      const userId = "test-user-id";
      const mockResults = [
        {
          id: "result-1",
          status: "SUCCESS",
          responseTime: 150,
          timestamp: new Date(),
          healthCheck: {
            id: "health-check-1",
            endpoint: "/health",
            method: "GET",
            apiConnection: {
              name: "Test API",
              provider: "REST",
            },
          },
        },
      ];

      mockPrisma.checkResult.findMany.mockResolvedValue(mockResults);

      const result = await repository.findByUserIdWithDetails(userId);

      expect(mockPrisma.checkResult.findMany).toHaveBeenCalledWith({
        where: {
          healthCheck: {
            apiConnection: {
              userId,
            },
          },
        },
        orderBy: { timestamp: "desc" },
        take: 50,
        include: {
          healthCheck: {
            select: {
              id: true,
              endpoint: true,
              method: true,
              apiConnection: {
                select: {
                  name: true,
                  provider: true,
                },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockResults);
    });

    it("should find check results with custom limit", async () => {
      const userId = "test-user-id";
      const limit = 25;
      const mockResults = [];

      mockPrisma.checkResult.findMany.mockResolvedValue(mockResults);

      const result = await repository.findByUserIdWithDetails(userId, limit);

      expect(mockPrisma.checkResult.findMany).toHaveBeenCalledWith({
        where: {
          healthCheck: {
            apiConnection: {
              userId,
            },
          },
        },
        orderBy: { timestamp: "desc" },
        take: limit,
        include: {
          healthCheck: {
            select: {
              id: true,
              endpoint: true,
              method: true,
              apiConnection: {
                select: {
                  name: true,
                  provider: true,
                },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockResults);
    });

    it("should handle database errors", async () => {
      const userId = "test-user-id";
      const error = new Error("Database connection failed");

      mockPrisma.checkResult.findMany.mockRejectedValue(error);

      await expect(repository.findByUserIdWithDetails(userId)).rejects.toThrow(
        "Failed to find check results for user"
      );
    });
  });

  describe("findByConnectionId", () => {
    it("should find check results for connection", async () => {
      const connectionId = "test-connection-id";
      const mockResults = [
        {
          id: "result-1",
          status: "SUCCESS",
          responseTime: 150,
          timestamp: new Date(),
          healthCheck: {
            id: "health-check-1",
            endpoint: "/health",
            method: "GET",
            apiConnection: {
              name: "Test API",
              provider: "REST",
            },
          },
        },
      ];

      mockPrisma.checkResult.findMany.mockResolvedValue(mockResults);

      const result = await repository.findByConnectionId(connectionId);

      expect(mockPrisma.checkResult.findMany).toHaveBeenCalledWith({
        where: {
          healthCheck: {
            apiConnectionId: connectionId,
          },
        },
        orderBy: { timestamp: "desc" },
        take: 100,
        include: {
          healthCheck: {
            select: {
              id: true,
              endpoint: true,
              method: true,
              apiConnection: {
                select: {
                  name: true,
                  provider: true,
                },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockResults);
    });

    it("should find check results with custom limit", async () => {
      const connectionId = "test-connection-id";
      const limit = 50;
      const mockResults = [];

      mockPrisma.checkResult.findMany.mockResolvedValue(mockResults);

      const result = await repository.findByConnectionId(connectionId, limit);

      expect(mockPrisma.checkResult.findMany).toHaveBeenCalledWith({
        where: {
          healthCheck: {
            apiConnectionId: connectionId,
          },
        },
        orderBy: { timestamp: "desc" },
        take: limit,
        include: {
          healthCheck: {
            select: {
              id: true,
              endpoint: true,
              method: true,
              apiConnection: {
                select: {
                  name: true,
                  provider: true,
                },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockResults);
    });

    it("should handle database errors", async () => {
      const connectionId = "test-connection-id";
      const error = new Error("Database connection failed");

      mockPrisma.checkResult.findMany.mockRejectedValue(error);

      await expect(repository.findByConnectionId(connectionId)).rejects.toThrow(
        "Failed to find check results for connection"
      );
    });
  });

  describe("findByHealthCheckId", () => {
    it("should find check results for health check", async () => {
      const healthCheckId = "test-health-check-id";
      const mockResults = [
        {
          id: "result-1",
          status: "SUCCESS",
          responseTime: 150,
          timestamp: new Date(),
          healthCheckId,
        },
      ];

      mockPrisma.checkResult.findMany.mockResolvedValue(mockResults);

      const result = await repository.findByHealthCheckId(healthCheckId);

      expect(mockPrisma.checkResult.findMany).toHaveBeenCalledWith({
        where: {
          healthCheckId,
        },
        orderBy: { timestamp: "desc" },
        take: 10,
      });
      expect(result).toEqual(mockResults);
    });

    it("should find check results with custom limit", async () => {
      const healthCheckId = "test-health-check-id";
      const limit = 5;
      const mockResults = [];

      mockPrisma.checkResult.findMany.mockResolvedValue(mockResults);

      const result = await repository.findByHealthCheckId(healthCheckId, limit);

      expect(mockPrisma.checkResult.findMany).toHaveBeenCalledWith({
        where: {
          healthCheckId,
        },
        orderBy: { timestamp: "desc" },
        take: limit,
      });
      expect(result).toEqual(mockResults);
    });

    it("should handle database errors", async () => {
      const healthCheckId = "test-health-check-id";
      const error = new Error("Database connection failed");

      mockPrisma.checkResult.findMany.mockRejectedValue(error);

      await expect(
        repository.findByHealthCheckId(healthCheckId)
      ).rejects.toThrow("Failed to find check results for health check");
    });
  });

  describe("create", () => {
    it("should create a new check result", async () => {
      const checkResultData = {
        status: "SUCCESS",
        responseTime: 150,
        timestamp: new Date(),
        healthCheck: {
          connect: {
            id: "test-health-check-id",
          },
        },
      };
      const mockResult = {
        id: "result-1",
        ...checkResultData,
      };

      mockPrisma.checkResult.create.mockResolvedValue(mockResult);

      const result = await repository.create(checkResultData);

      expect(mockPrisma.checkResult.create).toHaveBeenCalledWith({
        data: checkResultData,
      });
      expect(result).toEqual(mockResult);
    });

    it("should handle database errors", async () => {
      const checkResultData = {
        status: "SUCCESS",
        responseTime: 150,
        timestamp: new Date(),
        healthCheck: {
          connect: {
            id: "test-health-check-id",
          },
        },
      };
      const error = new Error("Database connection failed");

      mockPrisma.checkResult.create.mockRejectedValue(error);

      await expect(repository.create(checkResultData)).rejects.toThrow(
        "Failed to create check result"
      );
    });
  });
});
