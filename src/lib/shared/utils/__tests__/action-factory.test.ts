import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import {
  createDataAction,
  createActionWithRedirect,
  createDeleteAction,
  createToggleAction,
} from "../action-factory";

// Mock Next.js functions
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

// Mock error handler
vi.mock("@/lib/shared/errors/error-handler", () => ({
  handleActionError: vi.fn(),
}));

describe("Action Factory", () => {
  let mockRevalidatePath: any;
  let mockRedirect: any;
  let mockHandleActionError: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockRevalidatePath = await import("next/cache");
    mockRedirect = await import("next/navigation");
    mockHandleActionError = await import("@/lib/shared/errors/error-handler");
  });

  describe("createDataAction", () => {
    const schema = z.object({
      name: z.string(),
      email: z.string().email(),
    });

    it("should create successful data action", async () => {
      const serviceMethod = vi
        .fn()
        .mockResolvedValue({ id: "123", name: "Test" });
      const action = createDataAction(schema, serviceMethod, ["/test"]);

      const result = await action({
        name: "Test User",
        email: "test@example.com",
      });

      expect(result).toEqual({
        success: true,
        data: { id: "123", name: "Test" },
        message: "Action completed successfully",
      });
      expect(serviceMethod).toHaveBeenCalledWith({
        name: "Test User",
        email: "test@example.com",
      });
      expect(mockRevalidatePath.revalidatePath).toHaveBeenCalledWith("/test");
    });

    it("should create data action without revalidation", async () => {
      const serviceMethod = vi.fn().mockResolvedValue({ id: "123" });
      const action = createDataAction(schema, serviceMethod);

      const result = await action({ name: "Test", email: "test@example.com" });

      expect(result.success).toBe(true);
      expect(mockRevalidatePath.revalidatePath).not.toHaveBeenCalled();
    });

    it("should handle validation errors", async () => {
      const serviceMethod = vi.fn();
      const action = createDataAction(schema, serviceMethod);
      const errorResult = {
        message: "Validation failed",
        zodError: [{ field: "email", message: "Invalid email" }],
      };
      mockHandleActionError.handleActionError.mockReturnValue(errorResult);

      const result = await action({ name: "Test", email: "invalid-email" });

      expect(result).toEqual({
        success: false,
        message: "Validation failed",
        zodError: [{ field: "email", message: "Invalid email" }],
      });
      expect(serviceMethod).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      const serviceMethod = vi
        .fn()
        .mockRejectedValue(new Error("Service error"));
      const action = createDataAction(schema, serviceMethod);
      const errorResult = {
        message: "Service error",
        zodError: [],
      };
      mockHandleActionError.handleActionError.mockReturnValue(errorResult);

      const result = await action({ name: "Test", email: "test@example.com" });

      expect(result).toEqual({
        success: false,
        message: "Service error",
        zodError: [],
      });
    });
  });

  describe("createActionWithRedirect", () => {
    const schema = z.object({
      name: z.string(),
    });

    it("should create successful redirect action", async () => {
      const serviceMethod = vi.fn().mockResolvedValue(undefined);
      const action = createActionWithRedirect(
        schema,
        serviceMethod,
        "/success",
        ["/test"]
      );

      await action({ name: "Test" });

      expect(serviceMethod).toHaveBeenCalledWith({ name: "Test" });
      expect(mockRevalidatePath.revalidatePath).toHaveBeenCalledWith("/test");
      expect(mockRedirect.redirect).toHaveBeenCalledWith("/success");
    });

    it("should handle errors in redirect action", async () => {
      const serviceMethod = vi
        .fn()
        .mockRejectedValue(new Error("Service error"));
      const action = createActionWithRedirect(
        schema,
        serviceMethod,
        "/success"
      );
      const errorResult = {
        message: "Service error",
        zodError: [],
      };
      mockHandleActionError.handleActionError.mockReturnValue(errorResult);

      const result = await action({ name: "Test" });

      expect(result).toEqual({
        success: false,
        message: "Service error",
        zodError: [],
      });
      expect(mockRedirect.redirect).not.toHaveBeenCalled();
    });
  });

  describe("createDeleteAction", () => {
    const schema = z.object({
      id: z.string(),
    });

    it("should create successful delete action", async () => {
      const serviceMethod = vi.fn().mockResolvedValue(undefined);
      const action = createDeleteAction(schema, serviceMethod, ["/test"]);

      const result = await action({ id: "123" });

      expect(result).toEqual({
        success: true,
        message: "Successfully deleted",
      });
      expect(serviceMethod).toHaveBeenCalledWith({ id: "123" });
      expect(mockRevalidatePath.revalidatePath).toHaveBeenCalledWith("/test");
    });

    it("should handle errors in delete action", async () => {
      const serviceMethod = vi
        .fn()
        .mockRejectedValue(new Error("Delete failed"));
      const action = createDeleteAction(schema, serviceMethod, ["/test"]);
      const errorResult = {
        message: "Delete failed",
        zodError: [],
      };
      mockHandleActionError.handleActionError.mockReturnValue(errorResult);

      const result = await action({ id: "123" });

      expect(result).toEqual({
        success: false,
        message: "Delete failed",
        zodError: [],
      });
    });
  });

  describe("createToggleAction", () => {
    const schema = z.object({
      id: z.string(),
      enabled: z.boolean(),
    });

    it("should create successful toggle action", async () => {
      const serviceMethod = vi.fn().mockResolvedValue(undefined);
      const action = createToggleAction(schema, serviceMethod, ["/test"]);

      const result = await action({ id: "123", enabled: true });

      expect(result).toEqual({
        success: true,
        message: "Successfully updated",
      });
      expect(serviceMethod).toHaveBeenCalledWith({ id: "123", enabled: true });
      expect(mockRevalidatePath.revalidatePath).toHaveBeenCalledWith("/test");
    });

    it("should handle errors in toggle action", async () => {
      const serviceMethod = vi
        .fn()
        .mockRejectedValue(new Error("Toggle failed"));
      const action = createToggleAction(schema, serviceMethod, ["/test"]);
      const errorResult = {
        message: "Toggle failed",
        zodError: [],
      };
      mockHandleActionError.handleActionError.mockReturnValue(errorResult);

      const result = await action({ id: "123", enabled: false });

      expect(result).toEqual({
        success: false,
        message: "Toggle failed",
        zodError: [],
      });
    });
  });

  describe("complex scenarios", () => {
    it("should handle multiple revalidation paths", async () => {
      const schema = z.object({ name: z.string() });
      const serviceMethod = vi.fn().mockResolvedValue({ id: "123" });
      const action = createDataAction(schema, serviceMethod, [
        "/path1",
        "/path2",
        "/path3",
      ]);

      await action({ name: "Test" });

      expect(mockRevalidatePath.revalidatePath).toHaveBeenCalledTimes(3);
      expect(mockRevalidatePath.revalidatePath).toHaveBeenCalledWith("/path1");
      expect(mockRevalidatePath.revalidatePath).toHaveBeenCalledWith("/path2");
      expect(mockRevalidatePath.revalidatePath).toHaveBeenCalledWith("/path3");
    });

    it("should handle complex data types", async () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          age: z.number(),
        }),
        tags: z.array(z.string()),
      });
      const serviceMethod = vi.fn().mockResolvedValue({ id: "123" });
      const action = createDataAction(schema, serviceMethod);

      const input = {
        user: { name: "John", age: 30 },
        tags: ["admin", "user"],
      };

      const result = await action(input);

      expect(result.success).toBe(true);
      expect(serviceMethod).toHaveBeenCalledWith(input);
    });

    it("should handle async service methods", async () => {
      const schema = z.object({ id: z.string() });
      const serviceMethod = vi.fn().mockImplementation(async (input) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return { processed: input.id };
      });
      const action = createDataAction(schema, serviceMethod);

      const result = await action({ id: "123" });

      expect(result).toEqual({
        success: true,
        data: { processed: "123" },
        message: "Action completed successfully",
      });
    });
  });
});
