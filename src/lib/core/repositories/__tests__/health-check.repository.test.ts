import { describe, it, expect, beforeEach, vi } from "vitest";
import { HealthCheckRepository } from "../health-check.repository";
import { mockPrisma, resetAllMocks } from "@/test/utils/test-helpers";
import { createTestHealthCheck } from "@/test/utils/test-data";

describe("HealthCheckRepository", () => {
  let repository: HealthCheckRepository;

  beforeEach(() => {
    resetAllMocks();
    repository = new HealthCheckRepository();
  });

  describe("findByConnectionId", () => {
    it("should find health checks for connection", async () => {
      const connectionId = "test-connection-id";
      const mockHealthChecks = [createTestHealthCheck()];

      mockPrisma.healthCheck.findMany.mockResolvedValue(mockHealthChecks);

      const result = await repository.findByConnectionId(connectionId);

      expect(mockPrisma.healthCheck.findMany).toHaveBeenCalledWith({
        where: { apiConnectionId: connectionId },
        orderBy: { createdAt: "desc" },
      });
      expect(result).toEqual(mockHealthChecks);
    });
  });

  describe("create", () => {
    it("should create a new health check", async () => {
      const healthCheckData = {
        apiConnection: { connect: { id: "connection-id" } },
        endpoint: "/health",
        method: "GET",
        expectedStatus: 200,
        timeout: 30,
        interval: 300,
        headers: {},
        body: null,
        queryParams: {},
        isActive: true,
        lastExecutedAt: null,
      };

      const mockHealthCheck = createTestHealthCheck();
      mockPrisma.healthCheck.create.mockResolvedValue(mockHealthCheck);

      const result = await repository.create(healthCheckData);

      expect(mockPrisma.healthCheck.create).toHaveBeenCalledWith({
        data: healthCheckData,
      });
      expect(result).toEqual(mockHealthCheck);
    });
  });

  describe("update", () => {
    it("should update a health check", async () => {
      const id = "test-health-check-id";
      const updateData = { isActive: false };
      const mockHealthCheck = createTestHealthCheck({ isActive: false });

      mockPrisma.healthCheck.update.mockResolvedValue(mockHealthCheck);

      const result = await repository.update(id, updateData);

      expect(mockPrisma.healthCheck.update).toHaveBeenCalledWith({
        where: { id },
        data: updateData,
      });
      expect(result).toEqual(mockHealthCheck);
    });
  });

  describe("delete", () => {
    it("should delete a health check", async () => {
      const id = "test-health-check-id";

      mockPrisma.healthCheck.delete.mockResolvedValue(createTestHealthCheck());

      await repository.delete(id);

      expect(mockPrisma.healthCheck.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });

  describe("findById", () => {
    it("should find health check by ID", async () => {
      const id = "test-health-check-id";
      const mockHealthCheck = createTestHealthCheck();

      mockPrisma.healthCheck.findUnique.mockResolvedValue(mockHealthCheck);

      const result = await repository.findById(id);

      expect(mockPrisma.healthCheck.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(mockHealthCheck);
    });
  });

  describe("countByUserId", () => {
    it("should count health checks for user", async () => {
      const userId = "test-user-id";
      const count = 10;

      mockPrisma.healthCheck.count.mockResolvedValue(count);

      const result = await repository.countByUserId(userId);

      expect(mockPrisma.healthCheck.count).toHaveBeenCalledWith({
        where: {
          apiConnection: { userId },
        },
      });
      expect(result).toBe(count);
    });
  });

  describe("countActiveByUserId", () => {
    it("should count active health checks for user", async () => {
      const userId = "test-user-id";
      const count = 8;

      mockPrisma.healthCheck.count.mockResolvedValue(count);

      const result = await repository.countActiveByUserId(userId);

      expect(mockPrisma.healthCheck.count).toHaveBeenCalledWith({
        where: {
          apiConnection: { userId },
          isActive: true,
        },
      });
      expect(result).toBe(count);
    });
  });

  describe("findFirstByUserAndId", () => {
    it("should find health check by user and ID", async () => {
      const id = "test-health-check-id";
      const userId = "test-user-id";
      const mockHealthCheck = createTestHealthCheck();

      mockPrisma.healthCheck.findFirst.mockResolvedValue(mockHealthCheck);

      const result = await repository.findFirstByUserAndId(id, userId);

      expect(mockPrisma.healthCheck.findFirst).toHaveBeenCalledWith({
        where: {
          id,
          apiConnection: { userId },
        },
      });
      expect(result).toEqual(mockHealthCheck);
    });
  });

  describe("findDueForExecution", () => {
    it("should find health checks due for execution", async () => {
      const currentTime = new Date("2024-01-01T12:00:00Z");
      const mockHealthChecks = [
        {
          id: "hc-1",
          apiConnectionId: "conn-1",
          endpoint: "/health",
          method: "GET",
          expectedStatus: 200,
          timeout: 30,
          interval: 300,
          lastExecutedAt: null,
          apiConnection: {
            id: "conn-1",
            isActive: true,
          },
        },
      ];

      mockPrisma.healthCheck.findMany.mockResolvedValue(mockHealthChecks);

      const result = await repository.findDueForExecution(currentTime);

      expect(mockPrisma.healthCheck.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          OR: [
            { lastExecutedAt: null },
            {
              lastExecutedAt: {
                lte: new Date(currentTime.getTime() - 300000), // 5 minutes ago
              },
            },
          ],
        },
        select: {
          id: true,
          apiConnectionId: true,
          endpoint: true,
          method: true,
          expectedStatus: true,
          timeout: true,
          interval: true,
          lastExecutedAt: true,
          apiConnection: {
            select: {
              id: true,
              isActive: true,
            },
          },
        },
        orderBy: { lastExecutedAt: "asc" },
      });
      expect(result).toEqual(mockHealthChecks);
    });
  });
});


