import { resolve } from "path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
    exclude: ["node_modules", ".next", "dist"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.{js,ts}",
        "eslint.config.mjs",
        "postcss.config.mjs",
        "**/coverage/**",
        "**/dist/**",
        "**/.next/**",
        "**/prisma/**",
        "**/migrations/**",
        "**/*.tsx",
        "src/app/**",
        "src/actions/**",
        "src/components/**",
        "src/hooks/**",
        "src/lib/shared/types/**",
        "src/lib/shared/hooks/**",
        "src/lib/shared/errors/**",
        "src/lib/shared/schemas/**",
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
