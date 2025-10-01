import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock getServerSession before importing the service
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => new Map()),
}));

vi.mock("@/lib/shared/utils/plan-limits", () => ({
  getPlanLimits: vi.fn(),
}));

import { HealthCheckService } from "../health-check.service";
import { resetAllMocks } from "../../../../test/utils/test-helpers";
import {
  createTestUser,
  createTestConnection,
  createTestHealthCheck,
} from "../../../../test/utils/test-data";

// Mock the DI container
vi.mock("@/lib/infrastructure/di", () => ({
  container: {
    resolve: vi.fn(),
  },
  SERVICE_IDENTIFIERS: {
    CONNECTION_REPOSITORY: "CONNECTION_REPOSITORY",
    HEALTH_CHECK_REPOSITORY: "HEALTH_CHECK_REPOSITORY",
    CHECK_RESULT_REPOSITORY: "CHECK_RESULT_REPOSITORY",
    USER_REPOSITORY: "USER_REPOSITORY",
    MONITORING_SERVICE: "MONITORING_SERVICE",
  },
}));

describe("HealthCheckService", () => {
  let service: HealthCheckService;
  let mockConnectionRepository: any;
  let mockHealthCheckRepository: any;
  let mockCheckResultRepository: any;
  let mockUserRepository: any;
  let mockMonitoringService: any;

  beforeEach(async () => {
    resetAllMocks();

    // Setup mock repositories
    mockConnectionRepository = {
      findFirstByUserAndId: vi.fn(),
    };

    mockHealthCheckRepository = {
      findByConnectionId: vi.fn(),
      findFirstByUserAndId: vi.fn(),
      countByUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockCheckResultRepository = {
      findByHealthCheckId: vi.fn(),
    };

    mockUserRepository = {
      findByIdWithSubscription: vi.fn(),
    };

    mockMonitoringService = {
      triggerHealthCheck: vi.fn(),
    };

    // Mock DI container resolution
    const { container } = await import("@/lib/infrastructure/di");
    (container.resolve as any).mockImplementation((identifier: string) => {
      if (identifier === "CONNECTION_REPOSITORY")
        return mockConnectionRepository;
      if (identifier === "HEALTH_CHECK_REPOSITORY")
        return mockHealthCheckRepository;
      if (identifier === "CHECK_RESULT_REPOSITORY")
        return mockCheckResultRepository;
      if (identifier === "USER_REPOSITORY") return mockUserRepository;
      if (identifier === "MONITORING_SERVICE") return mockMonitoringService;
      return null;
    });

    // Mock authentication
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValue({
      user: createTestUser(),
    });

    // Mock getPlanLimits
    const { getPlanLimits } = await import("@/lib/shared/utils/plan-limits");
    vi.mocked(getPlanLimits).mockReturnValue({
      name: "Free",
      maxHealthChecks: 5,
      maxConnections: 3,
      maxCheckResults: 1000,
    });

    service = new HealthCheckService();
  });

  describe("getHealthChecksForConnection", () => {
    it("should get health checks for connection", async () => {
      const connectionId = "test-connection-id";
      const mockUser = createTestUser();
      const mockConnection = createTestConnection();
      const mockHealthChecks = [createTestHealthCheck()];

      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({ user: mockUser });
      mockConnectionRepository.findFirstByUserAndId.mockResolvedValue(
        mockConnection
      );
      mockHealthCheckRepository.findByConnectionId.mockResolvedValue(
        mockHealthChecks
      );

      const result = await service.getHealthChecksForConnection(connectionId);

      expect(
        mockConnectionRepository.findFirstByUserAndId
      ).toHaveBeenCalledWith(connectionId, mockUser.id);
      expect(mockHealthCheckRepository.findByConnectionId).toHaveBeenCalledWith(
        connectionId
      );
      expect(result.healthChecks).toHaveLength(1);
    });

    it("should return empty array when connection not found", async () => {
      const connectionId = "non-existent-connection";
      const mockUser = createTestUser();

      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({ user: mockUser });
      mockConnectionRepository.findFirstByUserAndId.mockResolvedValue(null);

      const result = await service.getHealthChecksForConnection(connectionId);

      expect(result.healthChecks).toEqual([]);
    });
  });

  describe("getHealthChecksWithResultsForConnection", () => {
    it("should get health checks with results", async () => {
      const connectionId = "test-connection-id";
      const mockUser = createTestUser();
      const mockConnection = createTestConnection();
      const mockHealthChecks = [createTestHealthCheck()];
      const mockResults = [
        {
          id: "result-1",
          status: "SUCCESS" as const,
          responseTime: 150,
          timestamp: new Date(),
        },
      ];

      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({ user: mockUser });
      mockConnectionRepository.findFirstByUserAndId.mockResolvedValue(
        mockConnection
      );
      mockHealthCheckRepository.findByConnectionId.mockResolvedValue(
        mockHealthChecks
      );
      mockCheckResultRepository.findByHealthCheckId.mockResolvedValue(
        mockResults
      );

      const result =
        await service.getHealthChecksWithResultsForConnection(connectionId);

      expect(result.healthChecks).toHaveLength(1);
      expect(result.healthChecks[0]).toHaveProperty("recentResults");
    });
  });

  describe("createHealthCheck", () => {
    it("should create health check successfully", async () => {
      const mockUser = createTestUser();
      const healthCheckData = {
        apiConnectionId: "test-connection-id",
        endpoint: "/health",
        method: "GET",
        expectedStatus: 200,
        timeout: 1000,
        interval: 300,
      };
      const mockHealthCheck = createTestHealthCheck();

      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({ user: mockUser });
      mockUserRepository.findByIdWithSubscription.mockResolvedValue({
        ...mockUser,
        subscription: "FREE",
      });
      mockHealthCheckRepository.countByUserId.mockResolvedValue(0);
      mockHealthCheckRepository.create.mockResolvedValue(mockHealthCheck);

      const result = await service.createHealthCheck(
        "test-connection-id",
        healthCheckData
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockHealthCheck);
    });

    it("should handle health check limit reached", async () => {
      const mockUser = createTestUser();
      const healthCheckData = {
        apiConnectionId: "test-connection-id",
        endpoint: "/health",
      };

      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({ user: mockUser });
      mockUserRepository.findByIdWithSubscription.mockResolvedValue({
        ...mockUser,
        subscription: "FREE",
      });
      mockHealthCheckRepository.countByUserId.mockResolvedValue(5); // Over limit

      const result = await service.createHealthCheck(healthCheckData);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Health check limit reached");
    });

    it("should handle validation errors", async () => {
      const mockUser = createTestUser();
      const invalidData = {
        apiConnectionId: "", // Invalid empty string
        endpoint: "", // Invalid empty string
      };

      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({ user: mockUser });
      mockUserRepository.findByIdWithSubscription.mockResolvedValue({
        ...mockUser,
        subscription: "FREE",
      });
      mockHealthCheckRepository.countByUserId.mockResolvedValue(0);

      const result = await service.createHealthCheck(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Validation failed");
    });
  });

  describe("deleteHealthCheck", () => {
    it("should delete health check successfully", async () => {
      const healthCheckId = "test-health-check-id";
      const mockUser = createTestUser();
      const mockHealthCheck = createTestHealthCheck();

      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({ user: mockUser });
      mockHealthCheckRepository.findFirstByUserAndId.mockResolvedValue(
        mockHealthCheck
      );
      mockHealthCheckRepository.delete.mockResolvedValue(undefined);

      const result = await service.deleteHealthCheck(healthCheckId);

      expect(
        mockHealthCheckRepository.findFirstByUserAndId
      ).toHaveBeenCalledWith(healthCheckId, mockUser.id);
      expect(mockHealthCheckRepository.delete).toHaveBeenCalledWith(
        healthCheckId
      );
      expect(result.success).toBe(true);
    });

    it("should handle health check not found", async () => {
      const healthCheckId = "non-existent-health-check";
      const mockUser = createTestUser();

      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({ user: mockUser });
      mockHealthCheckRepository.findFirstByUserAndId.mockResolvedValue(null);

      await expect(service.deleteHealthCheck(healthCheckId)).rejects.toThrow(
        "Health check with ID 'non-existent-health-check' not found"
      );
    });
  });

  describe("updateHealthCheck", () => {
    it("should update health check successfully", async () => {
      const healthCheckId = "test-health-check-id";
      const updateData = { isActive: false };
      const mockUser = createTestUser();
      const mockHealthCheck = createTestHealthCheck();

      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({ user: mockUser });
      mockHealthCheckRepository.findFirstByUserAndId.mockResolvedValue(
        mockHealthCheck
      );
      mockHealthCheckRepository.update.mockResolvedValue(mockHealthCheck);

      const result = await service.updateHealthCheck(healthCheckId, updateData);

      expect(mockHealthCheckRepository.update).toHaveBeenCalledWith(
        healthCheckId,
        updateData
      );
      expect(result.success).toBe(true);
    });
  });

  describe("triggerHealthCheck", () => {
    it("should trigger health check successfully", async () => {
      const healthCheckId = "test-health-check-id";
      const mockUser = createTestUser();
      const mockHealthCheck = createTestHealthCheck();

      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({ user: mockUser });
      mockHealthCheckRepository.findFirstByUserAndId.mockResolvedValue(
        mockHealthCheck
      );
      mockMonitoringService.triggerHealthCheck.mockResolvedValue(undefined);
      mockHealthCheckRepository.update.mockResolvedValue(mockHealthCheck);

      const result = await service.triggerHealthCheck(healthCheckId);

      expect(mockMonitoringService.triggerHealthCheck).toHaveBeenCalledWith(
        healthCheckId
      );
      expect(mockHealthCheckRepository.update).toHaveBeenCalledWith(
        healthCheckId,
        {
          lastExecutedAt: expect.any(Date),
        }
      );
      expect(result.success).toBe(true);
    });
  });
});
