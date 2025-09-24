import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock getServerSession before importing the service
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => new Map()),
}));

vi.mock("@/lib/infrastructure/encryption", () => ({
  decrypt: vi.fn((data: string) => data.replace("encrypted_", "")),
}));

vi.mock("@/lib/core/monitoring/health-check-executor", () => ({
  healthCheckExecutor: {
    executeHealthCheck: vi.fn(),
  },
}));

import { MonitoringService } from "../monitoring.service";
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
    MONITORING_REPOSITORY: "MONITORING_REPOSITORY",
  },
}));

describe("MonitoringService", () => {
  let service: MonitoringService;
  let mockConnectionRepository: any;
  let mockHealthCheckRepository: any;
  let mockCheckResultRepository: any;
  let mockUserRepository: any;
  let mockMonitoringRepository: any;

  beforeEach(async () => {
    resetAllMocks();

    // Setup mock repositories
    mockConnectionRepository = {
      findByIdWithCredentials: vi.fn(),
    };

    mockHealthCheckRepository = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
    };

    mockCheckResultRepository = {
      create: vi.fn(),
    };

    mockUserRepository = {
      findByIdWithSubscription: vi.fn(),
    };

    mockMonitoringRepository = {
      getHealthChecksWithStats: vi.fn(),
      storeResult: vi.fn(),
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

    service = new MonitoringService();
  });

  describe("createHealthCheck", () => {
    it("should create health check with default values", async () => {
      const input = {
        apiConnectionId: "test-connection-id",
        endpoint: "/health",
      };
      const mockHealthCheck = createTestHealthCheck();

      mockHealthCheckRepository.create.mockResolvedValue(mockHealthCheck);

      const result = await service.createHealthCheck(
        input.apiConnectionId,
        input
      );

      expect(mockHealthCheckRepository.create).toHaveBeenCalledWith({
        apiConnection: {
          connect: { id: input.apiConnectionId },
        },
        endpoint: input.endpoint,
        method: "GET",
        expectedStatus: 200,
        timeout: 30,
        interval: 300,
        headers: {},
        body: null,
        queryParams: {},
        isActive: true,
        lastExecutedAt: null,
      });
      expect(result).toEqual(mockHealthCheck);
    });

    it("should create health check with custom values", async () => {
      const input = {
        apiConnectionId: "test-connection-id",
        endpoint: "/api/status",
        method: "POST",
        expectedStatus: 201,
        timeout: 60,
        interval: 600,
        headers: { "Content-Type": "application/json" },
        body: '{"test": true}',
        queryParams: { debug: "true" },
        lastExecutedAt: new Date(),
      };
      const mockHealthCheck = createTestHealthCheck();

      mockHealthCheckRepository.create.mockResolvedValue(mockHealthCheck);

      const result = await service.createHealthCheck(
        input.apiConnectionId,
        input
      );

      expect(mockHealthCheckRepository.create).toHaveBeenCalledWith({
        apiConnection: {
          connect: { id: input.apiConnectionId },
        },
        endpoint: input.endpoint,
        method: input.method,
        expectedStatus: input.expectedStatus,
        timeout: input.timeout,
        interval: input.interval,
        headers: input.headers,
        body: input.body,
        queryParams: input.queryParams,
        isActive: true,
        lastExecutedAt: input.lastExecutedAt,
      });
      expect(result).toEqual(mockHealthCheck);
    });
  });

  describe("updateHealthCheck", () => {
    it("should update health check", async () => {
      const healthCheckId = "test-health-check-id";
      const input = {
        isActive: false,
        interval: 600,
      };
      const mockHealthCheck = createTestHealthCheck();

      mockHealthCheckRepository.update.mockResolvedValue(mockHealthCheck);

      const result = await service.updateHealthCheck(healthCheckId, input);

      expect(mockHealthCheckRepository.update).toHaveBeenCalledWith(
        healthCheckId,
        input
      );
      expect(result).toEqual(mockHealthCheck);
    });
  });

  describe("deleteHealthCheck", () => {
    it("should delete health check", async () => {
      const healthCheckId = "test-health-check-id";

      mockHealthCheckRepository.delete.mockResolvedValue(undefined);

      await service.deleteHealthCheck(healthCheckId);

      expect(mockHealthCheckRepository.delete).toHaveBeenCalledWith(
        healthCheckId
      );
    });
  });

  describe("getHealthChecksForConnection", () => {
    it("should get health checks for connection", async () => {
      const connectionId = "test-connection-id";
      const mockHealthChecks = [createTestHealthCheck()];

      mockMonitoringRepository.getHealthChecksWithStats.mockResolvedValue(
        mockHealthChecks
      );

      const result = await service.getHealthChecksForConnection(connectionId);

      expect(
        mockMonitoringRepository.getHealthChecksWithStats
      ).toHaveBeenCalledWith(connectionId);
      expect(result).toHaveLength(1);
    });
  });

  describe("triggerHealthCheck", () => {
    it("should trigger health check successfully", async () => {
      const healthCheckId = "test-health-check-id";
      const mockHealthCheck = createTestHealthCheck();
      const mockConnection = createTestConnection();
      const mockResult = {
        healthCheckId,
        status: "SUCCESS",
        responseTime: 150,
        statusCode: 200,
        errorMessage: null,
        metadata: {},
      };

      mockHealthCheckRepository.findById.mockResolvedValue(mockHealthCheck);
      mockConnectionRepository.findByIdWithCredentials.mockResolvedValue(
        mockConnection
      );

      const { healthCheckExecutor } = await import(
        "@/lib/core/monitoring/health-check-executor"
      );
      vi.mocked(healthCheckExecutor.executeHealthCheck).mockResolvedValue(
        mockResult
      );

      mockMonitoringRepository.storeResult.mockResolvedValue(undefined);
      mockHealthCheckRepository.update.mockResolvedValue(mockHealthCheck);

      await service.triggerHealthCheck(healthCheckId);

      expect(mockHealthCheckRepository.findById).toHaveBeenCalledWith(
        healthCheckId
      );
      expect(
        mockConnectionRepository.findByIdWithCredentials
      ).toHaveBeenCalledWith(mockHealthCheck.apiConnectionId);
      expect(healthCheckExecutor.executeHealthCheck).toHaveBeenCalled();
      expect(mockMonitoringRepository.storeResult).toHaveBeenCalledWith({
        healthCheckId: mockResult.healthCheckId,
        status: mockResult.status,
        responseTime: mockResult.responseTime,
        statusCode: mockResult.statusCode,
        errorMessage: mockResult.errorMessage,
        metadata: mockResult.metadata,
      });
      expect(mockHealthCheckRepository.update).toHaveBeenCalledWith(
        healthCheckId,
        {
          lastExecutedAt: expect.any(Date),
        }
      );
    });

    it("should handle health check not found", async () => {
      const healthCheckId = "non-existent-health-check";

      mockHealthCheckRepository.findById.mockResolvedValue(null);

      await expect(service.triggerHealthCheck(healthCheckId)).rejects.toThrow(
        "Health check with ID 'non-existent-health-check' not found"
      );
    });

    it("should handle connection not found", async () => {
      const healthCheckId = "test-health-check-id";
      const mockHealthCheck = createTestHealthCheck();

      mockHealthCheckRepository.findById.mockResolvedValue(mockHealthCheck);
      mockConnectionRepository.findByIdWithCredentials.mockResolvedValue(null);

      await expect(service.triggerHealthCheck(healthCheckId)).rejects.toThrow(
        "Connection with ID 'test-connection-id' not found"
      );
    });
  });
});
