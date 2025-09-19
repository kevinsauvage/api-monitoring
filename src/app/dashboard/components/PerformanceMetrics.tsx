"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, Activity, Target } from "lucide-react";

interface PerformanceMetricsProps {
  averageResponseTime: number;
  successRate: number;
  totalChecks: number;
  uptime: number;
}

export default function PerformanceMetrics({
  averageResponseTime,
  successRate,
  totalChecks,
  uptime,
}: PerformanceMetricsProps) {
  const metrics = [
    {
      title: "Average Response Time",
      value: `${averageResponseTime.toFixed(0)}ms`,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900",
      progress: Math.min((averageResponseTime / 1000) * 100, 100), // Assuming 1000ms is 100%
      status:
        averageResponseTime < 500
          ? "excellent"
          : averageResponseTime < 1000
          ? "good"
          : "needs attention",
    },
    {
      title: "Success Rate",
      value: `${successRate.toFixed(1)}%`,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
      progress: successRate,
      status:
        successRate >= 99
          ? "excellent"
          : successRate >= 95
          ? "good"
          : "needs attention",
    },
    {
      title: "System Uptime",
      value: `${uptime.toFixed(1)}%`,
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900",
      progress: uptime,
      status:
        uptime >= 99.9
          ? "excellent"
          : uptime >= 99
          ? "good"
          : "needs attention",
    },
    {
      title: "Total Checks",
      value: totalChecks.toLocaleString(),
      icon: Target,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900",
      progress: 100, // Always 100% for total checks
      status: "excellent",
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

  return (
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
                <div
                  className={`text-xs font-medium ${getStatusColor(
                    metric.status
                  )}`}
                >
                  {metric.status.replace(" ", " ").toUpperCase()}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
                {metric.title !== "Total Checks" && (
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
  );
}
