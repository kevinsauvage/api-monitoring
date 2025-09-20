"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Zap,
  TrendingUp,
} from "lucide-react";
import { triggerHealthCheck } from "@/actions/health-actions";
import { toast } from "sonner";
import { log } from "@/lib/shared/utils/logger";
import type { HealthCheck } from "@prisma/client";

type SerializedHealthCheckWithResults = Omit<
  HealthCheck,
  "createdAt" | "updatedAt" | "lastExecutedAt"
> & {
  createdAt: string;
  updatedAt: string;
  lastExecutedAt: string | null;
  recentResults: Array<{
    id: string;
    status: "SUCCESS" | "FAILURE" | "TIMEOUT" | "ERROR";
    responseTime: number;
    timestamp: string;
  }>;
};

interface HealthChecksOverviewProps {
  healthChecks: SerializedHealthCheckWithResults[];
}

export default function HealthChecksOverview({
  healthChecks,
}: HealthChecksOverviewProps) {
  const [isTriggeringAll, setIsTriggeringAll] = useState(false);

  const activeHealthChecks = healthChecks.filter((hc) => hc.isActive).length;
  const totalHealthChecks = healthChecks.length;

  const handleTriggerAll = async () => {
    setIsTriggeringAll(true);
    try {
      const activeHealthCheckIds = healthChecks
        .filter((hc) => hc.isActive)
        .map((hc) => hc.id);

      if (activeHealthCheckIds.length === 0) {
        toast.info("No active health checks to trigger");
        return;
      }

      const results = await Promise.allSettled(
        activeHealthCheckIds.map(async (id) => triggerHealthCheck(id))
      );

      const successful = results.filter(
        (result) => result.status === "fulfilled" && result.value.success
      ).length;

      const failed = results.length - successful;

      if (successful > 0) {
        toast.success(
          `Triggered ${successful} health check${successful > 1 ? "s" : ""}`
        );
      }
      if (failed > 0) {
        toast.error(
          `Failed to trigger ${failed} health check${failed > 1 ? "s" : ""}`
        );
      }
    } catch (error) {
      log.error(
        "Error triggering all health checks:",
        error instanceof Error ? error.message : String(error)
      );
      toast.error("Failed to trigger health checks");
    } finally {
      setIsTriggeringAll(false);
    }
  };

  const allResults = healthChecks.flatMap((hc) => hc.recentResults);
  const totalChecks = allResults.length;
  const successfulChecks = allResults.filter(
    (r) => r.status === "SUCCESS"
  ).length;
  const successRate =
    totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0;

  const averageResponseTime =
    totalChecks > 0
      ? allResults.reduce((sum, r) => sum + r.responseTime, 0) / totalChecks
      : 0;
  const minResponseTime =
    totalChecks > 0 ? Math.min(...allResults.map((r) => r.responseTime)) : 0;
  const maxResponseTime =
    totalChecks > 0 ? Math.max(...allResults.map((r) => r.responseTime)) : 0;

  const statusCounts = allResults.reduce<Record<string, number>>(
    (acc, result) => {
      acc[result.status] = (acc[result.status] || 0) + 1;
      return acc;
    },
    { SUCCESS: 0, FAILURE: 0, TIMEOUT: 0, ERROR: 0 }
  );

  const overviewStats = [
    {
      title: "Total Health Checks",
      value: totalHealthChecks,
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900",
      description: `${activeHealthChecks} active`,
    },
    {
      title: "Success Rate",
      value: `${successRate.toFixed(1)}%`,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
      description: `${successfulChecks}/${totalChecks} successful`,
    },
    {
      title: "Avg Response Time",
      value: `${averageResponseTime.toFixed(0)}ms`,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900",
      description: `Range: ${minResponseTime}-${maxResponseTime}ms`,
    },
    {
      title: "Total Checks",
      value: totalChecks,
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900",
      description: "Last 24 hours",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Status Distribution
            </CardTitle>
            <Button
              onClick={() => void handleTriggerAll()}
              disabled={isTriggeringAll || activeHealthChecks === 0}
              size="sm"
              variant="outline"
            >
              <Zap
                className={`w-4 h-4 mr-2 ${
                  isTriggeringAll ? "animate-spin" : ""
                }`}
              />
              {isTriggeringAll ? "Triggering..." : "Trigger All"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Successful
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {statusCounts.SUCCESS || 0}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Failed
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {(statusCounts.FAILURE || 0) + (statusCounts.ERROR || 0)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Timeout
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {statusCounts.TIMEOUT || 0}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Total Checks
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalChecks}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Health Check Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Health Checks</span>
              <span className="text-sm text-muted-foreground">
                {activeHealthChecks} / {totalHealthChecks}
              </span>
            </div>
            <Progress
              value={
                totalHealthChecks > 0
                  ? (activeHealthChecks / totalHealthChecks) * 100
                  : 0
              }
              className="h-2"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {totalHealthChecks - activeHealthChecks} inactive
              </span>
              <span className="text-muted-foreground">
                {((activeHealthChecks / totalHealthChecks) * 100).toFixed(1)}%
                active
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
