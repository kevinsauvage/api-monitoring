import type {
  CheckResult,
  HealthCheck,
  Prisma,
  Subscription,
  User,
} from "@prisma/client";
export interface BaseResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface CreateResult extends BaseResult {
  id?: string;
}

export interface ValidationResult extends BaseResult {
  data?: Record<string, unknown>;
  zodError?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

export interface SerializedEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedEntityWithTimestamps extends SerializedEntity {
  lastExecutedAt?: string | null;
}

export interface SerializedApiConnection extends SerializedEntity {
  name: string;
  provider: string;
  baseUrl: string;
  isActive: boolean;
}

export interface SerializedHealthCheck extends SerializedEntityWithTimestamps {
  apiConnectionId: string;
  endpoint: string;
  method: string;
  expectedStatus: number;
  timeout: number;
  interval: number;
  headers: Record<string, string> | null;
  body: string | null;
  queryParams: Record<string, string> | null;
  isActive: boolean;
}

export interface SerializedCheckResult {
  id: string;
  healthCheckId: string;
  status: "SUCCESS" | "FAILURE" | "TIMEOUT" | "ERROR";
  responseTime: number;
  statusCode: number | null;
  errorMessage: string | null;
  metadata: Record<string, unknown> | null;
  timestamp: string;
}

export interface DashboardStats {
  totalConnections: number;
  activeConnections: number;
  totalHealthChecks: number;
  monitoringStats: {
    successRate: number;
    averageResponseTime: number;
    totalChecks: number;
    recentFailures: number;
  };
  recentResults: Array<CheckResultWithDetails>;
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  orderBy?: Record<string, "asc" | "desc">;
  where?: Record<string, unknown>;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type CheckResultWithDetails = Prisma.CheckResultGetPayload<{
  include: {
    healthCheck: {
      select: {
        id: true;
        endpoint: true;
        method: true;
        apiConnection: {
          select: {
            name: true;
            provider: true;
          };
        };
      };
    };
  };
}>;

export type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type Stats = {
  totalChecks: number;
  successRate: number;
  averageResponseTime: number;
  recentFailures: number;
};

export type ConnectionWithHealthChecks = Prisma.ApiConnectionGetPayload<{
  include: {
    healthChecks: {
      select: {
        id: true;
        endpoint: true;
        method: true;
        isActive: true;
        lastExecutedAt: true;
      };
    };
  };
}>;

export type HealthCheckWithConnection = Prisma.HealthCheckGetPayload<{
  select: {
    id: true;
    apiConnectionId: true;
    endpoint: true;
    method: true;
    expectedStatus: true;
    timeout: true;
    interval: true;
    lastExecutedAt: true;
    apiConnection: {
      select: {
        id: true;
        isActive: true;
      };
    };
  };
}>;

export interface CostTrackingResult extends BaseResult {
  costData?: {
    provider: string;
    amount: number;
    currency: string;
    period: string;
    metadata?: unknown;
  };
}

export interface CostTrackingStrategy {
  trackCosts(credentials: Record<string, string>): Promise<CostTrackingResult>;
}

export interface SerializedUser {
  id: string;
  name: string | null;
  email: string;
  subscription: Subscription;
  createdAt: string;
  updatedAt: string;
}

export type ConnectionData = {
  connections: ConnectionWithHealthChecks[];
  user: User | null;
  limits: ConnectionLimits;
};

export type HealthCheckWithResults = HealthCheck & {
  recentResults: Array<CheckResult>;
};

export interface HealthCheckCreateResult {
  success: boolean;
  message?: string;
  error?: string;
  zodError?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

export type ConnectionLimits = {
  maxConnections: number;
  maxHealthChecks: number;
  currentConnections: number;
  currentHealthChecks: number;
  canCreateConnection: boolean;
  canCreateHealthCheck: boolean;
};

export interface ConnectionCreateResult {
  success: boolean;
  message: string;
  connectionId?: string;
  zodError?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

export type ConnectionWithCredentials = {
  id: string;
  name: string;
  provider: string;
  baseUrl: string;
  apiKey?: string | null;
  secretKey?: string | null;
  accountSid?: string | null;
  authToken?: string | null;
  token?: string | null;
};
