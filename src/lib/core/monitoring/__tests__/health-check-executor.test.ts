import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock axios before importing the executor
vi.mock("axios", () => ({
  default: vi.fn(),
}));

import { HealthCheckExecutor } from "../health-check-executor";
import { mockLogger } from "@/test/mocks/logger.mock";

describe("HealthCheckExecutor", () => {
  let executor: HealthCheckExecutor;
  let mockAxios: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Get the mocked axios function
    const axios = await import("axios");
    mockAxios = vi.mocked(axios.default);

    executor = new HealthCheckExecutor();
  });

  describe("executeHealthCheck", () => {
    it("should execute successful health check", async () => {
      // Test that mockAxios is working
      mockAxios.mockResolvedValue({
        status: 200,
        data: { status: "ok" },
        statusText: "OK",
        headers: {},
        config: {},
      });
      const config = {
        id: "test-health-check-id",
        apiConnectionId: "test-connection-id",
        endpoint: "/health",
        method: "GET",
        expectedStatus: 200,
        timeout: 30,
        headers: {},
        body: "",
        queryParams: {},
      };

      const connection = {
        baseUrl: "https://api.example.com",
        provider: "REST",
        apiKey: "test-key",
        secretKey: null,
      };

      const mockResponse = {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
        data: { status: "healthy" },
      };

      mockAxios.mockResolvedValue(mockResponse);

      const result = await executor.executeHealthCheck(config, connection);

      expect(result.healthCheckId).toBe(config.id);
      expect(result.status).toBe("SUCCESS");
      expect(result.statusCode).toBe(200);
      expect(result.responseTime).toBeGreaterThan(0);
      expect(result.errorMessage).toBeNull();
      expect(result.metadata).toHaveProperty("url");
      expect(result.metadata).toHaveProperty("method");
    });

    it("should handle failed health check with wrong status code", async () => {
      const config = {
        id: "test-health-check-id",
        apiConnectionId: "test-connection-id",
        endpoint: "/health",
        method: "GET",
        expectedStatus: 200,
        timeout: 30,
        headers: {},
        body: "",
        queryParams: {},
      };

      const connection = {
        baseUrl: "https://api.example.com",
        provider: "REST",
        apiKey: "test-key",
        secretKey: null,
      };

      const mockResponse = {
        status: 404,
        statusText: "Not Found",
        headers: { "content-type": "application/json" },
        data: { error: "Not found" },
      };

      mockAxios.mockResolvedValue(mockResponse);

      const result = await executor.executeHealthCheck(config, connection);

      expect(result.status).toBe("FAILURE");
      expect(result.statusCode).toBe(404);
      expect(result.errorMessage).toContain("Unexpected status: 404");
    });

    it("should handle server error (5xx)", async () => {
      const config = {
        id: "test-health-check-id",
        apiConnectionId: "test-connection-id",
        endpoint: "/health",
        method: "GET",
        expectedStatus: 200,
        timeout: 30,
        headers: {},
        body: "",
        queryParams: {},
      };

      const connection = {
        baseUrl: "https://api.example.com",
        provider: "REST",
        apiKey: "test-key",
        secretKey: null,
      };

      const mockResponse = {
        status: 500,
        statusText: "Internal Server Error",
        headers: { "content-type": "application/json" },
        data: { error: "Internal error" },
      };

      mockAxios.mockResolvedValue(mockResponse);

      const result = await executor.executeHealthCheck(config, connection);

      expect(result.status).toBe("ERROR");
      expect(result.statusCode).toBe(500);
      expect(result.errorMessage).toContain("Server error: 500");
    });

    it("should handle timeout", async () => {
      const config = {
        id: "test-health-check-id",
        apiConnectionId: "test-connection-id",
        endpoint: "/health",
        method: "GET",
        expectedStatus: 200,
        timeout: 1, // Very short timeout
        headers: {},
        body: "",
        queryParams: {},
      };

      const connection = {
        baseUrl: "https://api.example.com",
        provider: "REST",
        apiKey: "test-key",
        secretKey: null,
      };

      // Mock a slow response
      mockAxios.mockImplementation(
        async () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  status: 200,
                  statusText: "OK",
                  headers: {},
                  data: {},
                }),
              2000
            )
          )
      );

      const result = await executor.executeHealthCheck(config, connection);

      expect(result.status).toBe("TIMEOUT");
      expect(result.responseTime).toBeGreaterThanOrEqual(1000);
    });

    it("should handle network errors", async () => {
      const config = {
        id: "test-health-check-id",
        apiConnectionId: "test-connection-id",
        endpoint: "/health",
        method: "GET",
        expectedStatus: 200,
        timeout: 30,
        headers: {},
        body: "",
        queryParams: {},
      };

      const connection = {
        baseUrl: "https://api.example.com",
        provider: "REST",
        apiKey: "test-key",
        secretKey: null,
      };

      const networkError = new Error("Network Error");
      mockAxios.mockRejectedValue(networkError);

      const result = await executor.executeHealthCheck(config, connection);

      expect(result.status).toBe("ERROR");
      expect(result.statusCode).toBeNull();
      expect(result.errorMessage).toBe("Network Error");
    });

    it("should handle timeout errors", async () => {
      const config = {
        id: "test-health-check-id",
        apiConnectionId: "test-connection-id",
        endpoint: "/health",
        method: "GET",
        expectedStatus: 200,
        timeout: 30,
        headers: {},
        body: "",
        queryParams: {},
      };

      const connection = {
        baseUrl: "https://api.example.com",
        provider: "REST",
        apiKey: "test-key",
        secretKey: null,
      };

      const timeoutError = new Error("timeout of 30000ms exceeded");
      (timeoutError as any).code = "ECONNABORTED";
      mockAxios.mockRejectedValue(timeoutError);

      const result = await executor.executeHealthCheck(config, connection);

      expect(result.status).toBe("TIMEOUT");
      expect(result.errorMessage).toBe("timeout of 30000ms exceeded");
    });

    it("should build URL with query parameters", async () => {
      const config = {
        id: "test-health-check-id",
        apiConnectionId: "test-connection-id",
        endpoint: "/health",
        method: "GET",
        expectedStatus: 200,
        timeout: 30,
        headers: {},
        body: "",
        queryParams: { param1: "value1", param2: "value2" },
      };

      const connection = {
        baseUrl: "https://api.example.com",
        provider: "REST",
        apiKey: "test-key",
        secretKey: null,
      };

      const mockResponse = {
        status: 200,
        statusText: "OK",
        headers: {},
        data: {},
      };

      mockAxios.mockResolvedValue(mockResponse);

      await executor.executeHealthCheck(config, connection);

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://api.example.com/health?param1=value1&param2=value2",
        })
      );
    });

    it("should handle POST request with body", async () => {
      const config = {
        id: "test-health-check-id",
        apiConnectionId: "test-connection-id",
        endpoint: "/health",
        method: "POST",
        expectedStatus: 200,
        timeout: 30,
        headers: { "Content-Type": "application/json" },
        body: '{"test": "data"}',
        queryParams: {},
      };

      const connection = {
        baseUrl: "https://api.example.com",
        provider: "REST",
        apiKey: "test-key",
        secretKey: null,
      };

      const mockResponse = {
        status: 200,
        statusText: "OK",
        headers: {},
        data: {},
      };

      mockAxios.mockResolvedValue(mockResponse);

      await executor.executeHealthCheck(config, connection);

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "POST",
          data: '{"test": "data"}',
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });
  });
});
