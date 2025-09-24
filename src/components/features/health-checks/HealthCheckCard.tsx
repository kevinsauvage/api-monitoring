"use client";

import { Activity, Zap, MoreVertical, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ConfirmationDialog, MethodBadge } from "@/components/shared";
import { deleteHealthCheck, triggerHealthCheck } from "@/actions";
import { formatTime } from "@/lib/shared/utils/utils";
import {
  getStatusColor,
  getStatusIcon,
  getActiveStatusColor,
} from "@/lib/shared/utils";
import { useAsyncAction, useConfirmationDialog } from "@/lib/shared/hooks";

import type { HealthCheckWithResults } from "@/lib/core/types";

export default function HealthCheckCard({
  healthCheck,
}: {
  healthCheck: HealthCheckWithResults;
  connectionName: string;
}) {
  const { execute: executeTrigger, isLoading: isTriggering } = useAsyncAction({
    successMessage: "Health check triggered successfully",
    errorMessage: "Failed to trigger health check",
  });

  const { execute: executeDelete, isLoading: isDeleting } = useAsyncAction({
    successMessage: "Health check deleted successfully",
    errorMessage: "Failed to delete health check",
  });

  const deleteDialog = useConfirmationDialog({
    title: "Delete Health Check",
    description: `Are you sure you want to delete the health check for ${healthCheck.endpoint}? This action cannot be undone and will remove all associated monitoring data.`,
    confirmText: "Delete",
    variant: "destructive",
  });

  const handleTrigger = () => {
    void executeTrigger(async () =>
      triggerHealthCheck({ healthCheckId: healthCheck.id })
    );
  };

  const handleDelete = () => {
    deleteDialog.openDialog();
  };

  const handleConfirmDelete = () => {
    void executeDelete(async () =>
      deleteHealthCheck({ healthCheckId: healthCheck.id })
    );
  };

  // Calculate metrics from recent results
  const totalChecks = healthCheck.recentResults.length;
  const successfulChecks = healthCheck.recentResults.filter(
    (r) => r.status === "SUCCESS"
  ).length;
  const successRate =
    totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0;

  const averageResponseTime =
    totalChecks > 0
      ? healthCheck.recentResults.reduce((sum, r) => sum + r.responseTime, 0) /
        totalChecks
      : 0;

  const lastResult = healthCheck.recentResults[0];
  const lastStatus = lastResult?.status;
  const lastResponseTime = lastResult?.responseTime;

  return (
    <>
      <Card className="group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <MethodBadge method={healthCheck.method} />
              <div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {healthCheck.endpoint}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={getActiveStatusColor(healthCheck.isActive)}>
                    {healthCheck.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Expected: {healthCheck.expectedStatus}
                  </span>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Activity className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleTrigger}
                  disabled={isTriggering}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  {isTriggering ? "Triggering..." : "Trigger Check"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600 focus:text-red-600"
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Interval</p>
                <p className="font-medium">{healthCheck.interval}s</p>
              </div>
              <div>
                <p className="text-muted-foreground">Timeout</p>
                <p className="font-medium">{healthCheck.timeout}ms</p>
              </div>
              <div>
                <p className="text-muted-foreground">Success Rate</p>
                <div className="flex items-center space-x-2">
                  <Progress value={successRate} className="h-2 flex-1" />
                  <span className="text-sm font-medium">
                    {successRate.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Avg. Response</p>
                <p className="font-medium">
                  {averageResponseTime.toFixed(0)}ms
                </p>
              </div>
            </div>

            {
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className={getStatusColor(lastStatus)}>
                    {getStatusIcon(lastStatus)}
                  </div>
                  <span className="text-sm font-medium">
                    Last check: {lastStatus}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{lastResponseTime}ms</span>
                  <span>{formatTime(lastResult?.timestamp)}</span>
                </div>
              </div>
            }
          </div>
        </CardContent>
      </Card>

      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.closeDialog}
        onConfirm={handleConfirmDelete}
        title={deleteDialog.options.title}
        description={deleteDialog.options.description}
        confirmText={deleteDialog.options.confirmText ?? "Delete"}
        variant={deleteDialog.options.variant ?? "default"}
      />
    </>
  );
}
