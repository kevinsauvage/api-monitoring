import { vi } from "vitest";

// Mock encryption functions
export const mockEncrypt = vi.fn((data: string) => `encrypted_${data}`);
export const mockDecrypt = vi.fn((data: string) =>
  data.replace("encrypted_", "")
);

vi.mock("@/lib/infrastructure/encryption", () => ({
  encrypt: mockEncrypt,
  decrypt: mockDecrypt,
}));
