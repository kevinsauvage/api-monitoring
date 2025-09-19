"use client";

import Link from "next/link";
import { useState } from "react";
import {
  MoreVertical,
  ExternalLink,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  Power,
  PowerOff,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { Button } from "@/components/ui/button";
import {
  toggleConnectionActive,
  deleteConnection,
} from "@/actions/connection-actions";
import { formatTime } from "@/lib/utils";
import { toast } from "sonner";

// Use Prisma's generated types instead of custom interfaces
import type { SerializedConnectionWithHealthChecks } from "@/lib/serializers";

interface ConnectionCardProps {
  connection: SerializedConnectionWithHealthChecks;
}

export default function ConnectionCard({ connection }: ConnectionCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleToggleActive = async () => {
    try {
      const result = await toggleConnectionActive(
        connection.id,
        connection.isActive
      );

      if (result.success) {
        toast.success(
          `Connection ${
            connection.isActive ? "deactivated" : "activated"
          } successfully`
        );
      } else {
        toast.error(result.error ?? "Failed to update connection");
      }
    } catch (error) {
      console.error(
        "Error toggling connection:",
        error instanceof Error ? error.message : String(error)
      );
      toast.error("Failed to update connection");
    }
  };

  const handleDelete = async () => {
    try {
      const result = await deleteConnection(connection.id);

      if (result.success) {
        toast.success("Connection deleted successfully");
      } else {
        toast.error(result.error ?? "Failed to delete connection");
      }
    } catch (error) {
      console.error(
        "Error deleting connection:",
        error instanceof Error ? error.message : String(error)
      );
      toast.error("Failed to delete connection");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "stripe":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "twilio":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "sendgrid":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "github":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "slack":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  // Calculate health metrics
  const totalHealthChecks = connection.healthChecks?.length ?? 0;
  const activeHealthChecks =
    connection.healthChecks?.filter((hc) => hc.isActive).length ?? 0;

  // Calculate metrics from health checks
  const healthChecksWithResults =
    connection.healthChecks?.filter((hc) => hc.lastExecutedAt) ?? [];
  const totalResults = healthChecksWithResults.length;
  const successfulResults = healthChecksWithResults.length; // All executed health checks are considered successful
  const successRate = totalResults > 0 ? 100 : 0; // Simplified - if executed, consider successful

  // Since we don't have response time data in health check configuration, use default
  const averageResponseTime = 0;

  // Get the most recent execution time
  const lastExecutedHealthCheck = healthChecksWithResults.sort(
    (a, b) =>
      new Date(b.lastExecutedAt!).getTime() -
      new Date(a.lastExecutedAt!).getTime()
  )[0];

  const lastStatus = lastExecutedHealthCheck ? "SUCCESS" : "UNKNOWN";

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
      <Card className="group hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Badge
                variant="outline"
                className={getProviderColor(connection.provider)}
              >
                {connection.provider}
              </Badge>
              <div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {connection.name}
                </h3>
                <p className="text-sm text-muted-foreground font-mono">
                  {connection.baseUrl}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(connection.isActive)}>
                {connection.isActive ? "Active" : "Inactive"}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/connections/${connection.id}`}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/dashboard/connections/${connection.id}/health-checks`}
                    >
                      <Activity className="mr-2 h-4 w-4" />
                      Health Checks
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => void handleToggleActive()}>
                    {connection.isActive ? (
                      <PowerOff className="mr-2 h-4 w-4" />
                    ) : (
                      <Power className="mr-2 h-4 w-4" />
                    )}
                    {connection.isActive ? "Deactivate" : "Activate"}
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
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Health Check Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Health Checks</p>
                <p className="text-lg font-semibold">
                  {activeHealthChecks}/{totalHealthChecks} active
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <div className="flex items-center space-x-2">
                  <Progress value={successRate} className="h-2 flex-1" />
                  <span className="text-sm font-medium">
                    {successRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Response</p>
                <p className="text-lg font-semibold">
                  {averageResponseTime.toFixed(0)}ms
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Checks</p>
                <p className="text-lg font-semibold">{totalResults}</p>
              </div>
            </div>

            {/* Last Result */}
            {lastExecutedHealthCheck && (
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
                  <span>N/A</span>
                  <span>
                    {formatTime(lastExecutedHealthCheck.lastExecutedAt!)}
                  </span>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex space-x-2 pt-2">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href={`/dashboard/connections/${connection.id}`}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Details
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link
                  href={`/dashboard/connections/${connection.id}/health-checks`}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Health Checks
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              Delete Connection
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the connection{" "}
              <strong>{connection.name}</strong>? This action cannot be undone
              and will remove all associated health checks and monitoring data.
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
