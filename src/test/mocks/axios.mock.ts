import { vi } from "vitest";

// Mock axios
export const mockAxios = vi.fn();

vi.mock("axios", () => ({
  default: mockAxios,
}));
