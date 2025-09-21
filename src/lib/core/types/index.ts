/**
 * Shared types for the core module
 * Centralized type definitions to eliminate duplication
 */

// Base result interfaces
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

// Common serialized types
export interface SerializedEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedEntityWithTimestamps extends SerializedEntity {
  lastExecutedAt?: string | null;
}

// API Connection types
export interface SerializedApiConnection extends SerializedEntity {
  name: string;
  provider: string;
  baseUrl: string;
  isActive: boolean;
}

// Health Check types
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

// Check Result types
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

// Cost tracking types
export interface CostTrackingResult extends BaseResult {
  costData?: {
    provider: string;
    amount: number;
    currency: string;
    period: string;
    metadata?: unknown;
  };
}

// Dashboard types
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
  recentResults: Array<
    SerializedCheckResult & {
      healthCheck: {
        id: string;
        endpoint: string;
        method: string;
        apiConnection: {
          provider: string;
          name: string;
        };
      };
    }
  >;
}

// Repository query options
export interface QueryOptions {
  page?: number;
  limit?: number;
  orderBy?: Record<string, "asc" | "desc">;
  where?: Record<string, unknown>;
}

// Pagination result
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
