"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Activity,
  Zap,
  MoreVertical,
  Trash2,
} from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  deleteHealthCheck,
  triggerHealthCheck,
} from "@/actions/health-actions";
import { formatTime } from "@/lib/shared/utils/utils";
import { toast } from "sonner";
import { log } from "@/lib/shared/utils/logger";

import type { HealthCheckWithResults } from "@/lib/core/services/health-check.service";

interface HealthCheckCardProps {
  healthCheck: HealthCheckWithResults;
  connectionName: string;
}

export default function HealthCheckCard({ healthCheck }: HealthCheckCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleTrigger = async () => {
    try {
      const result = await triggerHealthCheck(healthCheck.id);

      if (result.success) {
        toast.success("Health check triggered successfully");
      } else {
        toast.error(result.error ?? "Failed to trigger health check");
      }
    } catch (error) {
      log.error(
        "Error triggering health check:",
        error instanceof Error ? error.message : String(error)
      );
      toast.error("Failed to trigger health check");
    }
  };

  const handleDelete = async () => {
    try {
      const result = await deleteHealthCheck(healthCheck.id);

      if (result.success) {
        toast.success("Health check deleted successfully");
      } else {
        toast.error(result.error ?? "Failed to delete health check");
      }
    } catch (error) {
      log.error(
        "Error deleting health check:",
        error instanceof Error ? error.message : String(error)
      );
      toast.error("Failed to delete health check");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "POST":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "PUT":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "DELETE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "PATCH":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
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
  const lastStatus = lastResult?.status || "UNKNOWN";
  const lastResponseTime = lastResult?.responseTime || 0;

  const getLastStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "text-green-600";
      case "FAILURE":
      case "ERROR":
        return "text-red-600";
      case "TIMEOUT":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getLastStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="w-4 h-4" />;
      case "FAILURE":
      case "ERROR":
        return <XCircle className="w-4 h-4" />;
      case "TIMEOUT":
        return <Clock className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <>
      <Card className="group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Badge
                variant="outline"
                className={getMethodColor(healthCheck.method)}
              >
                {healthCheck.method}
              </Badge>
              <div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {healthCheck.endpoint}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={getStatusColor(healthCheck.isActive)}>
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
                <DropdownMenuItem onClick={() => void handleTrigger()}>
                  <Zap className="mr-2 h-4 w-4" />
                  Trigger Check
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteModal(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Metrics */}
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

            {/* Last Result */}
            {lastResult && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className={getLastStatusColor(lastStatus)}>
                    {getLastStatusIcon(lastStatus)}
                  </div>
                  <span className="text-sm font-medium">
                    Last check: {lastStatus}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{lastResponseTime}ms</span>
                  <span>{formatTime(lastResult.timestamp)}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              Delete Health Check
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the health check for{" "}
              <strong>{healthCheck.endpoint}</strong>? This action cannot be
              undone and will remove all associated monitoring data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteModal(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDelete()}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
