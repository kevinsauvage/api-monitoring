import type { SerializedConnectionWithHealthChecks } from "@/lib/core/serializers";
import type { CheckResultWithDetails } from "@/lib/core/repositories";

export interface DashboardHeaderProps {
  title: string;
  description?: string;
  user?: {
    name: string;
    email: string;
    image?: string;
  };
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

export interface DashboardSidebarProps {
  currentPath?: string;
  user?: {
    name: string;
    email: string;
    image?: string;
  };
  onNavigate?: (path: string) => void;
}

export interface DashboardStatsProps {
  stats: {
    totalConnections: number;
    activeConnections: number;
    totalHealthChecks: number;
    activeHealthChecks: number;
    totalCost: number;
    averageResponseTime: number;
    successRate: number;
    uptime: number;
  };
  isLoading?: boolean;
  onRefresh?: () => void;
}

export interface PerformanceMetricsProps {
  averageResponseTime: number;
  successRate: number;
  totalChecks: number;
  uptime: number;
  trend?: {
    responseTime: number;
    successRate: number;
    uptime: number;
  };
}

export interface RecentActivityProps {
  activities: Array<{
    id: string;
    type: "health_check" | "connection" | "cost" | "alert";
    title: string;
    description: string;
    timestamp: Date;
    status?: "success" | "warning" | "error";
    metadata?: Record<string, unknown>;
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

export interface DashboardNavigationProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
    image?: string;
  };
  currentPath?: string;
}

export interface DashboardPageProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    subscription: string;
  };
  stats: {
    totalConnections: number;
    activeConnections: number;
    totalHealthChecks: number;
    activeHealthChecks: number;
    totalCost: number;
    averageResponseTime: number;
    successRate: number;
    uptime: number;
  };
  recentActivities: Array<{
    id: string;
    type: "health_check" | "connection" | "cost" | "alert";
    title: string;
    description: string;
    timestamp: Date;
    status?: "success" | "warning" | "error";
    metadata?: Record<string, unknown>;
  }>;
  connections: SerializedConnectionWithHealthChecks[];
  healthChecks: Array<{
    id: string;
    endpoint: string;
    method: string;
    isActive: boolean;
    lastResult?: CheckResultWithDetails;
  }>;
}
