import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock the environment variable
const originalEnv = process.env.ENCRYPTION_KEY;

describe("Encryption", () => {
  beforeEach(() => {
    // Set a valid encryption key for testing
    process.env.ENCRYPTION_KEY = "12345678901234567890123456789012"; // 32 characters
  });

  afterEach(() => {
    // Restore original environment
    if (originalEnv) {
      process.env.ENCRYPTION_KEY = originalEnv;
    } else {
      delete process.env.ENCRYPTION_KEY;
    }
  });

  describe("encrypt", () => {
    it("should encrypt text successfully", async () => {
      const { encrypt } = await import("../encryption");
      const text = "sensitive-data";

      const encrypted = encrypt(text);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(text);
      expect(encrypted).toContain(":"); // Should contain separators
      expect(encrypted.split(":").length).toBe(3); // Should have 3 parts
    });

    it("should produce different encrypted values for same input", async () => {
      const { encrypt } = await import("../encryption");
      const text = "sensitive-data";

      const encrypted1 = encrypt(text);
      const encrypted2 = encrypt(text);

      expect(encrypted1).not.toBe(encrypted2); // Different IVs should produce different results
    });

    it("should handle empty string", async () => {
      const { encrypt } = await import("../encryption");
      const text = "";

      const encrypted = encrypt(text);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(text);
    });

    it("should handle special characters", async () => {
      const { encrypt } = await import("../encryption");
      const text = "special-chars:!@#$%^&*()_+-=[]{}|;':\",./<>?";

      const encrypted = encrypt(text);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(text);
    });
  });

  describe("decrypt", () => {
    it("should decrypt text successfully", async () => {
      const { encrypt, decrypt } = await import("../encryption");
      const originalText = "sensitive-data";

      const encrypted = encrypt(originalText);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(originalText);
    });

    it("should handle empty string", async () => {
      const { encrypt, decrypt } = await import("../encryption");
      const originalText = "";

      const encrypted = encrypt(originalText);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(originalText);
    });

    it("should handle special characters", async () => {
      const { encrypt, decrypt } = await import("../encryption");
      const originalText = "special-chars:!@#$%^&*()_+-=[]{}|;':\",./<>?";

      const encrypted = encrypt(originalText);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(originalText);
    });

    it("should handle long text", async () => {
      const { encrypt, decrypt } = await import("../encryption");
      const originalText = "a".repeat(1000); // 1000 character string

      const encrypted = encrypt(originalText);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(originalText);
    });

    it("should throw error for invalid encrypted text format", async () => {
      const { decrypt } = await import("../encryption");

      expect(() => decrypt("invalid-format")).toThrow(
        "Invalid encrypted text format"
      );
      expect(() => decrypt("part1:part2")).toThrow(
        "Invalid encrypted text format"
      );
      expect(() => decrypt("part1:part2:part3:part4")).toThrow(
        "Invalid encrypted text format"
      );
    });

    it("should throw error for corrupted encrypted text", async () => {
      const { decrypt } = await import("../encryption");

      expect(() => decrypt("invalid:hex:data")).toThrow();
    });
  });

  describe("encrypt/decrypt round trip", () => {
    it("should work with various data types", async () => {
      const { encrypt, decrypt } = await import("../encryption");

      const testCases = [
        "simple text",
        "text with spaces",
        "text-with-dashes",
        "text_with_underscores",
        "text.with.dots",
        "text/with/slashes",
        "text:with:colons",
        "text;with;semicolons",
        "text,with,commas",
        "text with numbers 123456789",
        "text with special chars !@#$%^&*()",
        "Unicode text: 你好世界 🌍",
        'JSON-like data: {"key": "value", "number": 123}',
        "Base64-like: dGVzdA==",
        "URL-like: https://example.com/path?param=value",
        "SQL-like: SELECT * FROM users WHERE id = 1",
        "Empty string: ",
        "Single character: a",
        "Very long text: " + "x".repeat(10000),
      ];

      testCases.forEach((testCase) => {
        const encrypted = encrypt(testCase);
        const decrypted = decrypt(encrypted);
        expect(decrypted).toBe(testCase);
      });
    });
  });

  describe("environment validation", () => {
    it("should throw error when ENCRYPTION_KEY is not set", async () => {
      delete process.env.ENCRYPTION_KEY;

      // Clear module cache and re-import
      vi.resetModules();

      await expect(async () => {
        await import("../encryption");
      }).rejects.toThrow("ENCRYPTION_KEY must be exactly 32 characters long");
    });

    it("should throw error when ENCRYPTION_KEY is too short", async () => {
      process.env.ENCRYPTION_KEY = "short";

      // Clear module cache and re-import
      vi.resetModules();

      await expect(async () => {
        await import("../encryption");
      }).rejects.toThrow("ENCRYPTION_KEY must be exactly 32 characters long");
    });

    it("should throw error when ENCRYPTION_KEY is too long", async () => {
      process.env.ENCRYPTION_KEY = "a".repeat(33);

      // Clear module cache and re-import
      vi.resetModules();

      await expect(async () => {
        await import("../encryption");
      }).rejects.toThrow("ENCRYPTION_KEY must be exactly 32 characters long");
    });
  });
});
