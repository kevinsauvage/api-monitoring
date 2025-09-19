"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";

interface ConnectionsOverviewProps {
  connections: Array<{
    id: string;
    name: string;
    provider: string;
    isActive: boolean;
    healthChecks: Array<{
      id: string;
      isActive: boolean;
    }>;
  }>;
  limits: {
    currentConnections: number;
    maxConnections: number;
    currentHealthChecks: number;
    maxHealthChecks: number;
    canCreateConnection: boolean;
    canCreateHealthCheck: boolean;
  };
}

export default function ConnectionsOverview({
  connections,
  limits,
}: ConnectionsOverviewProps) {
  const activeConnections = connections.filter((c) => c.isActive).length;
  const totalHealthChecks = connections.reduce(
    (acc, c) => acc + c.healthChecks.length,
    0
  );
  const activeHealthChecks = connections.reduce(
    (acc, c) => acc + c.healthChecks.filter((hc) => hc.isActive).length,
    0
  );

  const connectionUsagePercentage =
    (limits.currentConnections / limits.maxConnections) * 100;
  const healthCheckUsagePercentage =
    (limits.currentHealthChecks / limits.maxHealthChecks) * 100;

  const overviewStats = [
    {
      title: "Total Connections",
      value: connections.length,
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900",
      description: `${activeConnections} active`,
    },
    {
      title: "Health Checks",
      value: totalHealthChecks,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
      description: `${activeHealthChecks} active`,
    },
    {
      title: "Success Rate",
      value: "98.5%",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900",
      description: "Last 24 hours",
    },
    {
      title: "Avg Response",
      value: "245ms",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900",
      description: "Last 24 hours",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
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

      {/* Plan Limits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connections Limit */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Connections
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {limits.currentConnections} / {limits.maxConnections}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress value={connectionUsagePercentage} className="h-2" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {limits.maxConnections - limits.currentConnections} remaining
                </span>
                {!limits.canCreateConnection && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Limit reached
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Checks Limit */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Health Checks
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {limits.currentHealthChecks} / {limits.maxHealthChecks}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress value={healthCheckUsagePercentage} className="h-2" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {limits.maxHealthChecks - limits.currentHealthChecks}{" "}
                  remaining
                </span>
                {!limits.canCreateHealthCheck && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Limit reached
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connection Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Active Connections
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {activeConnections}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Inactive Connections
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {connections.length - activeConnections}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Total Health Checks
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalHealthChecks}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
