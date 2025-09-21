import { describe, it, expect } from "vitest";
import {
  getStatusCounts,
  getResponseTimeData,
  getStatusData,
  getSuccessRate,
  getAverageResponseTime,
  getUptimeData,
} from "../check-result-utils";
import type { CheckResultWithDetails } from "@/lib/core/repositories";

describe("Check Result Utils", () => {
  const createTestCheckResult = (
    status: "SUCCESS" | "FAILURE" | "TIMEOUT" | "ERROR",
    responseTime: number,
    timestamp: Date
  ): CheckResultWithDetails => ({
    id: "test-id",
    healthCheckId: "health-check-id",
    status,
    responseTime,
    statusCode: status === "SUCCESS" ? 200 : 500,
    errorMessage: status === "ERROR" ? "Test error" : null,
    metadata: {},
    timestamp,
    healthCheck: {
      id: "health-check-id",
      endpoint: "/test",
      method: "GET",
      apiConnection: {
        name: "Test Connection",
        provider: "REST",
      },
    },
  });

  describe("getStatusCounts", () => {
    it("should count statuses correctly", () => {
      const results = [
        createTestCheckResult("SUCCESS", 100, new Date()),
        createTestCheckResult("SUCCESS", 200, new Date()),
        createTestCheckResult("FAILURE", 300, new Date()),
        createTestCheckResult("ERROR", 400, new Date()),
      ];

      const counts = getStatusCounts(results);

      expect(counts).toEqual({
        SUCCESS: 2,
        FAILURE: 1,
        ERROR: 1,
      });
    });

    it("should handle empty array", () => {
      const counts = getStatusCounts([]);
      expect(counts).toEqual({});
    });

    it("should handle single status", () => {
      const results = [
        createTestCheckResult("SUCCESS", 100, new Date()),
        createTestCheckResult("SUCCESS", 200, new Date()),
      ];

      const counts = getStatusCounts(results);
      expect(counts).toEqual({ SUCCESS: 2 });
    });
  });

  describe("getResponseTimeData", () => {
    it("should format response time data correctly", () => {
      const timestamp = new Date("2023-01-01T12:00:00Z");
      const results = [
        createTestCheckResult("SUCCESS", 100, timestamp),
        createTestCheckResult("FAILURE", 200, timestamp),
      ];

      const data = getResponseTimeData(results);

      expect(data).toEqual([
        {
          timestamp: timestamp.toISOString(),
          responseTime: 100,
          status: "SUCCESS",
        },
        {
          timestamp: timestamp.toISOString(),
          responseTime: 200,
          status: "FAILURE",
        },
      ]);
    });

    it("should handle empty array", () => {
      const data = getResponseTimeData([]);
      expect(data).toEqual([]);
    });
  });

  describe("getStatusData", () => {
    it("should calculate status data with percentages", () => {
      const results = [
        createTestCheckResult("SUCCESS", 100, new Date()),
        createTestCheckResult("SUCCESS", 200, new Date()),
        createTestCheckResult("FAILURE", 300, new Date()),
      ];

      const data = getStatusData(results);

      expect(data).toEqual([
        { status: "SUCCESS", count: 2, percentage: 66.66666666666666 },
        { status: "FAILURE", count: 1, percentage: 33.33333333333333 },
      ]);
    });

    it("should handle empty array", () => {
      const data = getStatusData([]);
      expect(data).toEqual([]);
    });

    it("should handle single result", () => {
      const results = [createTestCheckResult("SUCCESS", 100, new Date())];
      const data = getStatusData(results);

      expect(data).toEqual([{ status: "SUCCESS", count: 1, percentage: 100 }]);
    });
  });

  describe("getSuccessRate", () => {
    it("should calculate success rate correctly", () => {
      const results = [
        createTestCheckResult("SUCCESS", 100, new Date()),
        createTestCheckResult("SUCCESS", 200, new Date()),
        createTestCheckResult("FAILURE", 300, new Date()),
        createTestCheckResult("ERROR", 400, new Date()),
      ];

      const successRate = getSuccessRate(results);
      expect(successRate).toBe(50);
    });

    it("should return 0 for empty array", () => {
      const successRate = getSuccessRate([]);
      expect(successRate).toBe(0);
    });

    it("should return 100 for all successful results", () => {
      const results = [
        createTestCheckResult("SUCCESS", 100, new Date()),
        createTestCheckResult("SUCCESS", 200, new Date()),
      ];

      const successRate = getSuccessRate(results);
      expect(successRate).toBe(100);
    });

    it("should return 0 for no successful results", () => {
      const results = [
        createTestCheckResult("FAILURE", 100, new Date()),
        createTestCheckResult("ERROR", 200, new Date()),
      ];

      const successRate = getSuccessRate(results);
      expect(successRate).toBe(0);
    });
  });

  describe("getAverageResponseTime", () => {
    it("should calculate average response time correctly", () => {
      const results = [
        createTestCheckResult("SUCCESS", 100, new Date()),
        createTestCheckResult("SUCCESS", 200, new Date()),
        createTestCheckResult("SUCCESS", 300, new Date()),
      ];

      const average = getAverageResponseTime(results);
      expect(average).toBe(200);
    });

    it("should return 0 for empty array", () => {
      const average = getAverageResponseTime([]);
      expect(average).toBe(0);
    });

    it("should handle single result", () => {
      const results = [createTestCheckResult("SUCCESS", 150, new Date())];
      const average = getAverageResponseTime(results);
      expect(average).toBe(150);
    });
  });

  describe("getUptimeData", () => {
    it("should generate uptime data for last 7 days", () => {
      const now = new Date("2023-01-07T12:00:00Z");
      vi.setSystemTime(now);

      const results = [
        createTestCheckResult("SUCCESS", 100, new Date("2023-01-07T10:00:00Z")),
        createTestCheckResult("SUCCESS", 200, new Date("2023-01-07T11:00:00Z")),
        createTestCheckResult("FAILURE", 300, new Date("2023-01-06T10:00:00Z")),
        createTestCheckResult("SUCCESS", 400, new Date("2023-01-06T11:00:00Z")),
      ];

      const uptimeData = getUptimeData(results);

      expect(uptimeData).toHaveLength(7);
      // Check that we have 7 days of data with proper timestamp format
      expect(uptimeData[0].timestamp).toMatch(/T\d{2}:00:00.000Z$/);
      expect(uptimeData[6].timestamp).toMatch(/T\d{2}:00:00.000Z$/);

      // Check that each day has the correct structure
      uptimeData.forEach((day) => {
        expect(day).toHaveProperty("timestamp");
        expect(day).toHaveProperty("uptime");
        expect(day).toHaveProperty("checks");
        expect(typeof day.uptime).toBe("number");
        expect(typeof day.checks).toBe("number");
      });
    });

    it("should handle empty results", () => {
      const now = new Date("2023-01-07T12:00:00Z");
      vi.setSystemTime(now);

      const uptimeData = getUptimeData([]);

      expect(uptimeData).toHaveLength(7);
      uptimeData.forEach((day) => {
        expect(day.uptime).toBe(100); // No checks = 100% uptime
        expect(day.checks).toBe(0);
      });
    });

    it("should calculate uptime correctly for mixed results", () => {
      const now = new Date("2023-01-07T12:00:00Z");
      vi.setSystemTime(now);

      const results = [
        createTestCheckResult("SUCCESS", 100, new Date("2023-01-07T10:00:00Z")),
        createTestCheckResult("SUCCESS", 200, new Date("2023-01-07T11:00:00Z")),
        createTestCheckResult("FAILURE", 300, new Date("2023-01-07T12:00:00Z")),
      ];

      const uptimeData = getUptimeData(results);

      // Find today's data (last item)
      const todayData = uptimeData[6];
      expect(todayData.checks).toBe(3);
      expect(todayData.uptime).toBe(66.67); // 2/3 = 66.67%
    });

    it("should round uptime to 2 decimal places", () => {
      const now = new Date("2023-01-07T12:00:00Z");
      vi.setSystemTime(now);

      const results = [
        createTestCheckResult("SUCCESS", 100, new Date("2023-01-07T10:00:00Z")),
        createTestCheckResult("FAILURE", 200, new Date("2023-01-07T11:00:00Z")),
        createTestCheckResult("FAILURE", 300, new Date("2023-01-07T12:00:00Z")),
      ];

      const uptimeData = getUptimeData(results);
      const todayData = uptimeData[6];

      expect(todayData.uptime).toBe(33.33); // 1/3 = 33.333... rounded to 33.33
    });
  });
});
