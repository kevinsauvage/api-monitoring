import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: [
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "src/test/**/*.ts",
    ],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
      import: importPlugin,
    },
    rules: {
      // TypeScript-specific rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/require-await": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: false,
        },
      ],

      // Type checking rules (requires type information)
      "@typescript-eslint/no-misused-new": "error",
      "@typescript-eslint/no-namespace": "error",
      "@typescript-eslint/no-this-alias": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/no-var-requires": "error",
      "@typescript-eslint/prefer-as-const": "error",
      "@typescript-eslint/prefer-function-type": "error",
      "@typescript-eslint/prefer-namespace-keyword": "error",
      "@typescript-eslint/triple-slash-reference": "error",
      "@typescript-eslint/unbound-method": "error",
      "@typescript-eslint/no-for-in-array": "error",
      "@typescript-eslint/no-implied-eval": "error",
      "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
      "@typescript-eslint/no-unnecessary-condition": "warn",
      "@typescript-eslint/no-unnecessary-type-arguments": "error",
      "@typescript-eslint/prefer-includes": "error",
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/prefer-reduce-type-parameter": "error",
      "@typescript-eslint/prefer-regexp-exec": "error",
      "@typescript-eslint/prefer-string-starts-ends-with": "error",
      "@typescript-eslint/prefer-ts-expect-error": "error",
      "@typescript-eslint/promise-function-async": "error",
      "@typescript-eslint/require-array-sort-compare": "error",
      "@typescript-eslint/restrict-plus-operands": "error",
      "@typescript-eslint/restrict-template-expressions": "warn",
      "@typescript-eslint/return-await": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/unified-signatures": "error",

      // Import ordering rules
      "import/order": [
        "error",
        {
          groups: [
            "builtin", // Node.js built-in modules
            "external", // npm packages
            "internal", // Internal modules (using path mapping)
            "parent", // Parent directory imports
            "sibling", // Same directory imports
            "index", // Index file imports
            "type", // Type imports
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
          pathGroups: [
            {
              pattern: "react",
              group: "external",
              position: "before",
            },
            {
              pattern: "next/**",
              group: "external",
              position: "before",
            },
            {
              pattern: "@/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "**/*.css",
              group: "type",
              position: "after",
            },
          ],
          pathGroupsExcludedImportTypes: ["react", "next"],
        },
      ],
      "import/no-duplicates": "error",
      "import/no-unresolved": "off", // TypeScript handles this
      "import/no-named-as-default": "error",
      "import/no-named-as-default-member": "error",
      "import/no-self-import": "error",
      "import/no-cycle": "error",
      "import/no-useless-path-segments": "error",
      "import/prefer-default-export": "off", // Allow named exports

      // General rules
      "no-unused-vars": "off", // Use TypeScript version instead
      "no-console": "warn",
      "prefer-const": "error",
      "no-var": "error",
      "no-throw-literal": "off", // Disable core rule to avoid conflicts
      "@typescript-eslint/only-throw-error": "error", // Enforce throwing only Error objects
    },
  },
  {
    files: [
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "src/test/**/*.ts",
    ],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        // Don't use project for test files to avoid TypeScript project issues
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      // More lenient rules for test files
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
    },
  },
  {
    ignores: [
      // Dependencies
      "node_modules/**",
      ".pnp",
      ".pnp.js",

      // Production builds
      ".next/**",
      "out/**",
      "dist/**",
      "build/**",

      // Environment files
      ".env",
      ".env.local",
      ".env.development.local",
      ".env.test.local",
      ".env.production.local",

      // Logs
      "npm-debug.log*",
      "yarn-debug.log*",
      "yarn-error.log*",
      "lerna-debug.log*",

      // Runtime data
      "pids",
      "*.pid",
      "*.seed",
      "*.pid.lock",

      // Coverage directory used by tools like istanbul
      "coverage/**",
      "*.lcov",

      // nyc test coverage
      ".nyc_output",

      // Dependency directories
      "jspm_packages/**",

      // TypeScript cache
      "*.tsbuildinfo",

      // Optional npm cache directory
      ".npm",

      // Optional eslint cache
      ".eslintcache",

      // Microbundle cache
      ".rpt2_cache/**",
      ".rts2_cache_cjs/**",
      ".rts2_cache_es/**",
      ".rts2_cache_umd/**",

      // Optional REPL history
      ".node_repl_history",

      // Output of 'npm pack'
      "*.tgz",

      // Yarn Integrity file
      ".yarn-integrity",

      // parcel-bundler cache (https://parceljs.org/)
      ".cache",
      ".parcel-cache",

      // Next.js build output
      ".next",

      // Nuxt.js build / generate output
      ".nuxt",

      // Gatsby files
      ".cache/**",
      "public",

      // Storybook build outputs
      ".out",
      ".storybook-out",

      // Temporary folders
      "tmp/**",
      "temp/**",

      // Editor directories and files
      ".vscode/**",
      ".idea/**",
      "*.swp",
      "*.swo",
      "*~",

      // OS generated files
      ".DS_Store",
      ".DS_Store?",
      "._*",
      ".Spotlight-V100",
      ".Trashes",
      "ehthumbs.db",
      "Thumbs.db",

      // Prisma generated files
      "prisma/migrations/**",

      // Vitest coverage
      "coverage/**",

      // Generated files
      "*.d.ts",
      "next-env.d.ts",
      "eslint.config.mjs",
    ],
  },
];

export default eslintConfig;
