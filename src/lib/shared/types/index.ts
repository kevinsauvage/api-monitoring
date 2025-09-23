export interface PlanLimits {
  minInterval: number;
  maxHealthChecks: number;
  maxConnections: number;
  features: string[];
  name: string;
  description: string;
}

export type UptimeData = {
  timestamp: string;
  uptime: number;
  checks: number;
}[];

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

export interface DashboardData {
  totalHealthChecks: number;
  activeHealthChecks: number;
  totalChecks: number;
  successRate: number;
  averageResponseTime: number;
  recentFailures: number;
  recentResults: Array<{
    id: string;
    status: "SUCCESS" | "FAILURE" | "TIMEOUT" | "ERROR";
    responseTime: number;
    timestamp: string;
  }>;
}

export type ServiceFactory<T = unknown> = () => T;
export type ServiceIdentifier = string | symbol;

export type {
  UseAsyncActionOptions,
  UseAsyncActionReturn,
  UseConfirmationDialogOptions,
  UseConfirmationDialogReturn,
} from "./hooks";
