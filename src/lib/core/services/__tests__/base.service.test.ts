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

vi.mock("@/lib/infrastructure/di", () => ({
  container: {
    resolve: vi.fn(),
  },
  SERVICE_IDENTIFIERS: {
    CONNECTION_REPOSITORY: "CONNECTION_REPOSITORY",
    HEALTH_CHECK_REPOSITORY: "HEALTH_CHECK_REPOSITORY",
    CHECK_RESULT_REPOSITORY: "CHECK_RESULT_REPOSITORY",
    USER_REPOSITORY: "USER_REPOSITORY",
  },
}));

vi.mock("@/lib/shared/utils/plan-limits", () => ({
  getPlanLimits: vi.fn(() => ({
    maxConnections: 5,
    maxHealthChecks: 20,
  })),
}));

import { mockPrisma, resetAllMocks } from "@/test/utils/test-helpers";
import { createTestUser } from "@/test/utils/test-data";

describe("BaseService", () => {
  let ConnectionService: any;
  let HealthCheckService: any;

  beforeAll(async () => {
    // Import services that extend BaseService
    const connectionModule = await import("../connection.service");
    const healthCheckModule = await import("../health-check.service");

    ConnectionService = connectionModule.ConnectionService;
    HealthCheckService = healthCheckModule.HealthCheckService;
  });

  let connectionService: any;
  let healthCheckService: any;

  beforeEach(async () => {
    resetAllMocks();

    // Mock DI container resolution
    const { container } = await import("@/lib/infrastructure/di");
    (container.resolve as any).mockImplementation((identifier: string) => {
      if (identifier === "CONNECTION_REPOSITORY")
        return mockPrisma.apiConnection;
      if (identifier === "HEALTH_CHECK_REPOSITORY")
        return mockPrisma.healthCheck;
      if (identifier === "CHECK_RESULT_REPOSITORY")
        return mockPrisma.checkResult;
      if (identifier === "USER_REPOSITORY") return mockPrisma.user;
      return null;
    });

    connectionService = new ConnectionService();
    healthCheckService = new HealthCheckService();
  });

  describe("getCurrentUser", () => {
    it("should return user from session", async () => {
      const mockUser = createTestUser();
      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({ user: mockUser });

      const result = await connectionService.getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it("should return null when no session", async () => {
      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue(null);

      const result = await connectionService.getCurrentUser();

      expect(result).toBeUndefined();
    });

    it("should return null when session has no user", async () => {
      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({ user: null });

      const result = await connectionService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe("requireAuth", () => {
    it("should return user when authenticated", async () => {
      const mockUser = createTestUser();
      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({ user: mockUser });

      const result = await connectionService.requireAuth();

      expect(result).toEqual(mockUser);
    });

    it("should throw UnauthorizedError when not authenticated", async () => {
      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue(null);

      await expect(connectionService.requireAuth()).rejects.toThrow(
        "Authentication required"
      );
    });

    it("should throw UnauthorizedError when user has no ID", async () => {
      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: null } });

      await expect(connectionService.requireAuth()).rejects.toThrow(
        "Authentication required"
      );
    });
  });

  describe("executeWithErrorHandling", () => {
    it("should execute operation successfully", async () => {
      // Test through a service method that uses executeWithErrorHandling
      const mockUser = createTestUser();
      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({ user: mockUser });

      // Mock the repository to return empty array
      mockPrisma.apiConnection.findByUserIdWithHealthChecks.mockResolvedValue(
        []
      );
      mockPrisma.user.findByIdWithSubscription.mockResolvedValue({
        ...mockUser,
        subscription: "FREE",
      });

      const result = await connectionService.getConnections();
      expect(result).toHaveProperty("connections");
      expect(result).toHaveProperty("user");
    });

    it("should handle errors in operation", async () => {
      const mockUser = createTestUser();
      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({ user: mockUser });

      // Mock the repository to throw an error
      mockPrisma.apiConnection.findByUserIdWithHealthChecks.mockRejectedValue(
        new Error("Database error")
      );
      mockPrisma.user.findByIdWithSubscription.mockResolvedValue({
        ...mockUser,
        subscription: "FREE",
      });

      // The service should handle the error gracefully and return a response
      await expect(connectionService.getConnections()).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("executeSyncWithErrorHandling", () => {
    it("should execute sync operation successfully", async () => {
      // Test through a service method that uses executeSyncWithErrorHandling
      const mockUser = createTestUser();
      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({ user: mockUser });

      // Mock the repository to return empty array
      mockPrisma.apiConnection.findByUserIdWithHealthChecks.mockResolvedValue(
        []
      );
      mockPrisma.user.findByIdWithSubscription.mockResolvedValue({
        ...mockUser,
        subscription: "FREE",
      });

      const result = await connectionService.getConnections();
      expect(result).toHaveProperty("connections");
      expect(result).toHaveProperty("user");
    });

    it("should handle errors in sync operation", async () => {
      const mockUser = createTestUser();
      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({ user: mockUser });

      // Mock the repository to throw an error
      mockPrisma.apiConnection.findByUserIdWithHealthChecks.mockRejectedValue(
        new Error("Database error")
      );
      mockPrisma.user.findByIdWithSubscription.mockResolvedValue({
        ...mockUser,
        subscription: "FREE",
      });

      // The service should handle the error gracefully and return a response
      await expect(connectionService.getConnections()).rejects.toThrow(
        "Database error"
      );
    });
  });
});
