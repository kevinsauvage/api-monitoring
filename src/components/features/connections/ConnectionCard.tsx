"use client";

import Link from "next/link";
import {
  MoreVertical,
  ExternalLink,
  Activity,
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
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/shared";
import {
  toggleConnectionActive,
  deleteConnection,
} from "@/actions/connection-actions";
import { formatTime } from "@/lib/shared/utils/utils";
import {
  getProviderColor,
  getActiveStatusColor,
  getStatusIcon,
  getStatusColor,
} from "@/lib/shared/utils";
import { useAsyncAction, useConfirmationDialog } from "@/lib/shared/hooks";

import type { SerializedConnectionWithHealthChecks } from "@/lib/core/serializers";

interface ConnectionCardProps {
  connection: SerializedConnectionWithHealthChecks;
}

export default function ConnectionCard({ connection }: ConnectionCardProps) {
  const { execute: executeToggle, isLoading: isToggling } = useAsyncAction({
    successMessage: `Connection ${
      connection.isActive ? "deactivated" : "activated"
    } successfully`,
    errorMessage: "Failed to update connection",
  });

  const { execute: executeDelete, isLoading: isDeleting } = useAsyncAction({
    successMessage: "Connection deleted successfully",
    errorMessage: "Failed to delete connection",
  });

  const deleteDialog = useConfirmationDialog({
    title: "Delete Connection",
    description: `Are you sure you want to delete the connection ${connection.name}? This action cannot be undone and will remove all associated health checks and monitoring data.`,
    confirmText: "Delete",
    variant: "destructive",
  });

  const handleToggleActive = () => {
    void executeToggle(async () =>
      toggleConnectionActive(connection.id, connection.isActive)
    );
  };

  const handleDelete = () => {
    deleteDialog.openDialog();
  };

  const handleConfirmDelete = () => {
    void executeDelete(async () => deleteConnection(connection.id));
  };

  const totalHealthChecks = connection.healthChecks?.length || 0;
  const activeHealthChecks =
    connection.healthChecks?.filter((hc) => hc.isActive).length || 0;

  const healthChecksWithResults = connection.healthChecks?.filter(
    (hc) => hc.lastExecutedAt
  );
  const totalResults = healthChecksWithResults.length;
  const successRate = totalResults > 0 ? 100 : 0;

  const averageResponseTime = 0;

  const lastExecutedHealthCheck = healthChecksWithResults
    .filter((hc) => hc.lastExecutedAt)
    .sort(
      (a, b) =>
        new Date(b.lastExecutedAt!).getTime() -
        new Date(a.lastExecutedAt!).getTime()
    )[0];

  const lastStatus = lastExecutedHealthCheck ? "SUCCESS" : "UNKNOWN";

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
              <Badge className={getActiveStatusColor(connection.isActive)}>
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
                  <DropdownMenuItem
                    onClick={handleToggleActive}
                    disabled={isToggling}
                  >
                    {connection.isActive ? (
                      <PowerOff className="mr-2 h-4 w-4" />
                    ) : (
                      <Power className="mr-2 h-4 w-4" />
                    )}
                    {isToggling
                      ? "Updating..."
                      : connection.isActive
                      ? "Deactivate"
                      : "Activate"}
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
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
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

            {lastExecutedHealthCheck?.lastExecutedAt && (
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
                  <span>N/A</span>
                  <span>
                    {formatTime(lastExecutedHealthCheck.lastExecutedAt)}
                  </span>
                </div>
              </div>
            )}

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

      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.closeDialog}
        onConfirm={handleConfirmDelete}
        title={deleteDialog.options.title}
        description={deleteDialog.options.description}
        confirmText={deleteDialog.options.confirmText}
        variant={deleteDialog.options.variant}
      />
    </>
  );
}
