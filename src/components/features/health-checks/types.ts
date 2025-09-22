/**
 * Type definitions for health check-related components
 */

import type {
  HealthCheck,
  CheckResultWithDetails,
} from "@/lib/core/repositories";

// Health check form interfaces
export interface HealthCheckFormData {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  expectedStatus: number;
  timeout: number;
  interval: number;
  headers?: Record<string, string>;
  body?: string;
  isActive: boolean;
}

export interface CreateHealthCheckFormProps {
  connectionId: string;
  onSubmit: (data: HealthCheckFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

// Health check card interfaces
export interface HealthCheckCardProps {
  healthCheck: HealthCheck;
  recentResults?: CheckResultWithDetails[];
  onUpdate?: (healthCheck: HealthCheck) => void;
  onDelete?: (healthCheckId: string) => void;
  onToggle?: (healthCheckId: string, isActive: boolean) => void;
}

// Health check actions interfaces
export interface HealthCheckActionsProps {
  healthCheck: HealthCheck;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggle?: () => void;
  onViewResults?: () => void;
}

// Health check results table interfaces
export interface HealthCheckResultsTableProps {
  results: CheckResultWithDetails[];
  isLoading?: boolean;
  onRefresh?: () => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

// Health dashboard interfaces
export interface HealthDashboardProps {
  dashboardData: {
    totalHealthChecks: number;
    activeHealthChecks: number;
    totalChecks: number;
    successRate: number;
    averageResponseTime: number;
    recentFailures: number;
    recentResults: CheckResultWithDetails[];
  };
}

// Health metrics cards interfaces
export interface HealthMetricsCardsProps {
  metrics: {
    totalChecks: number;
    successRate: number;
    averageResponseTime: number;
    uptime: number;
  };
}

// Health check overview interfaces
export interface HealthChecksOverviewProps {
  healthChecks: HealthCheck[];
  limits: {
    maxHealthChecks: number;
    currentHealthChecks: number;
    subscription: string;
  };
  onHealthCheckSelect?: (healthCheck: HealthCheck) => void;
  onHealthCheckUpdate?: (healthCheck: HealthCheck) => void;
  onHealthCheckDelete?: (healthCheckId: string) => void;
}

// Health checks list interfaces
export interface HealthChecksListProps {
  healthChecks: HealthCheck[];
  isLoading?: boolean;
  onHealthCheckSelect?: (healthCheck: HealthCheck) => void;
  onHealthCheckUpdate?: (healthCheck: HealthCheck) => void;
  onHealthCheckDelete?: (healthCheckId: string) => void;
}

// Health checks header interfaces
export interface HealthChecksHeaderProps {
  title: string;
  description?: string;
  totalHealthChecks: number;
  activeHealthChecks: number;
  onCreateNew?: () => void;
}

// Health layout header interfaces
export interface HealthLayoutHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

// Health navigation interfaces
export interface HealthNavigationProps {
  currentPath?: string;
}

// Refresh health button interfaces
export interface RefreshHealthButtonProps {
  onRefresh: () => Promise<void>;
  isLoading?: boolean;
  lastRefresh?: Date;
}

// Form actions interfaces
export interface FormActionsProps {
  onSubmit: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  submitVariant?: "default" | "destructive";
}

// Form header interfaces
export interface FormHeaderProps {
  title: string;
  description?: string;
  onBack?: () => void;
}

// Basic config section interfaces
export interface BasicConfigSectionProps {
  formData: HealthCheckFormData;
  onInputChange: (
    field: keyof HealthCheckFormData,
    value: HTMLInputElement["value"]
  ) => void;
  errors?: Record<string, string>;
}

// Advanced config section interfaces
export interface AdvancedConfigSectionProps {
  formData: HealthCheckFormData;
  onInputChange: (
    field: keyof HealthCheckFormData,
    value: HTMLInputElement["value"]
  ) => void;
  errors?: Record<string, string>;
}

// Plan info card interfaces
export interface PlanInfoCardProps {
  currentPlan: string;
  limits: {
    maxHealthChecks: number;
    currentHealthChecks: number;
    minInterval: number;
  };
  onUpgrade?: () => void;
}
