import { describe, it, expect, beforeEach, vi } from "vitest";
import { CheckResultRepository } from "../check-result.repository";
import { mockPrisma, resetAllMocks } from "../../../../test/utils/test-helpers";
import { CheckStatus } from "@prisma/client";
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
          healthCheckId: "health-check-1",
          status: CheckStatus.SUCCESS,
          responseTime: 150,
          statusCode: 200,
          errorMessage: null,
          timestamp: new Date(),
          metadata: {},
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

      vi.mocked(mockPrisma.checkResult.findMany).mockResolvedValue(mockResults);

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
      const mockResults: any[] = [];

      vi.mocked(mockPrisma.checkResult.findMany).mockResolvedValue(mockResults);

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

      vi.mocked(mockPrisma.checkResult.findMany).mockRejectedValue(error);

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
          healthCheckId: "health-check-1",
          status: CheckStatus.SUCCESS,
          responseTime: 150,
          statusCode: 200,
          errorMessage: null,
          timestamp: new Date(),
          metadata: {},
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

      vi.mocked(mockPrisma.checkResult.findMany).mockResolvedValue(mockResults);

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
      const mockResults: any[] = [];

      vi.mocked(mockPrisma.checkResult.findMany).mockResolvedValue(mockResults);

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

      vi.mocked(mockPrisma.checkResult.findMany).mockRejectedValue(error);

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
          healthCheckId,
          status: CheckStatus.SUCCESS,
          responseTime: 150,
          statusCode: 200,
          errorMessage: null,
          timestamp: new Date(),
          metadata: {},
        },
      ];

      vi.mocked(mockPrisma.checkResult.findMany).mockResolvedValue(mockResults);

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
      const mockResults: any[] = [];

      vi.mocked(mockPrisma.checkResult.findMany).mockResolvedValue(mockResults);

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

      vi.mocked(mockPrisma.checkResult.findMany).mockRejectedValue(error);

      await expect(
        repository.findByHealthCheckId(healthCheckId)
      ).rejects.toThrow("Failed to find check results for health check");
    });
  });

  describe("create", () => {
    it("should create a new check result", async () => {
      const checkResultData = {
        healthCheckId: "test-health-check-id",
        status: CheckStatus.SUCCESS,
        responseTime: 150,
        statusCode: 200,
        errorMessage: null,
        timestamp: new Date(),
        metadata: {},
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

      vi.mocked(mockPrisma.checkResult.create).mockResolvedValue(mockResult);

      const result = await repository.create(checkResultData);

      expect(mockPrisma.checkResult.create).toHaveBeenCalledWith({
        data: checkResultData,
      });
      expect(result).toEqual(mockResult);
    });

    it("should handle database errors", async () => {
      const checkResultData = {
        healthCheckId: "test-health-check-id",
        status: CheckStatus.SUCCESS,
        responseTime: 150,
        statusCode: 200,
        errorMessage: null,
        timestamp: new Date(),
        metadata: {},
        healthCheck: {
          connect: {
            id: "test-health-check-id",
          },
        },
      };
      const error = new Error("Database connection failed");

      vi.mocked(mockPrisma.checkResult.create).mockRejectedValue(error);

      await expect(repository.create(checkResultData)).rejects.toThrow(
        "Failed to create check result"
      );
    });
  });
});
