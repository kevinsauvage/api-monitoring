import { describe, it, expect } from "vitest";
import { ServiceResponseBuilder } from "../service-response-builder";
import { ValidationError } from "zod";

describe("ServiceResponseBuilder", () => {
  describe("success", () => {
    it("should create success response with data", () => {
      const data = { id: "123", name: "Test" };
      const result = ServiceResponseBuilder.success(
        data,
        "Operation successful"
      );

      expect(result).toEqual({
        success: true,
        data,
        message: "Operation successful",
      });
    });

    it("should create success response without data", () => {
      const result = ServiceResponseBuilder.success(
        null,
        "Operation successful"
      );

      expect(result).toEqual({
        success: true,
        data: null,
        message: "Operation successful",
      });
    });

    it("should create success response without message", () => {
      const data = { id: "123" };
      const result = ServiceResponseBuilder.success(data);

      expect(result).toEqual({
        success: true,
        data,
        message: "Operation completed successfully",
      });
    });
  });

  describe("error", () => {
    it("should create error response with string message", () => {
      const result = ServiceResponseBuilder.error(
        "Something went wrong",
        "testMethod"
      );

      expect(result).toEqual({
        success: false,
        error: "testMethod: Something went wrong",
      });
    });

    it("should create error response with Error object", () => {
      const error = new Error("Database connection failed");
      const result = ServiceResponseBuilder.error(error, "testMethod");

      expect(result).toEqual({
        success: false,
        error: "testMethod: Database connection failed",
      });
    });

    it("should create error response without method name", () => {
      const result = ServiceResponseBuilder.error("Something went wrong");

      expect(result).toEqual({
        success: false,
        error: "Something went wrong",
      });
    });
  });

  describe("created", () => {
    it("should create created response with ID", () => {
      const result = ServiceResponseBuilder.created("123", "Resource created");

      expect(result).toEqual({
        success: true,
        id: "123",
        message: "Resource created",
      });
    });

    it("should create created response without message", () => {
      const result = ServiceResponseBuilder.created("123");

      expect(result).toEqual({
        success: true,
        id: "123",
        message: "Resource created successfully",
      });
    });
  });

  describe("notFound", () => {
    it("should create not found response", () => {
      const result = ServiceResponseBuilder.notFound("User");

      expect(result).toEqual({
        success: false,
        error: "User not found",
      });
    });

    it("should create not found response without ID", () => {
      const result = ServiceResponseBuilder.notFound("User");

      expect(result).toEqual({
        success: false,
        error: "User not found",
      });
    });
  });

  describe("unauthorized", () => {
    it("should create unauthorized response", () => {
      const result = ServiceResponseBuilder.unauthorized("Access denied");

      expect(result).toEqual({
        success: false,
        error: "Access denied",
      });
    });

    it("should create unauthorized response with default message", () => {
      const result = ServiceResponseBuilder.unauthorized();

      expect(result).toEqual({
        success: false,
        error: "Unauthorized access",
      });
    });
  });

  describe("serviceUnavailable", () => {
    it("should create service unavailable response", () => {
      const result =
        ServiceResponseBuilder.serviceUnavailable("Database is down");

      expect(result).toEqual({
        success: false,
        error: "Database is down",
      });
    });

    it("should create service unavailable response with default message", () => {
      const result = ServiceResponseBuilder.serviceUnavailable();

      expect(result).toEqual({
        success: false,
        error: "Service temporarily unavailable",
      });
    });
  });

  describe("validationError", () => {
    it("should create validation error response with validation errors", () => {
      const zodErrors = [
        {
          field: "name",
          message: "Expected string, received number",
          code: "invalid_type",
        },
      ];
      const result = ServiceResponseBuilder.validationError(
        zodErrors,
        "validateUser"
      );

      expect(result).toEqual({
        success: false,
        error: "validateUser: Validation failed",
        zodError: zodErrors,
      });
    });

    it("should create validation error response with string message", () => {
      const zodErrors = [
        {
          field: "name",
          message: "Name is required",
          code: "required",
        },
      ];
      const result = ServiceResponseBuilder.validationError(
        zodErrors,
        "validateUser"
      );

      expect(result).toEqual({
        success: false,
        error: "validateUser: Validation failed",
        zodError: zodErrors,
      });
    });
  });
});
