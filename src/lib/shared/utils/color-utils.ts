/**
 * Centralized color utility functions
 * Replaces scattered color functions with a unified approach
 */

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

import type { CheckStatus } from "@prisma/client";

export class ColorUtils {
  /**
   * Get status color for UI components
   */
  static getStatusColor(status: CheckStatus | string | undefined): string {
    if (!status) {
      return STATUS_COLORS.UNKNOWN;
    }
    return (
      STATUS_COLORS[status as keyof typeof STATUS_COLORS] ||
      STATUS_COLORS.UNKNOWN ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    );
  }

  /**
   * Get extended status color for enhanced UI components
   */
  static getStatusColorExtended(status: CheckStatus | string): string {
    return STATUS_COLORS_EXTENDED[
      status as keyof typeof STATUS_COLORS_EXTENDED
    ];
  }

  /**
   * Get status text color
   */
  static getStatusTextColor(status: CheckStatus | string | undefined): string {
    if (!status) {
      return STATUS_TEXT_COLORS.UNKNOWN || "text-gray-600";
    }
    return (
      STATUS_TEXT_COLORS[status as keyof typeof STATUS_TEXT_COLORS] ||
      STATUS_TEXT_COLORS.UNKNOWN ||
      "text-gray-600"
    );
  }

  /**
   * Get HTTP method color
   */
  static getMethodColor(method: string): string {
    const upperMethod = method.toUpperCase();
    return (
      METHOD_COLORS[upperMethod as keyof typeof METHOD_COLORS] ||
      METHOD_COLORS.DEFAULT
    );
  }

  /**
   * Get provider color
   */
  static getProviderColor(provider: string): string {
    const lowerProvider = provider.toLowerCase();
    return (
      PROVIDER_COLORS[lowerProvider as keyof typeof PROVIDER_COLORS] ||
      PROVIDER_COLORS.DEFAULT
    );
  }

  /**
   * Get uptime color based on percentage
   */
  static getUptimeColor(uptime: number): string {
    if (uptime >= UPTIME_THRESHOLDS.EXCELLENT) return UPTIME_COLORS.EXCELLENT;
    if (uptime >= UPTIME_THRESHOLDS.GOOD) return UPTIME_COLORS.GOOD;
    return UPTIME_COLORS.POOR;
  }

  /**
   * Get response time color based on milliseconds
   */
  static getResponseTimeColor(responseTime: number): string {
    if (responseTime < RESPONSE_TIME_THRESHOLDS.FAST)
      return RESPONSE_TIME_COLORS.FAST;
    if (responseTime < RESPONSE_TIME_THRESHOLDS.SLOW)
      return RESPONSE_TIME_COLORS.MEDIUM;
    return RESPONSE_TIME_COLORS.SLOW;
  }

  /**
   * Get active status color
   */
  static getActiveStatusColor(isActive: boolean): string {
    return isActive
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
}

// Backward compatibility - export individual functions
export const getStatusColor = (status: CheckStatus | string | undefined) =>
  ColorUtils.getStatusColor(status);
export const getStatusColorExtended = (status: CheckStatus | string) =>
  ColorUtils.getStatusColorExtended(status);
export const getStatusTextColor = (status: CheckStatus | string | undefined) =>
  ColorUtils.getStatusTextColor(status);
export const getMethodColor = (method: string) =>
  ColorUtils.getMethodColor(method);
export const getProviderColor = (provider: string) =>
  ColorUtils.getProviderColor(provider);
export const getUptimeColor = (uptime: number) =>
  ColorUtils.getUptimeColor(uptime);
export const getResponseTimeColor = (responseTime: number) =>
  ColorUtils.getResponseTimeColor(responseTime);
export const getActiveStatusColor = (isActive: boolean) =>
  ColorUtils.getActiveStatusColor(isActive);
