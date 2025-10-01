import { describe, it, expect } from "vitest";
import {
  serializeCheckResult,
  serializeCheckResults,
  serializeCheckResultWithDetails,
  serializeCheckResultsWithDetails,
} from "../check-result.serializer";
import { createTestCheckResult } from "@/test/utils/test-data";

describe("Check Result Serializers", () => {
  describe("serializeCheckResult", () => {
    it("should serialize a single check result", () => {
      const checkResult = createTestCheckResult();
      const result = serializeCheckResult(checkResult);

      expect(result).toEqual({
        id: checkResult.id,
        healthCheckId: checkResult.healthCheckId,
        status: checkResult.status,
        responseTime: checkResult.responseTime,
        statusCode: checkResult.statusCode,
        errorMessage: checkResult.errorMessage,
        metadata: checkResult.metadata,
        timestamp: checkResult.timestamp.toISOString(),
      });
    });

    it("should handle date serialization correctly", () => {
      const checkResult = createTestCheckResult({
        timestamp: new Date("2024-01-01T00:00:00Z"),
      });
      const result = serializeCheckResult(checkResult);

      expect(result.timestamp).toBe("2024-01-01T00:00:00.000Z");
    });

    it("should handle string timestamp", () => {
      const checkResult = {
        ...createTestCheckResult(),
        timestamp: "2024-01-01T00:00:00Z" as any,
      };
      const result = serializeCheckResult(checkResult);

      expect(result.timestamp).toBe("2024-01-01T00:00:00Z");
    });

    it("should handle metadata serialization", () => {
      const checkResult = createTestCheckResult({
        metadata: { url: "https://api.example.com/health", method: "GET" },
      });
      const result = serializeCheckResult(checkResult);

      expect(result.metadata).toEqual({
        url: "https://api.example.com/health",
        method: "GET",
      });
    });
  });

  describe("serializeCheckResults", () => {
    it("should serialize multiple check results", () => {
      const checkResults = [
        createTestCheckResult({ id: "result-1", status: "SUCCESS" }),
        createTestCheckResult({ id: "result-2", status: "FAILURE" }),
      ];
      const result = serializeCheckResults(checkResults);

      expect(result).toHaveLength(2);
      expect(result[0].status).toBe("SUCCESS");
      expect(result[1].status).toBe("FAILURE");
    });
  });

  describe("serializeCheckResultWithDetails", () => {
    it("should serialize check result with health check details", () => {
      const checkResult = {
        ...createTestCheckResult(),
        healthCheck: {
          id: "hc-1",
          endpoint: "/health",
          method: "GET",
          apiConnection: {
            name: "Test Connection",
            provider: "REST",
          },
        },
      };
      const result = serializeCheckResultWithDetails(checkResult);

      expect(result).toHaveProperty("healthCheck");
      expect(result.healthCheck).toEqual({
        id: "hc-1",
        endpoint: "/health",
        method: "GET",
        apiConnection: {
          name: "Test Connection",
          provider: "REST",
        },
      });
    });
  });

  describe("serializeCheckResultsWithDetails", () => {
    it("should serialize multiple check results with details", () => {
      const checkResults = [
        {
          ...createTestCheckResult({ id: "result-1" }),
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
        {
          ...createTestCheckResult({ id: "result-2" }),
          healthCheck: {
            id: "hc-2",
            endpoint: "/status",
            method: "POST",
            apiConnection: {
              name: "Another Connection",
              provider: "REST",
            },
          },
        },
      ];
      const result = serializeCheckResultsWithDetails(checkResults);

      expect(result).toHaveLength(2);
      expect(result[0].healthCheck.endpoint).toBe("/health");
      expect(result[1].healthCheck.endpoint).toBe("/status");
    });
  });
});
