import { describe, it, expect, vi } from "vitest";
import { ErrorUtils } from "../error-utils";
import type { ApiResult } from "@/lib/shared/types/api-results";
import { ZodError, z } from "zod";

describe("ErrorUtils", () => {
  describe("createErrorResult", () => {
    it("should create error result with message", () => {
      const result = ErrorUtils.createErrorResult("Test error");

      expect(result).toEqual({
        success: false,
        error: "Test error",
      });
    });

    it("should create error result with Error object", () => {
      const error = new Error("Test error");
      const result = ErrorUtils.createErrorResult(error);

      expect(result).toEqual({
        success: false,
        error: "Test error",
      });
    });

    it("should create error result with unknown error", () => {
      const result = ErrorUtils.createErrorResult({ message: "Test error" });

      expect(result).toEqual({
        success: false,
        error: "[object Object]",
      });
    });
  });

  describe("createValidationErrorResult", () => {
    it("should create validation error result with validation errors", () => {
      const validationErrors = [
        {
          field: "name",
          message: "Name is required",
          code: "required",
        },
        {
          field: "email",
          message: "Invalid email",
          code: "invalid_email",
        },
      ];

      const result = ErrorUtils.createValidationErrorResult(validationErrors);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Validation failed");
      expect(result.zodError).toBeDefined();
      expect(Array.isArray(result.zodError)).toBe(true);
    });

    it("should create validation error result with custom message", () => {
      const validationErrors = [
        {
          field: "name",
          message: "Expected string, received number",
          code: "invalid_type",
        },
      ];

      const result = ErrorUtils.createValidationErrorResult(
        validationErrors,
        "Custom validation error"
      );

      expect(result).toEqual({
        success: false,
        error: "Custom validation error: Validation failed",
        zodError: validationErrors,
      });
    });
  });

  describe("createSuccessResult", () => {
    it("should create success result with data", () => {
      const data = { id: "123", name: "Test" };
      const result = ErrorUtils.createSuccessResult(data);

      expect(result).toEqual({
        success: true,
        data,
        message: "Operation completed successfully",
      });
    });

    it("should create success result with message", () => {
      const data = { id: "123", name: "Test" };
      const message = "Operation successful";
      const result = ErrorUtils.createSuccessResult(data, message);

      expect(result).toEqual({
        success: true,
        data,
        message,
      });
    });

    it("should create success result without data", () => {
      const result = ErrorUtils.createSuccessResult(undefined);

      expect(result).toEqual({
        success: true,
        data: undefined,
        message: "Operation completed successfully",
      });
    });
  });

  describe("extractErrorMessage", () => {
    it("should extract message from Error object", () => {
      const error = new Error("Test error");
      expect(ErrorUtils.extractErrorMessage(error)).toBe("Test error");
    });

    it("should extract message from string", () => {
      expect(ErrorUtils.extractErrorMessage("Test error")).toBe("Test error");
    });

    it("should return default message for unknown error", () => {
      expect(ErrorUtils.extractErrorMessage({ message: "test" })).toBe(
        "Unknown error occurred"
      );
    });
  });

  describe("isValidationError", () => {
    it("should return true for validation error object", () => {
      const validationError = {
        errors: [
          {
            field: "name",
            message: "Name is required",
            code: "required",
          },
        ],
      };

      expect(ErrorUtils.isValidationError(validationError)).toBe(true);
    });

    it("should return false for regular Error", () => {
      const error = new Error("Test error");
      expect(ErrorUtils.isValidationError(error)).toBe(false);
    });
  });

  describe("handleAsync", () => {
    it("should handle successful async operation", async () => {
      const asyncFn = vi.fn().mockResolvedValue("success");
      const result = await ErrorUtils.handleAsync(asyncFn);

      expect(result.success).toBe(true);
      expect(result.data).toBe("success");
      expect(asyncFn).toHaveBeenCalled();
    });

    it("should handle failed async operation", async () => {
      const asyncFn = vi.fn().mockRejectedValue(new Error("Test error"));
      const result = await ErrorUtils.handleAsync(asyncFn);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Test error");
      expect(asyncFn).toHaveBeenCalled();
    });

    it("should handle async operation with context", async () => {
      const asyncFn = vi.fn().mockRejectedValue(new Error("Test error"));
      const result = await ErrorUtils.handleAsync(asyncFn, "Test context");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Test context: Test error");
    });
  });
});
