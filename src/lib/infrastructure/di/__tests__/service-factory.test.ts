import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getConnectionService,
  getHealthCheckService,
  getDashboardService,
  getMonitoringService,
  getCronService,
  getCheckResultRepository,
} from "../service-factory";
import { container } from "../container";
import { SERVICE_IDENTIFIERS } from "../service-identifiers";

// Mock the services and repositories
vi.mock("@/lib/core/services", () => ({
  ConnectionService: vi
    .fn()
    .mockImplementation(() => ({ type: "ConnectionService" })),
  HealthCheckService: vi
    .fn()
    .mockImplementation(() => ({ type: "HealthCheckService" })),
  DashboardService: vi
    .fn()
    .mockImplementation(() => ({ type: "DashboardService" })),
  MonitoringService: vi
    .fn()
    .mockImplementation(() => ({ type: "MonitoringService" })),
  CronService: vi.fn().mockImplementation(() => ({ type: "CronService" })),
}));

vi.mock("@/lib/core/repositories", () => ({
  CheckResultRepository: vi
    .fn()
    .mockImplementation(() => ({ type: "CheckResultRepository" })),
}));

// Mock the init module
vi.mock("../init", () => ({
  initializeDI: vi.fn(),
}));

describe("Service Factory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    container.clear();
  });

  describe("getConnectionService", () => {
    it("should resolve ConnectionService from container", () => {
      const mockService = { type: "ConnectionService" };
      vi.spyOn(container, "resolve").mockReturnValue(mockService);

      const result = getConnectionService();

      expect(container.resolve).toHaveBeenCalledWith(
        SERVICE_IDENTIFIERS.CONNECTION_SERVICE
      );
      expect(result).toBe(mockService);
    });

    it("should handle container resolution errors", () => {
      const error = new Error("Service not found");
      vi.spyOn(container, "resolve").mockImplementation(() => {
        throw error;
      });

      expect(() => getConnectionService()).toThrow("Service not found");
    });
  });

  describe("getHealthCheckService", () => {
    it("should resolve HealthCheckService from container", () => {
      const mockService = { type: "HealthCheckService" };
      vi.spyOn(container, "resolve").mockReturnValue(mockService);

      const result = getHealthCheckService();

      expect(container.resolve).toHaveBeenCalledWith(
        SERVICE_IDENTIFIERS.HEALTH_CHECK_SERVICE
      );
      expect(result).toBe(mockService);
    });
  });

  describe("getDashboardService", () => {
    it("should resolve DashboardService from container", () => {
      const mockService = { type: "DashboardService" };
      vi.spyOn(container, "resolve").mockReturnValue(mockService);

      const result = getDashboardService();

      expect(container.resolve).toHaveBeenCalledWith(
        SERVICE_IDENTIFIERS.DASHBOARD_SERVICE
      );
      expect(result).toBe(mockService);
    });
  });

  describe("getMonitoringService", () => {
    it("should resolve MonitoringService from container", () => {
      const mockService = { type: "MonitoringService" };
      vi.spyOn(container, "resolve").mockReturnValue(mockService);

      const result = getMonitoringService();

      expect(container.resolve).toHaveBeenCalledWith(
        SERVICE_IDENTIFIERS.MONITORING_SERVICE
      );
      expect(result).toBe(mockService);
    });
  });

  describe("getCronService", () => {
    it("should resolve CronService from container", () => {
      const mockService = { type: "CronService" };
      vi.spyOn(container, "resolve").mockReturnValue(mockService);

      const result = getCronService();

      expect(container.resolve).toHaveBeenCalledWith(
        SERVICE_IDENTIFIERS.CRON_SERVICE
      );
      expect(result).toBe(mockService);
    });
  });

  describe("getCheckResultRepository", () => {
    it("should resolve CheckResultRepository from container", () => {
      const mockRepository = { type: "CheckResultRepository" };
      vi.spyOn(container, "resolve").mockReturnValue(mockRepository);

      const result = getCheckResultRepository();

      expect(container.resolve).toHaveBeenCalledWith(
        SERVICE_IDENTIFIERS.CHECK_RESULT_REPOSITORY
      );
      expect(result).toBe(mockRepository);
    });
  });

  describe("service resolution", () => {
    it("should call container.resolve with correct identifiers", () => {
      const resolveSpy = vi.spyOn(container, "resolve");

      getConnectionService();
      expect(resolveSpy).toHaveBeenCalledWith(
        SERVICE_IDENTIFIERS.CONNECTION_SERVICE
      );

      getHealthCheckService();
      expect(resolveSpy).toHaveBeenCalledWith(
        SERVICE_IDENTIFIERS.HEALTH_CHECK_SERVICE
      );

      getDashboardService();
      expect(resolveSpy).toHaveBeenCalledWith(
        SERVICE_IDENTIFIERS.DASHBOARD_SERVICE
      );

      getMonitoringService();
      expect(resolveSpy).toHaveBeenCalledWith(
        SERVICE_IDENTIFIERS.MONITORING_SERVICE
      );

      getCronService();
      expect(resolveSpy).toHaveBeenCalledWith(SERVICE_IDENTIFIERS.CRON_SERVICE);

      getCheckResultRepository();
      expect(resolveSpy).toHaveBeenCalledWith(
        SERVICE_IDENTIFIERS.CHECK_RESULT_REPOSITORY
      );
    });

    it("should return the resolved service instances", () => {
      const mockServices = {
        connection: { type: "ConnectionService" },
        healthCheck: { type: "HealthCheckService" },
        dashboard: { type: "DashboardService" },
        monitoring: { type: "MonitoringService" },
        cron: { type: "CronService" },
        repository: { type: "CheckResultRepository" },
      };

      vi.spyOn(container, "resolve")
        .mockReturnValueOnce(mockServices.connection)
        .mockReturnValueOnce(mockServices.healthCheck)
        .mockReturnValueOnce(mockServices.dashboard)
        .mockReturnValueOnce(mockServices.monitoring)
        .mockReturnValueOnce(mockServices.cron)
        .mockReturnValueOnce(mockServices.repository);

      expect(getConnectionService()).toBe(mockServices.connection);
      expect(getHealthCheckService()).toBe(mockServices.healthCheck);
      expect(getDashboardService()).toBe(mockServices.dashboard);
      expect(getMonitoringService()).toBe(mockServices.monitoring);
      expect(getCronService()).toBe(mockServices.cron);
      expect(getCheckResultRepository()).toBe(mockServices.repository);
    });
  });
});
