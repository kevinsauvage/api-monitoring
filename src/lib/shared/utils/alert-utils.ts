import type {
  AlertWithHistory,
  SerializedAlertHistory,
} from "@/lib/core/types";

export function getAlertTypeLabel(type: string): string {
  const typeLabels: Record<string, string> = {
    ERROR_RATE: "Error Rate",
    RESPONSE_TIME: "Response Time",
    RATE_LIMIT: "Rate Limit",
    UPTIME: "Uptime",
    CUSTOM: "Custom",
  };
  return typeLabels[type] || type;
}

export function getAlertSeverityLabel(severity: string): string {
  const severityLabels: Record<string, string> = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    CRITICAL: "Critical",
  };
  return severityLabels[severity] || severity;
}

export function getAlertSeverityColor(severity: string): string {
  const severityColors: Record<string, string> = {
    LOW: "text-blue-600 bg-blue-50 border-blue-200",
    MEDIUM: "text-yellow-600 bg-yellow-50 border-yellow-200",
    HIGH: "text-orange-600 bg-orange-50 border-orange-200",
    CRITICAL: "text-red-600 bg-red-50 border-red-200",
  };
  return severityColors[severity] || "text-gray-600 bg-gray-50 border-gray-200";
}

export function getAlertTypeIcon(type: string): string {
  const typeIcons: Record<string, string> = {
    ERROR_RATE: "⚠️",
    RESPONSE_TIME: "⏱️",
    RATE_LIMIT: "🚫",
    UPTIME: "📊",
    CUSTOM: "🔧",
  };
  return typeIcons[type] || "🔔";
}

export function formatAlertCondition(
  condition: string,
  threshold: number
): string {
  return `${condition} > ${threshold}`;
}

export function getChannelIcon(channel: string): string {
  const channelIcons: Record<string, string> = {
    email: "📧",
    slack: "💬",
    webhook: "🔗",
    sms: "📱",
  };
  return channelIcons[channel] || "📢";
}

export function formatChannels(channels: string[]): string {
  return channels
    .map((channel) => `${getChannelIcon(channel)} ${channel}`)
    .join(", ");
}

export function isAlertTriggered(alert: AlertWithHistory): boolean {
  return alert.lastTriggered !== null;
}

export function getAlertStatus(
  alert: AlertWithHistory
): "active" | "inactive" | "triggered" {
  if (!alert.isActive) return "inactive";
  if (isAlertTriggered(alert)) return "triggered";
  return "active";
}

export function getAlertStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    active: "text-green-600 bg-green-50 border-green-200",
    inactive: "text-gray-600 bg-gray-50 border-gray-200",
    triggered: "text-red-600 bg-red-50 border-red-200",
  };
  return statusColors[status] || "text-gray-600 bg-gray-50 border-gray-200";
}

export function getAlertStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    active: "Active",
    inactive: "Inactive",
    triggered: "Triggered",
  };
  return statusLabels[status] || "Unknown";
}

export function getUnresolvedHistoryCount(alert: AlertWithHistory): number {
  return alert.alertHistory.filter((history) => !history.resolved).length;
}

export function getLatestHistoryEntry(
  alert: AlertWithHistory
): SerializedAlertHistory | null {
  if (alert.alertHistory.length === 0) return null;
  return alert.alertHistory.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )[0];
}

export function formatAlertThreshold(type: string, threshold: number): string {
  const typeFormats: Record<string, (value: number) => string> = {
    ERROR_RATE: (value) => `${value}%`,
    RESPONSE_TIME: (value) => `${value}ms`,
    RATE_LIMIT: (value) => `${value} requests`,
    UPTIME: (value) => `${value}%`,
    CUSTOM: (value) => value.toString(),
  };

  const formatter = typeFormats[type];
  return formatter ? formatter(threshold) : threshold.toString();
}

export function calculateAlertHealth(alert: AlertWithHistory): {
  status: "healthy" | "warning" | "critical";
  message: string;
} {
  const unresolvedCount = getUnresolvedHistoryCount(alert);
  const latestEntry = getLatestHistoryEntry(alert);

  if (unresolvedCount === 0) {
    return {
      status: "healthy",
      message: "No active issues",
    };
  }

  if (latestEntry && latestEntry.severity === "CRITICAL") {
    return {
      status: "critical",
      message: "Critical alert active",
    };
  }

  return {
    status: "warning",
    message: `${unresolvedCount} unresolved issue${
      unresolvedCount > 1 ? "s" : ""
    }`,
  };
}

export function sortAlertsByPriority(
  alerts: AlertWithHistory[]
): AlertWithHistory[] {
  return alerts.sort((a, b) => {
    // First sort by status: triggered > active > inactive
    const statusOrder = { triggered: 0, active: 1, inactive: 2 };
    const aStatus = getAlertStatus(a);
    const bStatus = getAlertStatus(b);

    if (statusOrder[aStatus] !== statusOrder[bStatus]) {
      return statusOrder[aStatus] - statusOrder[bStatus];
    }

    // Then sort by unresolved count (descending)
    const aUnresolved = getUnresolvedHistoryCount(a);
    const bUnresolved = getUnresolvedHistoryCount(b);

    if (aUnresolved !== bUnresolved) {
      return bUnresolved - aUnresolved;
    }

    // Finally sort by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function filterAlertsByType(
  alerts: AlertWithHistory[],
  type: string
): AlertWithHistory[] {
  if (type === "all") return alerts;
  return alerts.filter((alert) => alert.type === type);
}

export function filterAlertsByStatus(
  alerts: AlertWithHistory[],
  status: string
): AlertWithHistory[] {
  if (status === "all") return alerts;
  return alerts.filter((alert) => getAlertStatus(alert) === status);
}

export function getAlertSummaryStats(alerts: AlertWithHistory[]): {
  total: number;
  active: number;
  triggered: number;
  inactive: number;
  unresolvedIssues: number;
} {
  const stats = {
    total: alerts.length,
    active: 0,
    triggered: 0,
    inactive: 0,
    unresolvedIssues: 0,
  };

  alerts.forEach((alert) => {
    const status = getAlertStatus(alert);
    stats[status]++;
    stats.unresolvedIssues += getUnresolvedHistoryCount(alert);
  });

  return stats;
}
