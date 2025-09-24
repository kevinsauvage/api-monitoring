/**
 * Status and color constants
 */

export const STATUS_COLORS = {
  SUCCESS: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  FAILURE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  TIMEOUT:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  ERROR: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  UNKNOWN: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
} as const;

export const STATUS_COLORS_EXTENDED = {
  SUCCESS:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700",
  FAILURE:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-700",
  TIMEOUT:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700",
  ERROR:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-700",
  UNKNOWN:
    "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-700",
} as const;

export const METHOD_COLORS = {
  GET: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  POST: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  PUT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  PATCH:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  DEFAULT: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
} as const;

export const PROVIDER_COLORS = {
  stripe:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  twilio: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  sendgrid: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  github: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  slack: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  DEFAULT: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
} as const;

export const STATUS_TEXT_COLORS = {
  SUCCESS: "text-green-600",
  FAILURE: "text-red-600",
  TIMEOUT: "text-yellow-600",
  ERROR: "text-red-600",
  UNKNOWN: "text-gray-600",
} as const;

export const UPTIME_COLORS = {
  EXCELLENT: "text-green-600 dark:text-green-400", // >= 99%
  GOOD: "text-yellow-600 dark:text-yellow-400", // >= 95%
  POOR: "text-red-600 dark:text-red-400", // < 95%
} as const;

export const RESPONSE_TIME_COLORS = {
  FAST: "text-green-600 dark:text-green-400", // < 500ms
  MEDIUM: "text-yellow-600 dark:text-yellow-400", // 500ms - 2s
  SLOW: "text-red-600 dark:text-red-400", // > 2s
} as const;

export const RESPONSE_TIME_THRESHOLDS = {
  FAST: 500,
  SLOW: 2000,
} as const;

export const UPTIME_THRESHOLDS = {
  EXCELLENT: 99,
  GOOD: 95,
} as const;

export const DEFAULT_PAGINATION = {
  ITEMS_PER_PAGE: 20,
  MAX_ITEMS_PER_PAGE: 100,
} as const;

export const HEALTH_CHECK_DEFAULTS = {
  TIMEOUT: 5000,
  INTERVAL: 300,
  EXPECTED_STATUS: 200,
} as const;
