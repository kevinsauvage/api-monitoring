import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  isAppError,
  handleError,
  formatErrorResponse,
  logError,
  getClientErrorMessage,
  createErrorDigest,
  withErrorHandling,
  withSyncErrorHandling,
} from "../index";

// Mock the logger
vi.mock("@/lib/shared/utils/logger", () => ({
  log: {
    error: vi.fn(),
  },
}));

describe("Error Classes", () => {
  describe("AppError", () => {
    it("should create error with default values", () => {
      const error = new AppError("Test error");

      expect(error.message).toBe("Test error");
      expect(error.code).toBe("INTERNAL_ERROR");
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe("AppError");
      expect(error.cause).toBeDefined();
    });

    it("should create error with custom values", () => {
      const cause = new Error("Original error");
      const error = new AppError(
        "Custom error",
        "CUSTOM_CODE",
        400,
        false,
        cause
      );

      expect(error.message).toBe("Custom error");
      expect(error.code).toBe("CUSTOM_CODE");
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(false);
      expect(error.cause).toBe(cause);
    });

    it("should capture stack trace", () => {
      const error = new AppError("Test error");
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("AppError");
    });
  });

  describe("ValidationError", () => {
    it("should create validation error without field", () => {
      const error = new ValidationError("Invalid input");

      expect(error.message).toBe("Invalid input");
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });

    it("should create validation error with field", () => {
      const error = new ValidationError("Invalid email", "email");

      expect(error.message).toBe("Invalid email");
      expect(error.code).toBe("VALIDATION_EMAIL");
      expect(error.statusCode).toBe(400);
    });
  });

  describe("NotFoundError", () => {
    it("should create not found error without ID", () => {
      const error = new NotFoundError("User");

      expect(error.message).toBe("User not found");
      expect(error.code).toBe("NOT_FOUND");
      expect(error.statusCode).toBe(404);
    });

    it("should create not found error with ID", () => {
      const error = new NotFoundError("User", "123");

      expect(error.message).toBe("User with ID '123' not found");
      expect(error.code).toBe("NOT_FOUND");
      expect(error.statusCode).toBe(404);
    });
  });

  describe("UnauthorizedError", () => {
    it("should create unauthorized error with default message", () => {
      const error = new UnauthorizedError();

      expect(error.message).toBe("Unauthorized access");
      expect(error.code).toBe("UNAUTHORIZED");
      expect(error.statusCode).toBe(401);
    });

    it("should create unauthorized error with custom message", () => {
      const error = new UnauthorizedError("Invalid token");

      expect(error.message).toBe("Invalid token");
      expect(error.code).toBe("UNAUTHORIZED");
      expect(error.statusCode).toBe(401);
    });
  });

  describe("ForbiddenError", () => {
    it("should create forbidden error with default message", () => {
      const error = new ForbiddenError();

      expect(error.message).toBe("Access forbidden");
      expect(error.code).toBe("FORBIDDEN");
      expect(error.statusCode).toBe(403);
    });

    it("should create forbidden error with custom message", () => {
      const error = new ForbiddenError("Insufficient permissions");

      expect(error.message).toBe("Insufficient permissions");
      expect(error.code).toBe("FORBIDDEN");
      expect(error.statusCode).toBe(403);
    });
  });

  describe("ConflictError", () => {
    it("should create conflict error without resource", () => {
      const error = new ConflictError("Resource already exists");

      expect(error.message).toBe("Resource already exists");
      expect(error.code).toBe("CONFLICT");
      expect(error.statusCode).toBe(409);
    });

    it("should create conflict error with resource", () => {
      const error = new ConflictError("Email already exists", "email");

      expect(error.message).toBe("Email already exists");
      expect(error.code).toBe("CONFLICT_EMAIL");
      expect(error.statusCode).toBe(409);
    });
  });

  describe("RateLimitError", () => {
    it("should create rate limit error with default message", () => {
      const error = new RateLimitError();

      expect(error.message).toBe("Rate limit exceeded");
      expect(error.code).toBe("RATE_LIMIT");
      expect(error.statusCode).toBe(429);
    });

    it("should create rate limit error with custom message", () => {
      const error = new RateLimitError("Too many requests per minute");

      expect(error.message).toBe("Too many requests per minute");
      expect(error.code).toBe("RATE_LIMIT");
      expect(error.statusCode).toBe(429);
    });
  });

  describe("DatabaseError", () => {
    it("should create database error without original error", () => {
      const error = new DatabaseError("Connection failed");

      expect(error.message).toBe("Connection failed");
      expect(error.code).toBe("DATABASE_ERROR");
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });

    it("should create database error with original error", () => {
      const originalError = new Error("Connection timeout");
      const error = new DatabaseError(
        "Database operation failed",
        originalError
      );

      expect(error.message).toBe("Database operation failed");
      expect(error.code).toBe("DATABASE_ERROR");
      expect(error.statusCode).toBe(500);
      expect(error.cause).toBe(originalError);
    });
  });

  describe("ExternalServiceError", () => {
    it("should create external service error", () => {
      const error = new ExternalServiceError("API", "Service unavailable");

      expect(error.message).toBe(
        "External service error (API): Service unavailable"
      );
      expect(error.code).toBe("EXTERNAL_SERVICE_ERROR");
      expect(error.statusCode).toBe(502);
    });
  });
});

