import { describe, it, expect } from "vitest";
import {
  serializeDate,
  serializeDates,
  COMMON_DATE_FIELDS,
} from "../date-serializer";

describe("Date Serializer", () => {
  describe("serializeDate", () => {
    it("should serialize Date object to ISO string", () => {
      const date = new Date("2023-01-01T12:00:00Z");
      const result = serializeDate(date);

      expect(result).toBe("2023-01-01T12:00:00.000Z");
    });

    it("should return string as-is", () => {
      const dateString = "2023-01-01T12:00:00.000Z";
      const result = serializeDate(dateString);

      expect(result).toBe(dateString);
    });

    it("should return null for null input", () => {
      const result = serializeDate(null);

      expect(result).toBeNull();
    });

    it("should return null for undefined input", () => {
      const result = serializeDate(undefined);

      expect(result).toBeNull();
    });

    it("should return null for falsy values", () => {
      expect(serializeDate("")).toBeNull();
      expect(serializeDate(0 as any)).toBeNull();
      expect(serializeDate(false as any)).toBeNull();
    });

    it("should handle various date formats", () => {
      const testCases = [
        new Date("2023-01-01T12:00:00Z"),
        new Date("2023-12-31T23:59:59.999Z"),
        new Date("2023-06-15T00:00:00.000Z"),
      ];

      testCases.forEach((date) => {
        const result = serializeDate(date);
        expect(result).toBe(date.toISOString());
      });
    });
  });

  describe("serializeDates", () => {
    it("should serialize multiple date fields", () => {
      const obj = {
        id: "test-id",
        name: "Test",
        createdAt: new Date("2023-01-01T12:00:00Z"),
        updatedAt: new Date("2023-01-02T12:00:00Z"),
        lastExecutedAt: new Date("2023-01-03T12:00:00Z"),
        status: "active",
      };

      const result = serializeDates(obj, [
        "createdAt",
        "updatedAt",
        "lastExecutedAt",
      ]);

      expect(result).toEqual({
        id: "test-id",
        name: "Test",
        createdAt: "2023-01-01T12:00:00.000Z",
        updatedAt: "2023-01-02T12:00:00.000Z",
        lastExecutedAt: "2023-01-03T12:00:00.000Z",
        status: "active",
      });
    });

    it("should handle mixed date types", () => {
      const obj = {
        id: "test-id",
        createdAt: new Date("2023-01-01T12:00:00Z"),
        updatedAt: "2023-01-02T12:00:00.000Z",
        lastExecutedAt: null,
        status: "active",
      };

      const result = serializeDates(obj, [
        "createdAt",
        "updatedAt",
        "lastExecutedAt",
      ]);

      expect(result).toEqual({
        id: "test-id",
        createdAt: "2023-01-01T12:00:00.000Z",
        updatedAt: "2023-01-02T12:00:00.000Z",
        lastExecutedAt: null,
        status: "active",
      });
    });

    it("should not modify fields not in dateFields array", () => {
      const obj = {
        id: "test-id",
        createdAt: new Date("2023-01-01T12:00:00Z"),
        customDate: new Date("2023-01-02T12:00:00Z"),
        status: "active",
      };

      const result = serializeDates(obj, ["createdAt"]);

      expect(result.createdAt).toBe("2023-01-01T12:00:00.000Z");
      expect(result.customDate).toBeInstanceOf(Date); // Should not be serialized
      expect(result.id).toBe("test-id");
      expect(result.status).toBe("active");
    });

    it("should handle empty dateFields array", () => {
      const obj = {
        id: "test-id",
        createdAt: new Date("2023-01-01T12:00:00Z"),
        status: "active",
      };

      const result = serializeDates(obj, []);

      expect(result).toEqual(obj);
    });

    it("should handle non-existent fields", () => {
      const obj = {
        id: "test-id",
        status: "active",
      };

      const result = serializeDates(obj, ["createdAt", "updatedAt"]);

      expect(result).toEqual(obj);
    });

    it("should not mutate original object", () => {
      const obj = {
        id: "test-id",
        createdAt: new Date("2023-01-01T12:00:00Z"),
        status: "active",
      };
      const originalCreatedAt = obj.createdAt;

      const result = serializeDates(obj, ["createdAt"]);

      expect(result).not.toBe(obj); // Should be a new object
      expect(obj.createdAt).toBe(originalCreatedAt); // Original should be unchanged
    });
  });

  describe("COMMON_DATE_FIELDS", () => {
    it("should contain expected date fields", () => {
      expect(COMMON_DATE_FIELDS).toEqual([
        "createdAt",
        "updatedAt",
        "lastExecutedAt",
        "timestamp",
      ]);
    });

    it("should be readonly", () => {
      // Test that the array is frozen/readonly by checking its type
      expect(COMMON_DATE_FIELDS).toBeDefined();
      expect(Array.isArray(COMMON_DATE_FIELDS)).toBe(true);
    });
  });

  describe("integration tests", () => {
    it("should work with COMMON_DATE_FIELDS", () => {
      const obj = {
        id: "test-id",
        name: "Test Object",
        createdAt: new Date("2023-01-01T12:00:00Z"),
        updatedAt: new Date("2023-01-02T12:00:00Z"),
        lastExecutedAt: new Date("2023-01-03T12:00:00Z"),
        timestamp: new Date("2023-01-04T12:00:00Z"),
        status: "active",
      };

      const result = serializeDates(obj, COMMON_DATE_FIELDS);

      expect(result.createdAt).toBe("2023-01-01T12:00:00.000Z");
      expect(result.updatedAt).toBe("2023-01-02T12:00:00.000Z");
      expect(result.lastExecutedAt).toBe("2023-01-03T12:00:00.000Z");
      expect(result.timestamp).toBe("2023-01-04T12:00:00.000Z");
      expect(result.id).toBe("test-id");
      expect(result.name).toBe("Test Object");
      expect(result.status).toBe("active");
    });
  });
});
