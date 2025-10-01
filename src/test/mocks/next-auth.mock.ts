import { vi } from "vitest";

// Mock getServerSession
export const mockGetServerSession = vi.fn();

vi.mock("next-auth", () => ({
  getServerSession: mockGetServerSession,
}));
