import { describe, it, expect } from "vitest";
import {
  serializeUser,
  serializeUsers,
  serializeUserWithSubscription,
} from "../user.serializer";
import { createTestUser } from "@/test/utils/test-data";

describe("User Serializers", () => {
  describe("serializeUser", () => {
    it("should serialize a single user", () => {
      const user = createTestUser();
      const result = serializeUser(user);

      expect(result).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      });
    });

    it("should handle date serialization correctly", () => {
      const user = createTestUser({
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-02T00:00:00Z"),
      });
      const result = serializeUser(user);

      expect(result.createdAt).toBe("2024-01-01T00:00:00.000Z");
      expect(result.updatedAt).toBe("2024-01-02T00:00:00.000Z");
    });

    it("should handle string dates", () => {
      const user = {
        ...createTestUser(),
        createdAt: "2024-01-01T00:00:00Z" as any,
        updatedAt: "2024-01-02T00:00:00Z" as any,
      };
      const result = serializeUser(user);

      expect(result.createdAt).toBe("2024-01-01T00:00:00Z");
      expect(result.updatedAt).toBe("2024-01-02T00:00:00Z");
    });
  });

  describe("serializeUsers", () => {
    it("should serialize multiple users", () => {
      const users = [
        createTestUser({ id: "user-1", name: "User 1" }),
        createTestUser({ id: "user-2", name: "User 2" }),
      ];
      const result = serializeUsers(users);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("User 1");
      expect(result[1].name).toBe("User 2");
    });
  });

  describe("serializeUserWithSubscription", () => {
    it("should serialize user with subscription", () => {
      const user = {
        id: "test-user-id",
        name: "Test User",
        email: "test@example.com",
        subscription: "FREE" as const,
      };
      const result = serializeUserWithSubscription(user);

      expect(result).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
      });
    });

    it("should handle different subscription types", () => {
      const user = {
        id: "test-user-id",
        name: "Test User",
        email: "test@example.com",
        subscription: "PREMIUM" as const,
      };
      const result = serializeUserWithSubscription(user);

      expect(result.subscription).toBe("PREMIUM");
    });
  });
});


