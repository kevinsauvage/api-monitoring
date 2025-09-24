import { describe, it, expect, beforeEach, vi } from "vitest";
import { BaseRepository } from "../base.repository";
import { DatabaseError } from "../../../shared/errors";
import { resetAllMocks } from "../../../../test/utils/test-helpers";

// Test implementation of BaseRepository
class TestRepository extends BaseRepository {
  async testExecuteQuery() {
    return this.executeQuery(async () => "success", "test operation");
  }

  async testExecuteQueryWithError() {
    return this.executeQuery(async () => {
      throw new Error("Database error");
    }, "test operation");
  }

  async testExecuteParallel() {
    return this.executeParallel(
      [async () => "result1", async () => "result2"],
      "parallel test"
    );
  }

  async testExecuteWithRetry() {
    return this.executeWithRetry(async () => "success", "retry test", 2, 100);
  }

  async testExecuteWithRetryFailure() {
    return this.executeWithRetry(
      async () => {
        throw new Error("connection timeout");
      },
      "retry test",
      2,
      100
    );
  }
}

describe("BaseRepository", () => {
  let repository: TestRepository;

  beforeEach(() => {
    resetAllMocks();
    repository = new TestRepository();
  });

  describe("executeQuery", () => {
    it("should execute operation successfully", async () => {
      const result = await repository.testExecuteQuery();
      expect(result).toBe("success");
    });

    it("should handle database errors", async () => {
      await expect(repository.testExecuteQueryWithError()).rejects.toThrow(
        DatabaseError
      );
    });
  });

  describe("executeParallel", () => {
    it("should execute operations in parallel", async () => {
      const results = await repository.testExecuteParallel();
      expect(results).toEqual(["result1", "result2"]);
    });
  });

  describe("executeWithRetry", () => {
    it("should execute operation successfully on first try", async () => {
      const result = await repository.testExecuteWithRetry();
      expect(result).toBe("success");
    });

    it("should retry on retryable errors", async () => {
      await expect(repository.testExecuteWithRetryFailure()).rejects.toThrow(
        DatabaseError
      );
    });
  });

  describe("buildErrorMessage", () => {
    it("should build error message without identifier", () => {
      const message = (repository as any).buildErrorMessage("create", "user");
      expect(message).toBe("Failed to create user");
    });

    it("should build error message with identifier", () => {
      const message = (repository as any).buildErrorMessage(
        "update",
        "user",
        "user-123"
      );
      expect(message).toBe("Failed to update user with ID 'user-123'");
    });
  });
});
