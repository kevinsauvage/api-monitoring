/**
 * Type definitions for cost-related components
 */

import type { JsonValue } from "@prisma/client/runtime/library";

// Cost analytics dashboard interfaces
export interface CostAnalyticsDashboardProps {
  costAnalytics: {
    totalCost: number;
    averageCost: number;
    costByProvider: Array<{
      provider: string;
      totalCost: number;
      count: number;
    }>;
    costByPeriod: Array<{ period: string; totalCost: number; count: number }>;
    costTrend: Array<{ date: string; totalCost: number }>;
  };
  costMetrics: Array<{
    id: string;
    amount: number;
    currency: string;
    period: string;
    timestamp: Date;
    metadata: JsonValue;
    apiConnection: {
      name: string;
      provider: string;
    };
  }>;
}

// Cost summary cards interfaces
export interface CostSummaryCardsProps {
  totalCost: number;
  averageCost: number;
  costByProvider: Array<{
    provider: string;
    totalCost: number;
    count: number;
  }>;
  period?: string;
}

// Cost trend chart interfaces
export interface CostTrendChartProps {
  data: Array<{
    date: string;
    totalCost: number;
    period: string;
  }>;
  height?: number;
  showLegend?: boolean;
}

// Cost by provider chart interfaces
export interface CostByProviderChartProps {
  data: Array<{
    provider: string;
    totalCost: number;
    count: number;
    percentage: number;
  }>;
  height?: number;
  showLegend?: boolean;
}

// Cost by period chart interfaces
export interface CostByPeriodChartProps {
  data: Array<{
    period: string;
    totalCost: number;
    count: number;
  }>;
  height?: number;
  showLegend?: boolean;
}

// Recent cost metrics interfaces
export interface RecentCostMetricsProps {
  metrics: Array<{
    id: string;
    amount: number;
    currency: string;
    period: string;
    timestamp: Date;
    metadata: JsonValue;
    apiConnection: {
      name: string;
      provider: string;
    };
  }>;
  isLoading?: boolean;
  onRefresh?: () => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

// Cost tracking button interfaces
export interface CostTrackingButtonProps {
  onTrackCost: (data: {
    connectionId: string;
    amount: number;
    currency: string;
    period: string;
    metadata?: Record<string, unknown>;
  }) => Promise<void>;
  isLoading?: boolean;
  connections?: Array<{
    id: string;
    name: string;
    provider: string;
  }>;
}
