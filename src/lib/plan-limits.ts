import type { Subscription } from "@prisma/client";
import type { PlanLimits } from "./types";

export const PLAN_LIMITS: Record<Subscription, PlanLimits> = {
  HOBBY: {
    minInterval: 300, // 5 minutes
    maxHealthChecks: 5,
    maxConnections: 3,
    name: "Hobby",
    description: "Perfect for personal projects",
    features: [
      "5 health checks",
      "3 API connections",
      "5-minute intervals",
      "Basic monitoring",
      "Email alerts",
    ],
  },
  STARTUP: {
    minInterval: 60, // 1 minute
    maxHealthChecks: 25,
    maxConnections: 10,
    name: "Startup",
    description: "Ideal for growing businesses",
    features: [
      "25 health checks",
      "10 API connections",
      "1-minute intervals",
      "Advanced monitoring",
      "Slack & email alerts",
      "Custom webhooks",
    ],
  },
  BUSINESS: {
    minInterval: 30, // 30 seconds
    maxHealthChecks: 100,
    maxConnections: 50,
    name: "Business",
    description: "Enterprise-grade monitoring",
    features: [
      "100 health checks",
      "50 API connections",
      "30-second intervals",
      "Real-time monitoring",
      "All alert channels",
      "Priority support",
      "Custom integrations",
    ],
  },
};

export function getPlanLimits(subscription: Subscription): PlanLimits {
  return PLAN_LIMITS[subscription];
}

export function getIntervalOptions(subscription: Subscription) {
  const limits = getPlanLimits(subscription);

  const options = [
    { value: 30, label: "30 seconds", disabled: subscription !== "BUSINESS" },
    { value: 60, label: "1 minute", disabled: subscription === "HOBBY" },
    { value: 300, label: "5 minutes", disabled: false },
    { value: 900, label: "15 minutes", disabled: false },
    { value: 1800, label: "30 minutes", disabled: false },
    { value: 3600, label: "1 hour", disabled: false },
    { value: 7200, label: "2 hours", disabled: false },
    { value: 86400, label: "24 hours", disabled: false },
  ];

  return options.map((option) => ({
    ...option,
    disabled: option.value < limits.minInterval || option.disabled,
  }));
}

export function getDefaultInterval(subscription: Subscription): number {
  return getPlanLimits(subscription).minInterval;
}
