import type {
  User,
  ApiConnection,
  HealthCheck,
  CheckResult,
  Subscription,
} from "@prisma/client";

// Test data factories
export const createTestUser = (overrides: Partial<User> = {}): User => ({
  id: "test-user-id",
  name: "Test User",
  email: "test@example.com",
  password: "hashed-password",
  subscription: "FREE" as Subscription,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
});

export const createTestConnection = (
  overrides: Partial<ApiConnection> = {}
): ApiConnection => ({
  id: "test-connection-id",
  name: "Test Connection",
  provider: "REST",
  baseUrl: "https://api.example.com",
  apiKey: "encrypted_api_key",
  secretKey: null,
  accountSid: null,
  authToken: null,
  token: null,
  isActive: true,
  userId: "test-user-id",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
});

export const createTestHealthCheck = (
  overrides: Partial<HealthCheck> = {}
): HealthCheck => ({
  id: "test-health-check-id",
  apiConnectionId: "test-connection-id",
  endpoint: "/health",
  method: "GET",
  expectedStatus: 200,
  timeout: 30,
  interval: 300,
  headers: {},
  body: null,
  queryParams: {},
  isActive: true,
  lastExecutedAt: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
});

export const createTestCheckResult = (
  overrides: Partial<CheckResult> = {}
): CheckResult => ({
  id: "test-check-result-id",
  healthCheckId: "test-health-check-id",
  status: "SUCCESS",
  responseTime: 150,
  statusCode: 200,
  errorMessage: null,
  metadata: null,
  timestamp: new Date("2024-01-01"),
  ...overrides,
});

// Test data collections
export const testUsers = [
  createTestUser(),
  createTestUser({ id: "user-2", email: "user2@example.com" }),
];

export const testConnections = [
  createTestConnection(),
  createTestConnection({ id: "conn-2", name: "Second Connection" }),
];

export const testHealthChecks = [
  createTestHealthCheck(),
  createTestHealthCheck({ id: "hc-2", endpoint: "/status" }),
];

export const testCheckResults = [
  createTestCheckResult(),
  createTestCheckResult({ id: "cr-2", status: "FAILURE" }),
];


