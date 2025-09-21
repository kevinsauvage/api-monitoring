import { describe, it, expect } from "vitest";
import {
  serializeConnection,
  serializeConnections,
  serializeConnectionWithHealthChecks,
  serializeConnectionWithHealthChecksAndResults,
} from "../connection.serializer";
import { createTestConnection } from "@/test/utils/test-data";

describe("Connection Serializers", () => {
  describe("serializeConnection", () => {
    it("should serialize a single connection", () => {
      const connection = createTestConnection();
      const result = serializeConnection(connection);

      expect(result).toEqual({
        id: connection.id,
        name: connection.name,
        provider: connection.provider,
        baseUrl: connection.baseUrl,
        isActive: connection.isActive,
        createdAt: connection.createdAt.toISOString(),
        updatedAt: connection.updatedAt.toISOString(),
      });
    });

    it("should handle date serialization correctly", () => {
      const connection = createTestConnection({
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-02T00:00:00Z"),
      });
      const result = serializeConnection(connection);

      expect(result.createdAt).toBe("2024-01-01T00:00:00.000Z");
      expect(result.updatedAt).toBe("2024-01-02T00:00:00.000Z");
    });
  });

  describe("serializeConnections", () => {
    it("should serialize multiple connections", () => {
      const connections = [
        createTestConnection({ id: "conn-1", name: "Connection 1" }),
        createTestConnection({ id: "conn-2", name: "Connection 2" }),
      ];
      const result = serializeConnections(connections);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Connection 1");
      expect(result[1].name).toBe("Connection 2");
    });
  });

  describe("serializeConnectionWithHealthChecks", () => {
    it("should serialize connection with health checks", () => {
      const connection = {
        ...createTestConnection(),
        healthChecks: [
          {
            id: "hc-1",
            endpoint: "/health",
            method: "GET",
            isActive: true,
            lastExecutedAt: new Date("2024-01-01T00:00:00Z"),
          },
          {
            id: "hc-2",
            endpoint: "/status",
            method: "POST",
            isActive: false,
            lastExecutedAt: null,
          },
        ],
      };
      const result = serializeConnectionWithHealthChecks(connection);

      expect(result).toHaveProperty("healthChecks");
      expect(result.healthChecks).toHaveLength(2);
      expect(result.healthChecks[0]).toEqual({
        id: "hc-1",
        endpoint: "/health",
        method: "GET",
        isActive: true,
        lastExecutedAt: "2024-01-01T00:00:00.000Z",
      });
      expect(result.healthChecks[1]).toEqual({
        id: "hc-2",
        endpoint: "/status",
        method: "POST",
        isActive: false,
        lastExecutedAt: null,
      });
    });

    it("should handle null lastExecutedAt", () => {
      const connection = {
        ...createTestConnection(),
        healthChecks: [
          {
            id: "hc-1",
            endpoint: "/health",
            method: "GET",
            isActive: true,
            lastExecutedAt: null,
          },
        ],
      };
      const result = serializeConnectionWithHealthChecks(connection);

      expect(result.healthChecks[0].lastExecutedAt).toBeNull();
    });
  });

  describe("serializeConnectionWithHealthChecksAndResults", () => {
    it("should serialize connection with health checks and results", () => {
      const connection = {
        ...createTestConnection(),
        healthChecks: [
          {
            id: "hc-1",
            endpoint: "/health",
            method: "GET",
            isActive: true,
            lastExecutedAt: new Date("2024-01-01T00:00:00Z"),
          },
        ],
        recentResults: [
          {
            id: "result-1",
            healthCheckId: "hc-1",
            status: "SUCCESS" as const,
            responseTime: 150,
            statusCode: 200,
            errorMessage: null,
            metadata: null,
            timestamp: new Date("2024-01-01T00:00:00Z"),
            healthCheck: {
              id: "hc-1",
              endpoint: "/health",
              method: "GET",
              apiConnection: {
                name: "Test Connection",
                provider: "REST",
              },
            },
          },
        ],
      };
      const result = serializeConnectionWithHealthChecksAndResults(connection);

      expect(result).toHaveProperty("recentResults");
      expect(result.recentResults).toHaveLength(1);
      expect(result.recentResults![0].id).toBe("result-1");
    });

    it("should handle missing recentResults", () => {
      const connection = {
        ...createTestConnection(),
        healthChecks: [],
      };
      const result = serializeConnectionWithHealthChecksAndResults(connection);

      expect(result.recentResults).toEqual([]);
    });
  });
});


