import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock getServerSession before importing the service
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => new Map()),
}));

vi.mock("../../../../lib/infrastructure/encryption", () => ({
  decrypt: vi.fn((data: string) => data.replace("encrypted_", "")),
}));

vi.mock("../../monitoring/health-check-executor", () => ({
  healthCheckExecutor: {
    executeHealthCheck: vi.fn(),
  },
}));

import { CronService } from "../cron.service";
import { resetAllMocks } from "../../../../test/utils/test-helpers";
import {
  createTestUser,
  createTestConnection,
  createTestHealthCheck,
} from "../../../../test/utils/test-data";

// Mock the DI container
vi.mock("../../../../lib/infrastructure/di", () => ({
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

describe("CronService", () => {
  let service: CronService;
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
      findDueForExecution: vi.fn(),
      update: vi.fn(),
    };

    mockCheckResultRepository = {
      create: vi.fn(),
    };

    mockUserRepository = {
      findByIdWithSubscription: vi.fn(),
    };

    mockMonitoringRepository = {
      storeResult: vi.fn(),
    };

    // Mock DI container resolution
    const { container } = await import("../../../../lib/infrastructure/di");
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

    service = new CronService();
  });

  describe("getHealthChecksDueForExecution", () => {
    it("should get health checks due for execution", async () => {
      const mockHealthChecks = [
        {
          id: "health-check-1",
          apiConnectionId: "connection-1",
          endpoint: "/health",
          method: "GET",
          expectedStatus: 200,
          timeout: 30,
          interval: 300,
          lastExecutedAt: new Date(Date.now() - 400000), // 6+ minutes ago
          apiConnection: {
            id: "connection-1",
            isActive: true,
            user: {
              id: "user-1",
              subscription: "HOBBY",
            },
          },
        },
        {
          id: "health-check-2",
          apiConnectionId: "connection-2",
          endpoint: "/status",
          method: "POST",
          expectedStatus: 201,
          timeout: 60,
          interval: 600,
          lastExecutedAt: null,
          apiConnection: {
            id: "connection-2",
            isActive: true,
            user: {
              id: "user-2",
              subscription: "STARTUP",
            },
          },
        },
      ];

      mockHealthCheckRepository.findDueForExecution.mockResolvedValue(
        mockHealthChecks
      );

      const result = await service.getHealthChecksDueForExecution();

      expect(
        mockHealthCheckRepository.findDueForExecution
      ).toHaveBeenCalledWith(expect.any(Date));
      expect(result).toEqual(mockHealthChecks);
    });

    it("should return empty array when no health checks are due", async () => {
      mockHealthCheckRepository.findDueForExecution.mockResolvedValue([]);

      const result = await service.getHealthChecksDueForExecution();

      expect(result).toEqual([]);
    });

    it("should respect plan minimum intervals when determining readiness", async () => {
      const notDueHealthCheck = {
        id: "health-check-3",
        apiConnectionId: "connection-3",
        endpoint: "/status",
        method: "GET",
        expectedStatus: 200,
        timeout: 30,
        interval: 60,
        lastExecutedAt: new Date(Date.now() - 120000),
        apiConnection: {
          id: "connection-3",
          isActive: true,
          user: {
            id: "user-3",
            subscription: "HOBBY",
          },
        },
      };

      mockHealthCheckRepository.findDueForExecution.mockResolvedValue([
        notDueHealthCheck,
      ]);

      const result = await service.getHealthChecksDueForExecution();

      expect(result).toEqual([]);
    });

    it("should handle database errors", async () => {
      const error = new Error("Database connection failed");
      mockHealthCheckRepository.findDueForExecution.mockRejectedValue(error);

      await expect(service.getHealthChecksDueForExecution()).rejects.toThrow(
        "Database connection failed"
      );
    });
  });

  describe("executeHealthCheck", () => {
    it("should execute health check successfully", async () => {
      const healthCheck = {
        id: "health-check-1",
        apiConnectionId: "connection-1",
        endpoint: "/health",
        method: "GET",
        expectedStatus: 200,
        timeout: 30,
      };
      const mockConnection = createTestConnection();
      const mockResult = {
        id: "result-1",
        healthCheckId: healthCheck.id,
        status: "SUCCESS" as const,
        responseTime: 150,
        statusCode: 200,
        errorMessage: null,
        metadata: {},
        timestamp: new Date(),
      };

      mockConnectionRepository.findByIdWithCredentials.mockResolvedValue(
        mockConnection
      );

      const { healthCheckExecutor } = await import(
        "../../monitoring/health-check-executor"
      );
      vi.mocked(healthCheckExecutor.executeHealthCheck).mockResolvedValue(
        mockResult
      );

      mockMonitoringRepository.storeResult.mockResolvedValue(undefined);
      mockHealthCheckRepository.update.mockResolvedValue(undefined);

      await service.executeHealthCheck(healthCheck);

      expect(
        mockConnectionRepository.findByIdWithCredentials
      ).toHaveBeenCalledWith(healthCheck.apiConnectionId);
      expect(healthCheckExecutor.executeHealthCheck).toHaveBeenCalledWith(
        {
          id: healthCheck.id,
          apiConnectionId: healthCheck.apiConnectionId,
          endpoint: healthCheck.endpoint,
          method: healthCheck.method,
          expectedStatus: healthCheck.expectedStatus,
          timeout: healthCheck.timeout,
        },
        {
          ...mockConnection,
          apiKey: mockConnection.apiKey
            ? mockConnection.apiKey.replace("encrypted_", "")
            : null,
          secretKey: mockConnection.secretKey
            ? mockConnection.secretKey.replace("encrypted_", "")
            : null,
        }
      );
      expect(mockMonitoringRepository.storeResult).toHaveBeenCalledWith({
        healthCheckId: mockResult.healthCheckId,
        status: mockResult.status,
        responseTime: mockResult.responseTime,
        statusCode: mockResult.statusCode,
        errorMessage: mockResult.errorMessage,
        metadata: mockResult.metadata,
      });
      expect(mockHealthCheckRepository.update).toHaveBeenCalledWith(
        healthCheck.id,
        {
          lastExecutedAt: expect.any(Date),
        }
      );
    });

    it("should handle connection not found", async () => {
      const healthCheck = {
        id: "health-check-1",
        apiConnectionId: "non-existent-connection",
        endpoint: "/health",
        method: "GET",
        expectedStatus: 200,
        timeout: 30,
      };

      mockConnectionRepository.findByIdWithCredentials.mockResolvedValue(null);

      await expect(service.executeHealthCheck(healthCheck)).rejects.toThrow(
        "Connection with ID 'non-existent-connection' not found"
      );
    });

    it("should handle health check execution errors", async () => {
      const healthCheck = {
        id: "health-check-1",
        apiConnectionId: "connection-1",
        endpoint: "/health",
        method: "GET",
        expectedStatus: 200,
        timeout: 30,
      };
      const mockConnection = createTestConnection();
      const error = new Error("Health check execution failed");

      mockConnectionRepository.findByIdWithCredentials.mockResolvedValue(
        mockConnection
      );

      const { healthCheckExecutor } = await import(
        "../../monitoring/health-check-executor"
      );
      vi.mocked(healthCheckExecutor.executeHealthCheck).mockRejectedValue(
        error
      );

      await expect(service.executeHealthCheck(healthCheck)).rejects.toThrow(
        "Health check execution failed"
      );
    });

    it("should handle connection retrieval errors", async () => {
      const healthCheck = {
        id: "health-check-1",
        apiConnectionId: "connection-1",
        endpoint: "/health",
        method: "GET",
        expectedStatus: 200,
        timeout: 30,
      };
      const error = new Error("Database connection failed");

      mockConnectionRepository.findByIdWithCredentials.mockRejectedValue(error);

      await expect(service.executeHealthCheck(healthCheck)).rejects.toThrow(
        "Database connection failed"
      );
    });

    it("should handle result storage errors", async () => {
      const healthCheck = {
        id: "health-check-1",
        apiConnectionId: "connection-1",
        endpoint: "/health",
        method: "GET",
        expectedStatus: 200,
        timeout: 30,
      };
      const mockConnection = createTestConnection();
      const mockResult = {
        id: "result-2",
        healthCheckId: healthCheck.id,
        status: "SUCCESS" as const,
        responseTime: 150,
        statusCode: 200,
        errorMessage: null,
        metadata: {},
        timestamp: new Date(),
      };

      mockConnectionRepository.findByIdWithCredentials.mockResolvedValue(
        mockConnection
      );

      const { healthCheckExecutor } = await import(
        "../../monitoring/health-check-executor"
      );
      vi.mocked(healthCheckExecutor.executeHealthCheck).mockResolvedValue(
        mockResult
      );

      const error = new Error("Failed to store result");
      mockMonitoringRepository.storeResult.mockRejectedValue(error);

      await expect(service.executeHealthCheck(healthCheck)).rejects.toThrow(
        "Failed to store result"
      );
    });

    it("should handle timestamp update errors", async () => {
      const healthCheck = {
        id: "health-check-1",
        apiConnectionId: "connection-1",
        endpoint: "/health",
        method: "GET",
        expectedStatus: 200,
        timeout: 30,
      };
      const mockConnection = createTestConnection();
      const mockResult = {
        id: "result-3",
        healthCheckId: healthCheck.id,
        status: "SUCCESS" as const,
        responseTime: 150,
        statusCode: 200,
        errorMessage: null,
        metadata: {},
        timestamp: new Date(),
      };

      mockConnectionRepository.findByIdWithCredentials.mockResolvedValue(
        mockConnection
      );

      const { healthCheckExecutor } = await import(
        "../../monitoring/health-check-executor"
      );
      vi.mocked(healthCheckExecutor.executeHealthCheck).mockResolvedValue(
        mockResult
      );

      mockMonitoringRepository.storeResult.mockResolvedValue(undefined);
      const error = new Error("Failed to update timestamp");
      mockHealthCheckRepository.update.mockRejectedValue(error);

      await expect(service.executeHealthCheck(healthCheck)).rejects.toThrow(
        "Failed to update timestamp"
      );
    });
  });
});
