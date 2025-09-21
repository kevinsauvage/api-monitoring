import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock getServerSession before importing the service
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => new Map()),
}));

vi.mock("@/lib/infrastructure/encryption", () => ({
  encrypt: vi.fn((data: string) => `encrypted_${data}`),
  decrypt: vi.fn((data: string) => data.replace("encrypted_", "")),
}));

vi.mock("@/lib/shared/utils/plan-limits", () => ({
  getPlanLimits: vi.fn(),
}));

import { ConnectionService } from "../connection.service";
import { mockPrisma, resetAllMocks } from "@/test/utils/test-helpers";
import { createTestUser, createTestConnection } from "@/test/utils/test-data";

// Mock the DI container
vi.mock("@/lib/infrastructure/di", () => ({
  container: {
    resolve: vi.fn(),
  },
  SERVICE_IDENTIFIERS: {
    CONNECTION_REPOSITORY: "CONNECTION_REPOSITORY",
    USER_REPOSITORY: "USER_REPOSITORY",
  },
}));

describe("ConnectionService", () => {
  let service: ConnectionService;
  let mockConnectionRepository: any;
  let mockUserRepository: any;

  beforeEach(async () => {
    resetAllMocks();

    // Setup mock repositories
    mockConnectionRepository = {
      findByUserIdWithHealthChecks: vi.fn(),
      findByIdWithHealthChecks: vi.fn(),
      findFirstByUserAndId: vi.fn(),
      countByUserId: vi.fn(),
      countActiveByUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    };

    mockUserRepository = {
      findByIdWithSubscription: vi.fn(),
    };

    // Mock DI container resolution
    const { container } = await import("@/lib/infrastructure/di");
    (container.resolve as any).mockImplementation((identifier: string) => {
      if (identifier === "CONNECTION_REPOSITORY")
        return mockConnectionRepository;
      if (identifier === "USER_REPOSITORY") return mockUserRepository;
      return null;
    });

    // Mock getPlanLimits
    const { getPlanLimits } = await import("@/lib/shared/utils/plan-limits");
    vi.mocked(getPlanLimits).mockReturnValue({
      name: "Free",
      maxHealthChecks: 5,
      maxConnections: 3,
      maxCheckResults: 1000,
    });

    service = new ConnectionService();
  });

  describe("getConnections", () => {
    it("should get connections for authenticated user", async () => {
      const mockUser = createTestUser();
      const mockConnections = [createTestConnection()].map((conn) => ({
        ...conn,
        healthChecks: [],
      }));

      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({ user: mockUser });
      mockUserRepository.findByIdWithSubscription.mockResolvedValue({
        ...mockUser,
        subscription: "FREE",
      });
      mockConnectionRepository.findByUserIdWithHealthChecks.mockResolvedValue(
        mockConnections
      );

      const result = await service.getConnections();

      expect(result).toHaveProperty("connections");
      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("limits");
      expect(result.connections).toEqual(mockConnections);
    });
  });

  describe("getConnectionsForUser", () => {
    it("should get connections for specific user", async () => {
      const userId = "test-user-id";
      const mockUser = createTestUser();
      const mockConnections = [createTestConnection()].map((conn) => ({
        ...conn,
        healthChecks: [],
      }));

      mockUserRepository.findByIdWithSubscription.mockResolvedValue({
        ...mockUser,
        subscription: "FREE",
      });
      mockConnectionRepository.findByUserIdWithHealthChecks.mockResolvedValue(
        mockConnections
      );

      const result = await service.getConnectionsForUser(userId);

      expect(result.connections).toEqual(mockConnections);
      expect(result.user).toBeDefined();
      expect(result.limits).toBeDefined();
    });

    it("should handle user not found", async () => {
      const userId = "non-existent-user";

      mockUserRepository.findByIdWithSubscription.mockResolvedValue(null);

      const result = await service.getConnectionsForUser(userId);

      expect(result.connections).toEqual([]);
      expect(result.user).toBeNull();
      expect(result.limits.canCreateConnection).toBe(false);
    });
  });

  describe("getConnectionById", () => {
    it("should get connection by ID for authenticated user", async () => {
      const connectionId = "test-connection-id";
      const mockUser = createTestUser();
      const mockConnection = createTestConnection();

      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({ user: mockUser });
      mockConnectionRepository.findByIdWithHealthChecks.mockResolvedValue(
        mockConnection
      );

      const result = await service.getConnectionById(connectionId);

      expect(
        mockConnectionRepository.findByIdWithHealthChecks
      ).toHaveBeenCalledWith(connectionId, mockUser.id);
      expect(result).toEqual(mockConnection);
    });

    it("should return null when connection not found", async () => {
      const connectionId = "non-existent-connection";
      const mockUser = createTestUser();

      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({ user: mockUser });
      mockConnectionRepository.findByIdWithHealthChecks.mockResolvedValue(null);

      const result = await service.getConnectionById(connectionId);

      expect(result).toBeNull();
    });
  });

  describe("createConnection", () => {
    it("should create connection successfully", async () => {
      const mockUser = createTestUser();
      const connectionData = {
        name: "Test Connection",
        provider: "REST",
        baseUrl: "https://api.example.com",
        apiKey: "test-key",
      };
      const mockConnection = createTestConnection();

      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({ user: mockUser });
      mockUserRepository.findByIdWithSubscription.mockResolvedValue({
        ...mockUser,
        subscription: "FREE",
      });
      mockConnectionRepository.countByUserId.mockResolvedValue(0);
      mockConnectionRepository.create.mockResolvedValue(mockConnection);

      const result = await service.createConnection(connectionData);

      expect(result.success).toBe(true);
      expect(result.connectionId).toBe(mockConnection.id);
    });

    it("should handle connection limit reached", async () => {
      const mockUser = createTestUser();
      const connectionData = {
        name: "Test Connection",
        provider: "REST",
        baseUrl: "https://api.example.com",
        apiKey: "test-key",
      };

      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({ user: mockUser });
      mockUserRepository.findByIdWithSubscription.mockResolvedValue({
        ...mockUser,
        subscription: "FREE",
      });
      mockConnectionRepository.countByUserId.mockResolvedValue(5); // Over limit

      const result = await service.createConnection(connectionData);

      expect(result.success).toBe(false);
      expect(result.message).toContain("Connection limit reached");
    });
  });

  describe("updateConnection", () => {
    it("should update connection successfully", async () => {
      const connectionId = "test-connection-id";
      const updateData = { name: "Updated Connection" };
      const mockUser = createTestUser();

      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({ user: mockUser });
      mockConnectionRepository.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.updateConnection(connectionId, updateData);

      expect(mockConnectionRepository.updateMany).toHaveBeenCalledWith(
        { id: connectionId, userId: mockUser.id },
        updateData
      );
      expect(result.success).toBe(true);
    });
  });

  describe("deleteConnection", () => {
    it("should delete connection successfully", async () => {
      const connectionId = "test-connection-id";
      const mockUser = createTestUser();

      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({ user: mockUser });
      mockConnectionRepository.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.deleteConnection(connectionId);

      expect(mockConnectionRepository.deleteMany).toHaveBeenCalledWith({
        id: connectionId,
        userId: mockUser.id,
      });
      expect(result.success).toBe(true);
    });
  });
});
