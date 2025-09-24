"use client";

import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  Target,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type {
  ConnectionWithHealthChecks,
  CheckResultWithDetails,
} from "@/lib/core/types";

interface ConnectionMetricsProps {
  connection: ConnectionWithHealthChecks;
  recentResults: CheckResultWithDetails[];
}

export default function ConnectionMetrics({
  connection,
  recentResults,
}: ConnectionMetricsProps) {
  // Calculate metrics from recent results
  const totalChecks = recentResults.length;
  const successfulChecks = recentResults.filter(
    (r) => r.status === "SUCCESS"
  ).length;
  const successRate =
    totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0;

  const averageResponseTime =
    totalChecks > 0
      ? recentResults.reduce((sum, r) => sum + r.responseTime, 0) / totalChecks
      : 0;

  const minResponseTime =
    totalChecks > 0 ? Math.min(...recentResults.map((r) => r.responseTime)) : 0;
  const maxResponseTime =
    totalChecks > 0 ? Math.max(...recentResults.map((r) => r.responseTime)) : 0;

  const activeHealthChecks = connection.healthChecks.filter(
    (hc) => hc.isActive
  ).length;
  const totalHealthChecks = connection.healthChecks.length;

  // Calculate uptime (mock calculation - in real app, this would be more sophisticated)
  const uptime = successRate; // Simplified for demo

  const metrics = [
    {
      title: "Connection Status",
      value: connection.isActive ? "Active" : "Inactive",
      icon: connection.isActive ? CheckCircle : AlertTriangle,
      color: connection.isActive ? "text-green-600" : "text-red-600",
      bgColor: connection.isActive
        ? "bg-green-100 dark:bg-green-900"
        : "bg-red-100 dark:bg-red-900",
      description: `${activeHealthChecks}/${totalHealthChecks} health checks active`,
    },
    {
      title: "Success Rate",
      value: `${successRate.toFixed(1)}%`,
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
      progress: successRate,
      description: `${successfulChecks}/${totalChecks} successful checks`,
      status:
        successRate >= 99
          ? "excellent"
          : successRate >= 95
          ? "good"
          : "needs attention",
    },
    {
      title: "Avg Response Time",
      value: `${averageResponseTime.toFixed(0)}ms`,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900",
      progress: Math.min((averageResponseTime / 1000) * 100, 100),
      description: `Range: ${minResponseTime}ms - ${maxResponseTime}ms`,
      status:
        averageResponseTime < 500
          ? "excellent"
          : averageResponseTime < 1000
          ? "good"
          : "needs attention",
    },
    {
      title: "Uptime",
      value: `${uptime.toFixed(1)}%`,
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900",
      progress: uptime,
      description: "Last 24 hours",
      status:
        uptime >= 99.9
          ? "excellent"
          : uptime >= 99
          ? "good"
          : "needs attention",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-600";
      case "good":
        return "text-yellow-600";
      case "needs attention":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "stripe":
        return "💳";
      case "twilio":
        return "📱";
      case "sendgrid":
        return "📧";
      case "github":
        return "🐙";
      case "slack":
        return "💬";
      default:
        return "🔗";
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">
                {getProviderIcon(connection.provider)}
              </div>
              <div>
                <CardTitle className="text-xl">{connection.name}</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline">{connection.provider}</Badge>
                  <Badge
                    variant={connection.isActive ? "default" : "secondary"}
                    className={
                      connection.isActive
                        ? "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400"
                        : "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400"
                    }
                  >
                    {connection.isActive ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 mr-1" />
                    )}
                    {connection.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`w-5 h-5 ${metric.color}`} />
                  </div>
                  {metric.status && (
                    <div
                      className={`text-xs font-medium ${getStatusColor(
                        metric.status
                      )}`}
                    >
                      {metric.status.replace(" ", " ").toUpperCase()}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {metric.description}
                    </p>
                  </div>
                  {metric.progress !== undefined && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Performance</span>
                        <span>{metric.progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={metric.progress} className="h-2" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
