"use client";

import { useState } from "react";

import { MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AlertWithHistory } from "@/lib/core/types";
import {
  getAlertTypeLabel,
  getAlertTypeIcon,
  getAlertStatus,
  getAlertStatusColor,
  getAlertStatusLabel,
  formatAlertCondition,
  formatAlertThreshold,
  getUnresolvedHistoryCount,
  getLatestHistoryEntry,
  calculateAlertHealth,
} from "@/lib/shared/utils/alert-utils";

interface AlertTableProps {
  alerts: AlertWithHistory[];
  onEdit?: (alert: AlertWithHistory) => void;
  onDelete?: (alert: AlertWithHistory) => Promise<void>;
  onToggle?: (alert: AlertWithHistory) => Promise<void>;
  onViewHistory?: (alert: AlertWithHistory) => void;
}

export default function AlertTable({
  alerts,
  onEdit,
  onDelete,
  onToggle,
  onViewHistory,
}: AlertTableProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  const setLoading = (alertId: string, isLoading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [alertId]: isLoading }));
  };

  const handleToggle = async (alert: AlertWithHistory) => {
    if (!onToggle) return;
    setLoading(alert.id, true);
    try {
      await onToggle(alert);
    } finally {
      setLoading(alert.id, false);
    }
  };

  const handleDelete = async (alert: AlertWithHistory) => {
    if (!onDelete) return;
    setLoading(alert.id, true);
    try {
      await onDelete(alert);
    } finally {
      setLoading(alert.id, false);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Alert</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead>Channels</TableHead>
            <TableHead>Last Triggered</TableHead>
            <TableHead>Health</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alerts.map((alert) => {
            const status = getAlertStatus(alert);
            const statusColor = getAlertStatusColor(status);
            const statusLabel = getAlertStatusLabel(status);
            const unresolvedCount = getUnresolvedHistoryCount(alert);
            const latestEntry = getLatestHistoryEntry(alert);
            const health = calculateAlertHealth(alert);
            const isLoading = loadingStates[alert.id] || false;

            return (
              <TableRow key={alert.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded">
                      <span className="text-sm">
                        {getAlertTypeIcon(alert.type)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {getAlertTypeLabel(alert.type)} Alert
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        {alert.apiConnection?.name ?? "Global Alert"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={statusColor}>{statusLabel}</Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">
                      {formatAlertCondition(alert.condition, alert.threshold)}
                    </div>
                    <div className="text-slate-600 dark:text-slate-300">
                      Threshold:{" "}
                      {formatAlertThreshold(alert.type, alert.threshold)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {alert.channels.map((channel, index) => (
                      <span key={channel}>
                        {channel}
                        {index < alert.channels.length - 1 && ", "}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {alert.lastTriggered ? (
                      <div>
                        <div className="font-medium">
                          {new Date(alert.lastTriggered).toLocaleDateString()}
                        </div>
                        <div className="text-slate-600 dark:text-slate-300">
                          {new Date(alert.lastTriggered).toLocaleTimeString()}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400">
                        Never
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        health.status === "healthy"
                          ? "bg-green-500"
                          : health.status === "warning"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    />
                    <div className="text-sm">
                      <div className="font-medium">{health.message}</div>
                      {latestEntry && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Latest: {latestEntry.message}
                        </div>
                      )}
                      {unresolvedCount > 0 && (
                        <div className="text-red-600">
                          {unresolvedCount} unresolved
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" disabled={isLoading}>
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
                        <DropdownMenuItem
                          onClick={() => void handleToggle(alert)}
                        >
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
                          onClick={() => void handleDelete(alert)}
                          className="text-red-600 focus:text-red-600"
                        >
                          Delete Alert
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
