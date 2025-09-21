import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConnectionRepository } from "../connection.repository";
import { mockPrisma, resetAllMocks } from "@/test/utils/test-helpers";
import { createTestConnection, createTestUser } from "@/test/utils/test-data";

describe("ConnectionRepository", () => {
  let repository: ConnectionRepository;

  beforeEach(() => {
    resetAllMocks();
    repository = new ConnectionRepository();
  });

  describe("findByUserIdWithHealthChecks", () => {
    it("should find connections with health checks for user", async () => {
      const userId = "test-user-id";
      const mockConnections = [
        {
          ...createTestConnection(),
          healthChecks: [
            {
              id: "hc-1",
              endpoint: "/health",
              method: "GET",
              isActive: true,
              lastExecutedAt: new Date(),
            },
          ],
        },
      ];

      mockPrisma.apiConnection.findMany.mockResolvedValue(mockConnections);

      const result = await repository.findByUserIdWithHealthChecks(userId);

      expect(mockPrisma.apiConnection.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          healthChecks: {
            select: {
              id: true,
              endpoint: true,
              method: true,
              isActive: true,
              lastExecutedAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      expect(result).toEqual(mockConnections);
    });
  });

  describe("findByIdWithHealthChecks", () => {
    it("should find connection by ID with health checks", async () => {
      const id = "test-connection-id";
      const userId = "test-user-id";
      const mockConnection = {
        ...createTestConnection(),
        healthChecks: [],
      };

      mockPrisma.apiConnection.findFirst.mockResolvedValue(mockConnection);

      const result = await repository.findByIdWithHealthChecks(id, userId);

      expect(mockPrisma.apiConnection.findFirst).toHaveBeenCalledWith({
        where: { id, userId },
        include: {
          healthChecks: {
            select: {
              id: true,
              endpoint: true,
              method: true,
              isActive: true,
              lastExecutedAt: true,
            },
          },
        },
      });
      expect(result).toEqual(mockConnection);
    });
  });

  describe("create", () => {
    it("should create a new connection", async () => {
      const connectionData = {
        name: "Test Connection",
        provider: "REST",
        baseUrl: "https://api.example.com",
        user: { connect: { id: "user-id" } },
        apiKey: "encrypted-key",
      };

      const mockConnection = createTestConnection();
      mockPrisma.apiConnection.create.mockResolvedValue(mockConnection);

      const result = await repository.create(connectionData);

      expect(mockPrisma.apiConnection.create).toHaveBeenCalledWith({
        data: connectionData,
      });
      expect(result).toEqual(mockConnection);
    });
  });

  describe("update", () => {
    it("should update a connection", async () => {
      const id = "test-connection-id";
      const updateData = { name: "Updated Connection" };
      const mockConnection = createTestConnection({
        name: "Updated Connection",
      });

      mockPrisma.apiConnection.update.mockResolvedValue(mockConnection);

      const result = await repository.update(id, updateData);

      expect(mockPrisma.apiConnection.update).toHaveBeenCalledWith({
        where: { id },
        data: updateData,
      });
      expect(result).toEqual(mockConnection);
    });
  });

  describe("delete", () => {
    it("should delete a connection", async () => {
      const id = "test-connection-id";

      mockPrisma.apiConnection.delete.mockResolvedValue(createTestConnection());

      await repository.delete(id);

      expect(mockPrisma.apiConnection.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });

  describe("countByUserId", () => {
    it("should count connections for user", async () => {
      const userId = "test-user-id";
      const count = 5;

      mockPrisma.apiConnection.count.mockResolvedValue(count);

      const result = await repository.countByUserId(userId);

      expect(mockPrisma.apiConnection.count).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toBe(count);
    });
  });

  describe("countActiveByUserId", () => {
    it("should count active connections for user", async () => {
      const userId = "test-user-id";
      const count = 3;

      mockPrisma.apiConnection.count.mockResolvedValue(count);

      const result = await repository.countActiveByUserId(userId);

      expect(mockPrisma.apiConnection.count).toHaveBeenCalledWith({
        where: { userId, isActive: true },
      });
      expect(result).toBe(count);
    });
  });

  describe("findFirstByUserAndId", () => {
    it("should find connection by user and ID", async () => {
      const id = "test-connection-id";
      const userId = "test-user-id";
      const mockConnection = createTestConnection();

      mockPrisma.apiConnection.findFirst.mockResolvedValue(mockConnection);

      const result = await repository.findFirstByUserAndId(id, userId);

      expect(mockPrisma.apiConnection.findFirst).toHaveBeenCalledWith({
        where: { id, userId },
      });
      expect(result).toEqual(mockConnection);
    });
  });

  describe("findByIdWithCredentials", () => {
    it("should find connection with credentials", async () => {
      const id = "test-connection-id";
      const mockConnection = {
        id: "test-connection-id",
        name: "Test Connection",
        provider: "REST",
        baseUrl: "https://api.example.com",
        apiKey: "encrypted-key",
        secretKey: null,
      };

      mockPrisma.apiConnection.findUnique.mockResolvedValue(mockConnection);

      const result = await repository.findByIdWithCredentials(id);

      expect(mockPrisma.apiConnection.findUnique).toHaveBeenCalledWith({
        where: { id },
        select: {
          id: true,
          name: true,
          provider: true,
          baseUrl: true,
          apiKey: true,
          secretKey: true,
        },
      });
      expect(result).toEqual(mockConnection);
    });
  });
});


