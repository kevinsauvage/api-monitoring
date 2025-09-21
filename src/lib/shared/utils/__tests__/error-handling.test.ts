import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleAsyncOperation } from "../error-handling";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock logger
vi.mock("../logger", () => ({
  log: {
    error: vi.fn(),
  },
}));

describe("Error Handling", () => {
  let mockToast: any;
  let mockLog: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockToast = await import("sonner");
    mockLog = await import("../logger");
  });

  describe("handleAsyncOperation", () => {
    it("should handle successful operation", async () => {
      const operation = vi.fn().mockResolvedValue("success result");
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const result = await handleAsyncOperation(operation, {
        successMessage: "Operation successful",
        errorMessage: "Operation failed",
        onSuccess,
        onError,
      });

      expect(result).toEqual({
        success: true,
        data: "success result",
      });
      expect(operation).toHaveBeenCalledOnce();
      expect(onSuccess).toHaveBeenCalledWith("success result");
      expect(onError).not.toHaveBeenCalled();
      expect(mockToast.toast.success).toHaveBeenCalledWith(
        "Operation successful"
      );
    });

    it("should handle successful operation without callbacks", async () => {
      const operation = vi.fn().mockResolvedValue("success result");

      const result = await handleAsyncOperation(operation);

      expect(result).toEqual({
        success: true,
        data: "success result",
      });
      expect(operation).toHaveBeenCalledOnce();
    });

    it("should handle operation error", async () => {
      const error = new Error("Test error");
      const operation = vi.fn().mockRejectedValue(error);
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const result = await handleAsyncOperation(operation, {
        successMessage: "Operation successful",
        errorMessage: "Operation failed",
        onSuccess,
        onError,
      });

      expect(result).toEqual({
        success: false,
        error: "Test error",
      });
      expect(operation).toHaveBeenCalledOnce();
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(error);
      expect(mockLog.log.error).toHaveBeenCalledWith(
        "Async operation failed:",
        "Test error"
      );
      expect(mockToast.toast.error).toHaveBeenCalledWith("Operation failed");
    });

    it("should handle non-Error thrown value", async () => {
      const operation = vi.fn().mockRejectedValue("String error");
      const onError = vi.fn();

      const result = await handleAsyncOperation(operation, {
        errorMessage: "Operation failed",
        onError,
      });

      expect(result).toEqual({
        success: false,
        error: "String error",
      });
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
      expect(mockLog.log.error).toHaveBeenCalledWith(
        "Async operation failed:",
        "String error"
      );
    });

    it("should handle operation without error message", async () => {
      const error = new Error("Test error");
      const operation = vi.fn().mockRejectedValue(error);

      const result = await handleAsyncOperation(operation);

      expect(result).toEqual({
        success: false,
        error: "Test error",
      });
      expect(mockToast.toast.error).toHaveBeenCalledWith(undefined);
    });

    it("should handle operation without success message", async () => {
      const operation = vi.fn().mockResolvedValue("success result");

      const result = await handleAsyncOperation(operation, {
        errorMessage: "Operation failed",
      });

      expect(result).toEqual({
        success: true,
        data: "success result",
      });
      expect(mockToast.toast.success).not.toHaveBeenCalled();
    });

    it("should handle complex operation result", async () => {
      const complexResult = {
        id: "123",
        name: "Test",
        data: [1, 2, 3],
        nested: { value: "test" },
      };
      const operation = vi.fn().mockResolvedValue(complexResult);
      const onSuccess = vi.fn();

      const result = await handleAsyncOperation(operation, {
        onSuccess,
      });

      expect(result).toEqual({
        success: true,
        data: complexResult,
      });
      expect(onSuccess).toHaveBeenCalledWith(complexResult);
    });

    it("should handle async operation that throws immediately", async () => {
      const operation = vi.fn().mockImplementation(() => {
        throw new Error("Immediate error");
      });
      const onError = vi.fn();

      const result = await handleAsyncOperation(operation, {
        errorMessage: "Operation failed",
        onError,
      });

      expect(result).toEqual({
        success: false,
        error: "Immediate error",
      });
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle operation that returns undefined", async () => {
      const operation = vi.fn().mockResolvedValue(undefined);

      const result = await handleAsyncOperation(operation);

      expect(result).toEqual({
        success: true,
        data: undefined,
      });
    });

    it("should handle operation that returns null", async () => {
      const operation = vi.fn().mockResolvedValue(null);

      const result = await handleAsyncOperation(operation);

      expect(result).toEqual({
        success: true,
        data: null,
      });
    });
  });
});
