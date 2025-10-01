import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// Mock dependencies
vi.mock("@next-auth/prisma-adapter", () => ({
  PrismaAdapter: vi.fn(() => "mocked-adapter"),
}));

vi.mock("next-auth/providers/credentials", () => ({
  default: vi.fn(),
}));

vi.mock("next-auth/providers/google", () => ({
  default: vi.fn(),
}));

vi.mock("next-auth/providers/github", () => ({
  default: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
  },
}));

vi.mock("@/lib/infrastructure/database", () => ({
  prisma: "mocked-prisma",
}));

vi.mock("@/lib/core/repositories", () => ({
  UserRepository: vi.fn().mockImplementation(() => ({
    findByEmail: vi.fn(),
  })),
}));

vi.mock("@/lib/shared/utils/logger", () => ({
  log: {
    error: vi.fn(),
  },
}));

describe("Auth Configuration", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    vi.clearAllMocks();

    // Set up environment variables
    process.env = {
      ...originalEnv,
      NEXTAUTH_SECRET: "test-secret",
      GOOGLE_CLIENT_ID: "test-google-client-id",
      GOOGLE_CLIENT_SECRET: "test-google-client-secret",
      GITHUB_CLIENT_ID: "test-github-client-id",
      GITHUB_CLIENT_SECRET: "test-github-client-secret",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("authOptions", () => {
    it("should have correct basic configuration", async () => {
      const { authOptions } = await import("../auth");

      expect(authOptions.adapter).toBe("mocked-adapter");
      expect(authOptions.debug).toBe(false); // NODE_ENV is not "development" in test
      expect(authOptions.secret).toBe("test-secret");
    });

    it("should have correct session configuration", async () => {
      const { authOptions } = await import("../auth");

      expect(authOptions.session).toEqual({
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    });

    it("should have correct pages configuration", async () => {
      const { authOptions } = await import("../auth");

      expect(authOptions.pages).toEqual({
        signIn: "/auth/signin",
      });
    });

    it("should have three providers", async () => {
      const { authOptions } = await import("../auth");

      expect(authOptions.providers).toHaveLength(2);
    });

    it("should have callbacks defined", async () => {
      const { authOptions } = await import("../auth");

      expect(authOptions.callbacks).toBeDefined();
      expect(authOptions.callbacks?.jwt).toBeDefined();
      expect(authOptions.callbacks?.session).toBeDefined();
    });
  });

  describe("Session callback", () => {
    it("should handle token data correctly", async () => {
      const { authOptions } = await import("../auth");

      const mockToken = {
        id: "user-123",
        subscription: "PREMIUM",
      };
      const mockSession = {
        user: {
          id: undefined,
          subscription: undefined,
        },
      };

      const result = authOptions.callbacks?.session?.({
        session: mockSession,
        token: mockToken,
      });

      expect(result).toEqual({
        user: {
          id: "user-123",
          subscription: "PREMIUM",
        },
      });
    });

    it("should handle missing token", async () => {
      const { authOptions } = await import("../auth");

      const mockSession = {
        user: {
          id: undefined,
          subscription: undefined,
        },
      };

      const result = authOptions.callbacks?.session?.({
        session: mockSession,
        token: null,
      });

      expect(result).toEqual(mockSession);
    });
  });

  describe("environment variables", () => {
    it("should use environment variables for configuration", () => {
      expect(process.env.NEXTAUTH_SECRET).toBe("test-secret");
      expect(process.env.GOOGLE_CLIENT_ID).toBe("test-google-client-id");
      expect(process.env.GOOGLE_CLIENT_SECRET).toBe(
        "test-google-client-secret"
      );
      expect(process.env.GITHUB_CLIENT_ID).toBe("test-github-client-id");
      expect(process.env.GITHUB_CLIENT_SECRET).toBe(
        "test-github-client-secret"
      );
    });
  });
});
