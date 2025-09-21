import { vi } from "vitest";

// Mock NextAuth
export const mockSession = {
  user: {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
  },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
};

export const mockAuthOptions = {
  providers: [],
  callbacks: {
    session: vi.fn(),
    jwt: vi.fn(),
  },
};

// Mock getServerSession
export const mockGetServerSession = vi.fn();

// Mock Next.js headers
vi.mock("next/headers", () => ({
  headers: vi.fn(() => new Map()),
}));

// Mock the entire next-auth module
vi.mock("next-auth", () => ({
  getServerSession: mockGetServerSession,
  default: vi.fn(),
}));

// Mock the auth infrastructure
vi.mock("@/lib/infrastructure/auth", () => ({
  authOptions: mockAuthOptions,
}));

// Mock the auth module that's imported in base.service.ts
vi.mock("@/lib/infrastructure/auth", () => ({
  authOptions: mockAuthOptions,
}));
