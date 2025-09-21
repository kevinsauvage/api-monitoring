import React from "react";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import type { CheckStatus } from "@prisma/client";
import {
  STATUS_COLORS,
  STATUS_COLORS_EXTENDED,
  STATUS_TEXT_COLORS,
  METHOD_COLORS,
  PROVIDER_COLORS,
  UPTIME_COLORS,
  RESPONSE_TIME_COLORS,
  RESPONSE_TIME_THRESHOLDS,
  UPTIME_THRESHOLDS,
} from "../constants";

export function getStatusColor(
  status: CheckStatus | string | undefined
): string {
  if (!status) {
    return STATUS_COLORS.UNKNOWN;
  }
  return (
    STATUS_COLORS[status as keyof typeof STATUS_COLORS] ||
    STATUS_COLORS.UNKNOWN ||
    "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  );
}

export function getStatusColorExtended(status: CheckStatus | string): string {
  return STATUS_COLORS_EXTENDED[status as keyof typeof STATUS_COLORS_EXTENDED];
}

export function getStatusTextColor(
  status: CheckStatus | string | undefined
): string {
  if (!status) {
    return STATUS_TEXT_COLORS.UNKNOWN || "text-gray-600";
  }
  return (
    STATUS_TEXT_COLORS[status as keyof typeof STATUS_TEXT_COLORS] ||
    STATUS_TEXT_COLORS.UNKNOWN ||
    "text-gray-600"
  );
}

export function getStatusIcon(status: CheckStatus | string | undefined) {
  if (!status) {
    return <AlertTriangle className="w-4 h-4" />;
  }

  switch (status) {
    case "SUCCESS":
      return <CheckCircle className="w-4 h-4" />;
    case "FAILURE":
    case "ERROR":
      return <XCircle className="w-4 h-4" />;
    case "TIMEOUT":
      return <Clock className="w-4 h-4" />;
    default:
      return <AlertTriangle className="w-4 h-4" />;
  }
}

export function getStatusIconWithColor(
  status: CheckStatus | string | undefined
) {
  const icon = getStatusIcon(status);
  const colorClass = getStatusTextColor(status);

  return <div className={colorClass}>{icon}</div>;
}

export function getMethodColor(method: string): string {
  const upperMethod = method.toUpperCase();
  return METHOD_COLORS[upperMethod as keyof typeof METHOD_COLORS];
}

export function getProviderColor(provider: string): string {
  const lowerProvider = provider.toLowerCase();
  return PROVIDER_COLORS[lowerProvider as keyof typeof PROVIDER_COLORS];
}

export function getUptimeColor(uptime: number): string {
  if (uptime >= UPTIME_THRESHOLDS.EXCELLENT) return UPTIME_COLORS.EXCELLENT;
  if (uptime >= UPTIME_THRESHOLDS.GOOD) return UPTIME_COLORS.GOOD;
  return UPTIME_COLORS.POOR;
}

export function getResponseTimeColor(responseTime: number): string {
  if (responseTime < RESPONSE_TIME_THRESHOLDS.FAST)
    return RESPONSE_TIME_COLORS.FAST;
  if (responseTime < RESPONSE_TIME_THRESHOLDS.SLOW)
    return RESPONSE_TIME_COLORS.MEDIUM;
  return RESPONSE_TIME_COLORS.SLOW;
}

export function getActiveStatusColor(isActive: boolean): string {
  return isActive
    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
}

export function isFastResponseTime(responseTime: number): boolean {
  return responseTime < RESPONSE_TIME_THRESHOLDS.FAST;
}

export function isSlowResponseTime(responseTime: number): boolean {
  return responseTime >= RESPONSE_TIME_THRESHOLDS.SLOW;
}

export function getResponseTimeCategory(
  responseTime: number
): "fast" | "medium" | "slow" {
  if (isFastResponseTime(responseTime)) return "fast";
  if (isSlowResponseTime(responseTime)) return "slow";
  return "medium";
}
