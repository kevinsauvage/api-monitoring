import type {
  SerializedAlert,
  SerializedAlertHistory,
  AlertWithHistory,
} from "@/lib/core/types";
import {
  serializeEntityTimestamps,
  serializeTimestamp,
} from "@/lib/core/utils/serializer-utils";

import type { Alert, AlertHistory } from "@prisma/client";

export function serializeAlert(alert: Alert): SerializedAlert {
  return {
    id: alert.id,
    userId: alert.userId,
    apiConnectionId: alert.apiConnectionId,
    type: alert.type,
    condition: alert.condition,
    threshold: Number(alert.threshold),
    isActive: alert.isActive,
    channels: alert.channels,
    webhookUrl: alert.webhookUrl,
    slackChannel: alert.slackChannel,
    lastTriggered: serializeTimestamp(alert.lastTriggered),
    ...serializeEntityTimestamps(alert),
  };
}

export function serializeAlertHistory(
  history: AlertHistory
): SerializedAlertHistory {
  return {
    id: history.id,
    alertId: history.alertId,
    message: history.message,
    severity: history.severity,
    timestamp: serializeTimestamp(history.timestamp) ?? "",
    resolved: history.resolved,
    resolvedAt: serializeTimestamp(history.resolvedAt),
  };
}

export function serializeAlertWithHistory(
  alert: Alert & {
    alertHistory: AlertHistory[];
    apiConnection?: {
      id: string;
      name: string;
      baseUrl: string;
    } | null;
  }
): AlertWithHistory {
  return {
    ...serializeAlert(alert),
    alertHistory: alert.alertHistory.map(serializeAlertHistory),
    apiConnection: alert.apiConnection,
  };
}

export function serializeAlertsWithHistory(
  alerts: Array<
    Alert & {
      alertHistory: AlertHistory[];
      apiConnection?: {
        id: string;
        name: string;
        baseUrl: string;
      } | null;
    }
  >
): AlertWithHistory[] {
  return alerts.map(serializeAlertWithHistory);
}
