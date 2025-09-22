/**
 * Type definitions for connection-related components
 */

import type { SerializedConnectionWithHealthChecks } from "@/lib/core/serializers";
import type { CheckResultWithDetails } from "@/lib/core/repositories";

// Form data interfaces
export interface ConnectionFormData {
  name: string;
  baseUrl: string;
  apiKey: string;
  secretKey: string;
  accountSid: string;
  authToken: string;
  token: string;
}

export interface ConnectionFormProps {
  selectedProvider: string;
  formData: ConnectionFormData;
  onInputChange: (field: keyof ConnectionFormData, value: string) => void;
  showApiKey: boolean;
  onToggleShowApiKey: () => void;
  isValidating: boolean;
  validationResult: {
    success: boolean;
    message: string;
  } | null;
  onValidateConnection: () => void;
}

// Connection card interfaces
export interface ConnectionCardProps {
  connection: SerializedConnectionWithHealthChecks & {
    recentResults?: CheckResultWithDetails[];
  };
}

// Connection actions interfaces
export interface ConnectionActionsProps {
  connection: {
    id: string;
    name: string;
    isActive: boolean;
  };
}

// Provider selection interfaces
export interface ProviderSelectionProps {
  selectedProvider: string;
  onProviderSelect: (providerId: string) => void;
}

// Connection metrics interfaces
export interface ConnectionMetricsProps {
  connection: SerializedConnectionWithHealthChecks;
  recentResults?: CheckResultWithDetails[];
}

// Connection navigation interfaces
export interface ConnectionNavigationProps {
  connectionId: string;
  currentPath?: string;
}

// Connections overview interfaces
export interface ConnectionsOverviewProps {
  connections: SerializedConnectionWithHealthChecks[];
  limits: {
    maxConnections: number;
    currentConnections: number;
    subscription: string;
  };
}

// Connection details card interfaces
export interface ConnectionDetailsCardProps {
  connection: SerializedConnectionWithHealthChecks;
  onUpdate?: () => void;
}

// Chart component interfaces
export interface ConnectionChartProps {
  data: Array<{
    timestamp: string;
    value: number;
    status?: string;
  }>;
  title: string;
  description?: string;
  height?: number;
}

// Plan limits interfaces
export interface PlanLimitsCardProps {
  currentPlan: string;
  limits: {
    maxConnections: number;
    currentConnections: number;
    maxHealthChecks: number;
    currentHealthChecks: number;
  };
  onUpgrade?: () => void;
}

// New connection client interfaces
export interface NewConnectionClientState {
  selectedProvider: string;
  formData: ConnectionFormData;
  showApiKey: boolean;
  isValidating: boolean;
  validationResult: {
    success: boolean;
    message: string;
  } | null;
}

// Connection header interfaces
export interface ConnectionHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary";
  };
}

// Connections list interfaces
export interface ConnectionsListProps {
  connections: SerializedConnectionWithHealthChecks[];
  isLoading?: boolean;
  onConnectionSelect?: (
    connection: SerializedConnectionWithHealthChecks
  ) => void;
  onConnectionUpdate?: (
    connection: SerializedConnectionWithHealthChecks
  ) => void;
  onConnectionDelete?: (connectionId: string) => void;
}

// Connections header interfaces
export interface ConnectionsHeaderProps {
  title: string;
  description?: string;
  totalConnections: number;
  activeConnections: number;
  onCreateNew?: () => void;
}

// New connection header interfaces
export interface NewConnectionHeaderProps {
  title: string;
  description?: string;
  onBack?: () => void;
}
