import type { CheckResult, CheckStatus, HealthCheck } from "@prisma/client";
import type { UserWithPassword } from "@/lib/shared/types/prisma";
import type { CheckResultWithDetails } from "@/lib/core/repositories";
import type { ConnectionWithHealthChecks } from "@/lib/core/repositories";

// Connection types
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

export type ConnectionData = {
  connections: ConnectionWithHealthChecks[];
  user: UserWithPassword | null;
  limits: {
    maxConnections: number;
    maxHealthChecks: number;
    currentConnections: number;
    currentHealthChecks: number;
    canCreateConnection: boolean;
    canCreateHealthCheck: boolean;
  };
};

// Check Result types
export type CheckResultBasicInfo = Pick<
  CheckResult,
  "id" | "status" | "responseTime" | "statusCode" | "errorMessage" | "timestamp"
>;

// Plan and limits
export interface PlanLimits {
  minInterval: number;
  maxHealthChecks: number;
  maxConnections: number;
  features: string[];
  name: string;
  description: string;
}

// Chart data types
export type StatusData = {
  status: CheckStatus;
  count: number;
  percentage: number;
}[];

export type UptimeData = {
  timestamp: string;
  uptime: number;
  checks: number;
}[];

// Action result types
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  message: string;
  error?: {
    code: string;
    message: string;
    statusCode: number;
  };
  zodError?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

// Connection action types
export interface ConnectionValidationResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export interface ConnectionCreateResult {
  success: boolean;
  message: string;
  zodError?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

export interface ConnectionActionResult {
  success: boolean;
  message: string;
  error?: string;
  zodError?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

// Health check types
export interface HealthCheckCreateInput {
  apiConnectionId: string;
  endpoint: string;
  method?: string;
  expectedStatus?: number;
  timeout?: number;
  interval?: number;
  headers?: Record<string, string>;
  lastExecutedAt?: Date | null;
  body?: string;
  queryParams?: Record<string, string>;
}

export interface HealthCheckUpdateInput {
  endpoint?: string;
  method?: string;
  expectedStatus?: number;
  timeout?: number;
  interval?: number;
  headers?: Record<string, string>;
  body?: string;
  queryParams?: Record<string, string>;
  isActive?: boolean;
}

// Monitoring types
export type HealthCheckConfig = {
  id: string;
  apiConnectionId: string;
  endpoint: string;
  method: string;
  expectedStatus: number;
  timeout: number;
  headers?: Record<string, string>;
  body?: string;
  queryParams?: Record<string, string>;
};

export type HealthCheckResult = {
  id: string;
  healthCheckId: string;
  status: CheckStatus;
  responseTime: number;
  statusCode: number | null;
  errorMessage?: string | null;
  metadata?: Record<string, unknown> | null;
  timestamp: Date;
};

export type SortField = "timestamp" | "status" | "responseTime" | "statusCode";
export type SortDirection = "asc" | "desc";

export interface HealthChecksListProps {
  healthChecks: SerializedHealthCheck[];
  connectionId: string;
}

export interface ConnectionUptimeChartProps {
  data: UptimeData;
  className?: string;
}

export interface UptimeChartProps {
  data: UptimeData;
  className?: string;
}

export interface SuccessRateChartProps {
  data: StatusData;
  className?: string;
}

// DI Container types
export type ServiceFactory<T = unknown> = () => T;
export type ServiceIdentifier = string | symbol;

// Re-export repository types for convenience
export type { CheckResultWithDetails, ConnectionWithHealthChecks };

// Serialized types for client consumption
export type SerializedHealthCheck = Omit<
  HealthCheck,
  "createdAt" | "updatedAt" | "lastExecutedAt"
> & {
  createdAt: string;
  updatedAt: string;
  lastExecutedAt: string | null;
};

// Re-export Prisma types for convenience
export type {
  User,
  ApiConnection,
  HealthCheck,
  CheckResult,
  Subscription,
  CheckStatus,
  AlertType,
  AlertSeverity,
} from "@prisma/client";

// Re-export schema types for convenience
export type {
  ConnectionValidationInput,
  ConnectionCreateInput,
  RegistrationInput,
} from "@/lib/shared/schemas";
