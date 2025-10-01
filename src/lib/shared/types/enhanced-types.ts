/**
 * Enhanced TypeScript types with better generics and utility types
 */

import type { CheckStatus, Subscription } from "@prisma/client";

// Enhanced result types with better generics
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// Enhanced status types
export type HealthCheckStatus = CheckStatus;
export type SubscriptionTier = Subscription;

// Utility types for better type safety
export type NonEmptyString = string & { readonly __brand: unique symbol };
export type PositiveNumber = number & { readonly __brand: unique symbol };
export type NonNegativeNumber = number & { readonly __brand: unique symbol };

// Enhanced provider types
export type SupportedProvider =
  | "stripe"
  | "twilio"
  | "sendgrid"
  | "github"
  | "slack";
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// Enhanced credential types
export type ProviderCredentials = {
  [K in SupportedProvider]: K extends "stripe"
    ? { secretKey: string }
    : K extends "twilio"
      ? { accountSid: string; authToken: string }
      : K extends "sendgrid"
        ? { apiKey: string }
        : K extends "github" | "slack"
          ? { token: string }
          : Record<string, never>;
};

// Enhanced response time categories
export type ResponseTimeCategory = "fast" | "medium" | "slow";
export type UptimeCategory = "excellent" | "good" | "poor";

// Enhanced color utility types
export type ColorVariant = "default" | "extended" | "text";
export type StatusColorMap<T extends string> = Record<T, string>;

// Enhanced validation types (avoiding conflicts with api-results)
export type ValidationField = string;
export type ValidationCode = string;
export type ValidationMessage = string;

export type EnhancedValidationError = {
  field: ValidationField;
  message: ValidationMessage;
  code: ValidationCode;
};

// Enhanced service result types (avoiding conflicts with api-results)
export type EnhancedServiceResult<T = unknown> = ApiResponse<T>;
export type EnhancedCreateServiceResult = ApiResponse<{ id: string }>;
export type EnhancedValidationServiceResult<T = unknown> = ApiResponse<T> & {
  zodError?: EnhancedValidationError[];
};

// Enhanced query types
export type SortOrder = "asc" | "desc";
export type QuerySort<T extends string> = Partial<Record<T, SortOrder>>;

export type QueryOptions<T extends string = string> = {
  page?: number;
  limit?: number;
  orderBy?: QuerySort<T>;
  where?: Record<string, unknown>;
};

// Enhanced date range types
export type DateRange = {
  start: Date;
  end: Date;
};

export type PeriodRange = {
  start: Date;
  end: Date;
  period: string;
};

// Enhanced monitoring types
export type MonitoringThresholds = {
  responseTime: {
    fast: number;
    slow: number;
  };
  uptime: {
    excellent: number;
    good: number;
  };
};

export type HealthCheckConfig = {
  id: string;
  apiConnectionId: string;
  endpoint: string;
  method: HttpMethod;
  expectedStatus: number;
  timeout: number;
  headers?: Record<string, string>;
  body?: string;
  queryParams?: Record<string, string>;
};

// Enhanced dashboard types
export type DashboardMetrics = {
  totalConnections: number;
  activeConnections: number;
  totalHealthChecks: number;
  successRate: number;
  averageResponseTime: number;
  recentFailures: number;
};

export type RecentResult = {
  id: string;
  status: HealthCheckStatus;
  responseTime: number;
  timestamp: string;
};

export type DashboardData = DashboardMetrics & {
  recentResults: RecentResult[];
};
