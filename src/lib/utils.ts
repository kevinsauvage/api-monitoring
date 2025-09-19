import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(timestamp: string | Date): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

  return date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/**
 * Format a timestamp for time display (consistent across server/client)
 * @param timestamp - ISO timestamp string or Date object
 * @returns Formatted time string (HH:MM:SS)
 */
export function formatTime(timestamp: string | Date): string {
  const date = new Date(timestamp);

  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Format a timestamp for chart display (shorter format)
 * @param timestamp - ISO timestamp string or Date object
 * @returns Formatted time string (HH:MM)
 */
export function formatTimeForChart(timestamp: string | Date): string {
  const date = new Date(timestamp);

  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format response time in milliseconds to a human-readable string
 * @param ms - Response time in milliseconds
 * @returns Formatted response time string
 */
export function formatResponseTime(ms: number): string {
  if (ms < 1000) {
    return `${ms.toFixed(1)}ms`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
}
