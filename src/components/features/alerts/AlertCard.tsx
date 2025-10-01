"use client";

import { MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AlertCardProps {
  alert: {
    id: string;
    type: string;
    condition: string;
    threshold: number;
    isActive: boolean;
    channels: string[];
    lastTriggered: string | null;
    apiConnection?: {
      name: string;
    } | null;
  };
  onEdit?: (alert: AlertCardProps["alert"]) => void;
  onDelete?: (alert: AlertCardProps["alert"]) => void;
  onToggle?: (alert: AlertCardProps["alert"]) => void;
  onViewHistory?: (alert: AlertCardProps["alert"]) => void;
}

export default function AlertCard({
  alert,
  onEdit,
  onDelete,
  onToggle,
  onViewHistory,
}: AlertCardProps) {
  const getAlertTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ERROR_RATE: "Error Rate",
      RESPONSE_TIME: "Response Time",
      RATE_LIMIT: "Rate Limit",
      UPTIME: "Uptime",
      CUSTOM: "Custom",
    };
    return labels[type] || type;
  };

  const getAlertTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      ERROR_RATE: "⚠️",
      RESPONSE_TIME: "⏱️",
      RATE_LIMIT: "🚫",
      UPTIME: "📊",
      CUSTOM: "🔧",
    };
    return icons[type] || "🔔";
  };

  const getAlertStatus = () => {
    if (!alert.isActive) return "inactive";
    if (alert.lastTriggered) return "triggered";
    return "active";
  };

  const getAlertStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "text-green-600 bg-green-50 border-green-200",
      inactive: "text-gray-600 bg-gray-50 border-gray-200",
      triggered: "text-red-600 bg-red-50 border-red-200",
    };
    return colors[status] || "text-gray-600 bg-gray-50 border-gray-200";
  };

  const getAlertStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: "Active",
      inactive: "Inactive",
      triggered: "Triggered",
    };
    return labels[status] || "Unknown";
  };

  const formatAlertCondition = (condition: string, threshold: number) => {
    return `${condition} > ${threshold}`;
  };

  const formatAlertThreshold = (type: string, threshold: number) => {
    const formats: Record<string, (value: number) => string> = {
      ERROR_RATE: (value) => `${value}%`,
      RESPONSE_TIME: (value) => `${value}ms`,
      RATE_LIMIT: (value) => `${value} requests`,
      UPTIME: (value) => `${value}%`,
      CUSTOM: (value) => value.toString(),
    };

    const formatter = formats[type];
    return formatter(threshold);
  };

  const status = getAlertStatus();
  const statusColor = getAlertStatusColor(status);
  const statusLabel = getAlertStatusLabel(status);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <span className="text-lg">{getAlertTypeIcon(alert.type)}</span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {getAlertTypeLabel(alert.type)} Alert
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {alert.apiConnection?.name ?? "Global Alert"}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(alert)}>
                  Edit Alert
                </DropdownMenuItem>
              )}
              {onToggle && (
                <DropdownMenuItem onClick={() => onToggle(alert)}>
                  {alert.isActive ? "Disable" : "Enable"} Alert
                </DropdownMenuItem>
              )}
              {onViewHistory && (
                <DropdownMenuItem onClick={() => onViewHistory(alert)}>
                  View History
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(alert)}
                  className="text-red-600 focus:text-red-600"
                >
                  Delete Alert
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={statusColor}>{statusLabel}</Badge>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {formatAlertCondition(alert.condition, alert.threshold)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">
                Threshold:
              </span>
              <span className="font-medium">
                {formatAlertThreshold(alert.type, alert.threshold)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">
                Channels:
              </span>
              <span className="font-medium">{alert.channels.join(", ")}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  status === "active"
                    ? "bg-green-500"
                    : status === "triggered"
                      ? "bg-red-500"
                      : "bg-gray-500"
                }`}
              />
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {status === "active"
                  ? "No active issues"
                  : status === "triggered"
                    ? "Alert triggered"
                    : "Alert disabled"}
              </span>
            </div>
            {alert.lastTriggered && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Last triggered:{" "}
                {new Date(alert.lastTriggered).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
