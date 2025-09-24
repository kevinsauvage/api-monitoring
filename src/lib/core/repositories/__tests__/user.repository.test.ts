import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserRepository } from "../user.repository";
import { mockPrisma, resetAllMocks } from "../../../../test/utils/test-helpers";
import { createTestUser } from "../../../../test/utils/test-data";

describe("UserRepository", () => {
  let repository: UserRepository;

  beforeEach(() => {
    resetAllMocks();
    repository = new UserRepository();
    // Mock the prisma property
    (repository as any).prisma = mockPrisma;
  });

  describe("findById", () => {
    it("should find user by id", async () => {
      const userId = "test-user-id";
      const mockUser = createTestUser();

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await repository.findById(userId);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual(mockUser);
    });

    it("should return null when user not found", async () => {
      const userId = "non-existent-user";

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);

      const result = await repository.findById(userId);

      expect(result).toBeNull();
    });

    it("should handle database errors", async () => {
      const userId = "test-user-id";
      const error = new Error("Database connection failed");

      vi.mocked(mockPrisma.user.findUnique).mockRejectedValue(error);

      await expect(repository.findById(userId)).rejects.toThrow(
        "Failed to find user"
      );
    });
  });

  describe("findByEmail", () => {
    it("should find user by email", async () => {
      const email = "test@example.com";
      const mockUser = createTestUser();

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await repository.findByEmail(email);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(mockUser);
    });

    it("should return null when user not found", async () => {
      const email = "nonexistent@example.com";

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);

      const result = await repository.findByEmail(email);

      expect(result).toBeNull();
    });

    it("should handle database errors", async () => {
      const email = "test@example.com";
      const error = new Error("Database connection failed");

      vi.mocked(mockPrisma.user.findUnique).mockRejectedValue(error);

      await expect(repository.findByEmail(email)).rejects.toThrow(
        "Failed to find user"
      );
    });
  });

  describe("create", () => {
    it("should create a new user", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "hashed-password",
      };
      const mockUser = createTestUser();

      vi.mocked(mockPrisma.user.create).mockResolvedValue(mockUser);

      const result = await repository.create(userData);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: userData,
      });
      expect(result).toEqual(mockUser);
    });

    it("should handle database errors", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "hashed-password",
      };
      const error = new Error("Database connection failed");

      vi.mocked(mockPrisma.user.create).mockRejectedValue(error);

      await expect(repository.create(userData)).rejects.toThrow(
        "Failed to create user"
      );
    });
  });

  describe("findByIdWithSubscription", () => {
    it("should find user with subscription", async () => {
      const userId = "test-user-id";
      const mockUserWithSubscription = {
        id: userId,
        name: "Test User",
        email: "test@example.com",
        emailVerified: null,
        image: null,
        password: null,
        subscription: "HOBBY" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(
        mockUserWithSubscription
      );

      const result = await repository.findByIdWithSubscription(userId);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          subscription: true,
        },
      });
      expect(result).toEqual(mockUserWithSubscription);
    });

    it("should return null when user not found", async () => {
      const userId = "non-existent-user";

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);

      const result = await repository.findByIdWithSubscription(userId);

      expect(result).toBeNull();
    });

    it("should handle database errors", async () => {
      const userId = "test-user-id";
      const error = new Error("Database connection failed");

      vi.mocked(mockPrisma.user.findUnique).mockRejectedValue(error);

      await expect(repository.findByIdWithSubscription(userId)).rejects.toThrow(
        "Failed to find user with subscription"
      );
    });
  });

  describe("update", () => {
    it("should update user information", async () => {
      const userId = "test-user-id";
      const updateData = {
        name: "Updated Name",
        email: "updated@example.com",
      };
      const mockUpdatedUser = createTestUser();

      vi.mocked(mockPrisma.user.update).mockResolvedValue(mockUpdatedUser);

      const result = await repository.update(userId, updateData);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
      });
      expect(result).toEqual(mockUpdatedUser);
    });

    it("should update subscription", async () => {
      const userId = "test-user-id";
      const updateData = {
        subscription: "BUSINESS" as const,
      };
      const mockUpdatedUser = createTestUser();

      vi.mocked(mockPrisma.user.update).mockResolvedValue(mockUpdatedUser);

      const result = await repository.update(userId, updateData);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
      });
      expect(result).toEqual(mockUpdatedUser);
    });

    it("should handle database errors", async () => {
      const userId = "test-user-id";
      const updateData = { name: "Updated Name" };
      const error = new Error("Database connection failed");

      vi.mocked(mockPrisma.user.update).mockRejectedValue(error);

      await expect(repository.update(userId, updateData)).rejects.toThrow(
        "Failed to update user"
      );
    });
  });

  describe("delete", () => {
    it("should delete user", async () => {
      const userId = "test-user-id";

      vi.mocked(mockPrisma.user.delete).mockResolvedValue(createTestUser());

      await repository.delete(userId);

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it("should handle database errors", async () => {
      const userId = "test-user-id";
      const error = new Error("Database connection failed");

      vi.mocked(mockPrisma.user.delete).mockRejectedValue(error);

      await expect(repository.delete(userId)).rejects.toThrow(
        "Failed to delete user"
      );
    });
  });

  describe("existsByEmail", () => {
    it("should return true when user exists", async () => {
      const email = "test@example.com";
      const mockUser = createTestUser();

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await repository.existsByEmail(email);

      expect(result).toBe(true);
    });

    it("should return false when user does not exist", async () => {
      const email = "nonexistent@example.com";

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);

      const result = await repository.existsByEmail(email);

      expect(result).toBe(false);
    });

    it("should handle database errors", async () => {
      const email = "test@example.com";
      const error = new Error("Database connection failed");

      vi.mocked(mockPrisma.user.findUnique).mockRejectedValue(error);

      await expect(repository.existsByEmail(email)).rejects.toThrow(
        "Failed to find user"
      );
    });
  });

  describe("count", () => {
    it("should return user count", async () => {
      const count = 42;

      vi.mocked(mockPrisma.user.count).mockResolvedValue(count);

      const result = await repository.count();

      expect(mockPrisma.user.count).toHaveBeenCalled();
      expect(result).toBe(count);
    });

    it("should handle database errors", async () => {
      const error = new Error("Database connection failed");

      vi.mocked(mockPrisma.user.count).mockRejectedValue(error);

      await expect(repository.count()).rejects.toThrow("Failed to count users");
    });
  });
});
