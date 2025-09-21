import { describe, it, expect } from "vitest";
import {
  cn,
  formatTimestamp,
  formatTime,
  formatTimeForChart,
  formatResponseTime,
} from "../utils";

describe("Utils", () => {
  describe("cn", () => {
    it("should merge class names correctly", () => {
      const result = cn("class1", "class2");
      expect(result).toBe("class1 class2");
    });

    it("should handle conditional classes", () => {
      const result = cn("base", { active: true, disabled: false });
      expect(result).toBe("base active");
    });

    it("should handle arrays of classes", () => {
      const result = cn(["class1", "class2"], "class3");
      expect(result).toBe("class1 class2 class3");
    });

    it("should handle empty inputs", () => {
      const result = cn();
      expect(result).toBe("");
    });

    it("should handle mixed inputs", () => {
      const result = cn("base", ["array1", "array2"], { conditional: true });
      expect(result).toBe("base array1 array2 conditional");
    });
  });

  describe("formatTimestamp", () => {
    it("should format Date object correctly", () => {
      const date = new Date("2023-01-15T14:30:45Z");
      const result = formatTimestamp(date);

      // The exact format depends on timezone, but should contain the date parts
      expect(result).toContain("01");
      expect(result).toContain("15");
      expect(result).toContain("2023");
    });

    it("should format ISO string correctly", () => {
      const isoString = "2023-01-15T14:30:45Z";
      const result = formatTimestamp(isoString);

      expect(result).toContain("01");
      expect(result).toContain("15");
      expect(result).toContain("2023");
    });

    it("should handle different timezones", () => {
      const date = new Date("2023-12-25T23:59:59Z");
      const result = formatTimestamp(date);

      // Should contain year and be a valid date format
      expect(result).toContain("2023");
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe("formatTime", () => {
    it("should format time in 24-hour format", () => {
      const date = new Date("2023-01-15T14:30:45Z");
      const result = formatTime(date);

      expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      expect(result).toContain(":");
    });

    it("should format ISO string correctly", () => {
      const isoString = "2023-01-15T14:30:45Z";
      const result = formatTime(isoString);

      expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    it("should handle midnight", () => {
      const date = new Date("2023-01-15T00:00:00Z");
      const result = formatTime(date);

      expect(result).toMatch(/^\d{2}:00:00$/);
    });

    it("should handle noon", () => {
      const date = new Date("2023-01-15T12:00:00Z");
      const result = formatTime(date);

      expect(result).toMatch(/^\d{2}:00:00$/);
    });
  });

  describe("formatTimeForChart", () => {
    it("should format time for chart display", () => {
      const date = new Date("2023-01-15T14:30:45Z");
      const result = formatTimeForChart(date);

      expect(result).toMatch(/^\d{2}:\d{2}$/);
      expect(result).toContain(":");
    });

    it("should format ISO string correctly", () => {
      const isoString = "2023-01-15T14:30:45Z";
      const result = formatTimeForChart(isoString);

      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it("should handle different times", () => {
      const testCases = [
        { input: "2023-01-15T00:00:00Z", pattern: /^\d{2}:00$/ },
        { input: "2023-01-15T12:00:00Z", pattern: /^\d{2}:00$/ },
        { input: "2023-01-15T23:59:00Z", pattern: /^\d{2}:59$/ },
      ];

      testCases.forEach(({ input, pattern }) => {
        const result = formatTimeForChart(input);
        expect(result).toMatch(pattern);
      });
    });
  });

  describe("formatResponseTime", () => {
    it("should format milliseconds correctly", () => {
      expect(formatResponseTime(100)).toBe("100.0ms");
      expect(formatResponseTime(500)).toBe("500.0ms");
      expect(formatResponseTime(999)).toBe("999.0ms");
    });

    it("should format seconds correctly", () => {
      expect(formatResponseTime(1000)).toBe("1.0s");
      expect(formatResponseTime(1500)).toBe("1.5s");
      expect(formatResponseTime(2000)).toBe("2.0s");
    });

    it("should handle decimal values", () => {
      expect(formatResponseTime(123.456)).toBe("123.5ms");
      expect(formatResponseTime(1234.567)).toBe("1.2s");
    });

    it("should handle zero", () => {
      expect(formatResponseTime(0)).toBe("0.0ms");
    });

    it("should handle very small values", () => {
      expect(formatResponseTime(0.1)).toBe("0.1ms");
      expect(formatResponseTime(0.5)).toBe("0.5ms");
    });

    it("should handle large values", () => {
      expect(formatResponseTime(10000)).toBe("10.0s");
      expect(formatResponseTime(60000)).toBe("60.0s");
    });
  });
});