describe("Error Utility Functions", () => {
  describe("isAppError", () => {
    it("should return true for AppError instances", () => {
      const error = new AppError("Test error");
      expect(isAppError(error)).toBe(true);
    });

    it("should return true for AppError subclasses", () => {
      const error = new ValidationError("Test error");
      expect(isAppError(error)).toBe(true);
    });

    it("should return false for regular Error instances", () => {
      const error = new Error("Test error");
      expect(isAppError(error)).toBe(false);
    });

    it("should return false for non-error values", () => {
      expect(isAppError("string")).toBe(false);
      expect(isAppError(123)).toBe(false);
      expect(isAppError(null)).toBe(false);
      expect(isAppError(undefined)).toBe(false);
    });
  });

  describe("handleError", () => {
    it("should return AppError as-is", () => {
      const appError = new AppError("Test error");
      const result = handleError(appError);

      expect(result).toBe(appError);
    });

    it("should wrap regular Error in AppError", () => {
      const regularError = new Error("Regular error");
      const result = handleError(regularError);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe("Regular error");
      expect(result.code).toBe("UNKNOWN_ERROR");
      expect(result.statusCode).toBe(500);
    });

    it("should handle unknown error types", () => {
      const result = handleError("string error");

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe("An unknown error occurred");
      expect(result.code).toBe("UNKNOWN_ERROR");
      expect(result.statusCode).toBe(500);
    });
  });

  describe("formatErrorResponse", () => {
    it("should format AppError response", () => {
      const error = new AppError("Test error", "TEST_CODE", 400);
      const response = formatErrorResponse(error);

      expect(response).toEqual({
        success: false,
        error: {
          code: "TEST_CODE",
          message: "Test error",
          statusCode: 400,
        },
      });
    });
  });

  describe("logError", () => {
    let originalEnv: NodeJS.ProcessEnv;
    let mockLog: any;

    beforeEach(async () => {
      originalEnv = process.env;
      mockLog = (await import("@/lib/shared/utils/logger")).log;
      vi.clearAllMocks();
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it("should log error in development", () => {
      process.env.NODE_ENV = "development";
      const error = new Error("Test error");
      const context = { userId: "123" };

      logError(error, context);

      expect(mockLog.error).toHaveBeenCalledWith("Development error", {
        message: "Test error",
        stack: error.stack,
        name: "Error",
        timestamp: expect.any(String),
        context: { userId: "123" },
      });
    });

    it("should log error in production", () => {
      process.env.NODE_ENV = "production";
      const error = new Error("Test error");
      const context = { userId: "123" };

      logError(error, context);

      expect(mockLog.error).toHaveBeenCalledWith("Production error", {
        message: "Test error",
        stack: error.stack,
        name: "Error",
        timestamp: expect.any(String),
        context: { userId: "123" },
      });
    });

    it("should log error without context", () => {
      process.env.NODE_ENV = "development";
      const error = new Error("Test error");

      logError(error);

      expect(mockLog.error).toHaveBeenCalledWith("Development error", {
        message: "Test error",
        stack: error.stack,
        name: "Error",
        timestamp: expect.any(String),
        context: undefined,
      });
    });
  });

  describe("getClientErrorMessage", () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
      originalEnv = process.env;
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it("should return operational AppError message", () => {
      const error = new AppError("Operational error", "TEST_CODE", 400, true);
      const message = getClientErrorMessage(error);

      expect(message).toBe("Operational error");
    });

    it("should return non-operational AppError message in development", () => {
      process.env.NODE_ENV = "development";
      const error = new AppError(
        "Non-operational error",
        "TEST_CODE",
        500,
        false
      );
      const message = getClientErrorMessage(error);

      expect(message).toBe("Non-operational error");
    });

    it("should return generic message for non-operational AppError in production", () => {
      process.env.NODE_ENV = "production";
      const error = new AppError(
        "Non-operational error",
        "TEST_CODE",
        500,
        false
      );
      const message = getClientErrorMessage(error);

      expect(message).toBe("An unexpected error occurred. Please try again.");
    });

    it("should return Error message in development", () => {
      process.env.NODE_ENV = "development";
      const error = new Error("Regular error");
      const message = getClientErrorMessage(error);

      expect(message).toBe("Regular error");
    });

    it("should return generic message for Error in production", () => {
      process.env.NODE_ENV = "production";
      const error = new Error("Regular error");
      const message = getClientErrorMessage(error);

      expect(message).toBe("An unexpected error occurred. Please try again.");
    });

    it("should return generic message for unknown error types", () => {
      const message = getClientErrorMessage("string error");

      expect(message).toBe("An unexpected error occurred. Please try again.");
    });
  });

  describe("createErrorDigest", () => {
    it("should create error digest", () => {
      const error = new Error("Test error");
      error.stack = "Error: Test error\n    at test.js:1:1";
      const digest = createErrorDigest(error);

      expect(digest).toBeDefined();
      expect(digest.length).toBe(16);
      expect(typeof digest).toBe("string");
    });

    it("should create consistent digest for same error", () => {
      const error1 = new Error("Test error");
      error1.stack = "Error: Test error\n    at test.js:1:1";
      const error2 = new Error("Test error");
      error2.stack = "Error: Test error\n    at test.js:1:1";

      const digest1 = createErrorDigest(error1);
      const digest2 = createErrorDigest(error2);

      expect(digest1).toBe(digest2);
    });
  });

  describe("withErrorHandling", () => {
    let mockLog: any;

    beforeEach(async () => {
      mockLog = (await import("@/lib/shared/utils/logger")).log;
      vi.clearAllMocks();
    });

    it("should return successful operation result", async () => {
      const operation = vi.fn().mockResolvedValue("success");
      const result = await withErrorHandling(operation, "test context");

      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledOnce();
    });

    it("should handle and log errors", async () => {
      process.env.NODE_ENV = "development";
      const error = new Error("Operation failed");
      const operation = vi.fn().mockRejectedValue(error);

      await expect(
        withErrorHandling(operation, "test context")
      ).rejects.toThrow(AppError);
      expect(mockLog.error).toHaveBeenCalledWith("Development error", {
        message: "Operation failed",
        stack: error.stack,
        name: "Error",
        timestamp: expect.any(String),
        context: { context: "test context" },
      });
    });
  });

  describe("withSyncErrorHandling", () => {
    let mockLog: any;

    beforeEach(async () => {
      mockLog = (await import("@/lib/shared/utils/logger")).log;
      vi.clearAllMocks();
    });

    it("should return successful operation result", () => {
      const operation = vi.fn().mockReturnValue("success");
      const result = withSyncErrorHandling(operation, "test context");

      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledOnce();
    });

    it("should handle and log errors", () => {
      process.env.NODE_ENV = "development";
      const error = new Error("Operation failed");
      const operation = vi.fn().mockImplementation(() => {
        throw error;
      });

      expect(() => withSyncErrorHandling(operation, "test context")).toThrow(
        AppError
      );
      expect(mockLog.error).toHaveBeenCalledWith("Development error", {
        message: "Operation failed",
        stack: error.stack,
        name: "Error",
        timestamp: expect.any(String),
        context: { context: "test context" },
      });
    });
  });
});
