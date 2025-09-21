import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock getServerSession before importing the service
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => new Map()),
}));

import { DashboardService } from "../dashboard.service";
import { resetAllMocks } from "../../../../test/utils/test-helpers";
import { createTestUser } from "../../../../test/utils/test-data";

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
    MONITORING_REPOSITORY: "MONITORING_REPOSITORY",
  },
}));

describe("DashboardService", () => {
  let service: DashboardService;
  let mockConnectionRepository: any;
  let mockHealthCheckRepository: any;
  let mockCheckResultRepository: any;
  let mockUserRepository: any;
  let mockMonitoringRepository: any;

  beforeEach(async () => {
    resetAllMocks();

    // Setup mock repositories
    mockConnectionRepository = {
      countByUserId: vi.fn(),
      countActiveByUserId: vi.fn(),
    };

    mockHealthCheckRepository = {
      countByUserId: vi.fn(),
    };

    mockCheckResultRepository = {
      findByUserIdWithDetails: vi.fn(),
    };

    mockUserRepository = {
      findByIdWithSubscription: vi.fn(),
    };

    mockMonitoringRepository = {
      getDashboardStats: vi.fn(),
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
      if (identifier === "MONITORING_REPOSITORY")
        return mockMonitoringRepository;
      return null;
    });

    // Mock authentication
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValue({
      user: createTestUser(),
    });

    service = new DashboardService();
  });

  describe("getDashboardStats", () => {
    it("should get dashboard stats for user", async () => {
      const userId = "test-user-id";
      const mockStats = {
        totalConnections: 5,
        activeConnections: 3,
        totalHealthChecks: 12,
        monitoringStats: {
          successRate: 95.5,
          averageResponseTime: 150,
          uptime: 99.9,
        },
        recentResults: [
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
        ],
      };

      mockConnectionRepository.countByUserId.mockResolvedValue(5);
      mockConnectionRepository.countActiveByUserId.mockResolvedValue(3);
      mockHealthCheckRepository.countByUserId.mockResolvedValue(12);
      mockMonitoringRepository.getDashboardStats.mockResolvedValue({
        successRate: 95.5,
        averageResponseTime: 150,
        uptime: 99.9,
      });
      mockCheckResultRepository.findByUserIdWithDetails.mockResolvedValue([
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
      ]);

      const result = await service.getDashboardStats(userId);

      expect(mockConnectionRepository.countByUserId).toHaveBeenCalledWith(
        userId
      );
      expect(mockConnectionRepository.countActiveByUserId).toHaveBeenCalledWith(
        userId
      );
      expect(mockHealthCheckRepository.countByUserId).toHaveBeenCalledWith(
        userId
      );
      expect(mockMonitoringRepository.getDashboardStats).toHaveBeenCalledWith(
        userId
      );
      expect(
        mockCheckResultRepository.findByUserIdWithDetails
      ).toHaveBeenCalledWith(userId, 50);

      expect(result).toEqual({
        totalConnections: 5,
        activeConnections: 3,
        totalHealthChecks: 12,
        monitoringStats: {
          successRate: 95.5,
          averageResponseTime: 150,
          uptime: 99.9,
        },
        recentResults: [
          {
            id: "result-1",
            status: "SUCCESS",
            responseTime: 150,
            timestamp: expect.any(Date),
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
        ],
      });
    });

    it("should handle database errors", async () => {
      const userId = "test-user-id";
      const error = new Error("Database connection failed");

      mockConnectionRepository.countByUserId.mockRejectedValue(error);

      await expect(service.getDashboardStats(userId)).rejects.toThrow(
        "Database connection failed"
      );
    });
  });

  describe("getUser", () => {
    it("should get user with subscription", async () => {
      const mockUser = createTestUser();
      const mockUserWithSubscription = {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        subscription: "FREE" as const,
      };

      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({ user: mockUser });
      mockUserRepository.findByIdWithSubscription.mockResolvedValue(
        mockUserWithSubscription
      );

      const result = await service.getUser();

      expect(mockUserRepository.findByIdWithSubscription).toHaveBeenCalledWith(
        mockUser.id
      );
      expect(result).toEqual(mockUserWithSubscription);
    });

    it("should handle authentication errors", async () => {
      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue(null);

      await expect(service.getUser()).rejects.toThrow(
        "Authentication required"
      );
    });
  });
});
