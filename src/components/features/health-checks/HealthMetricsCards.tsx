import {
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function HealthMetricsCards({
  totalHealthChecks,
  activeHealthChecks,
  successRate,
  averageResponseTime,
  totalChecks,
  recentFailures,
}: {
  totalHealthChecks: number;
  activeHealthChecks: number;
  successRate: number;
  averageResponseTime: number;
  totalChecks: number;
  recentFailures: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Health Checks */}
      <Card className="border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Health Checks
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {totalHealthChecks}
              </p>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  <Activity className="w-3 h-3 mr-1" />
                  {activeHealthChecks} active
                </Badge>
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
              <Activity className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Rate */}
      <Card className="border-emerald-200/50 dark:border-emerald-700/50 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Success Rate
              </p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {successRate.toFixed(1)}%
              </p>
              <div className="mt-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Last 24 hours
                </div>
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Response Time */}
      <Card className="border-blue-200/50 dark:border-blue-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Avg Response Time
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(averageResponseTime)}ms
              </p>
              <div className="mt-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {totalChecks} total checks
                </div>
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Failures */}
      <Card className="border-red-200/50 dark:border-red-700/50 hover:border-red-300 dark:hover:border-red-600 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Recent Failures
              </p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {recentFailures}
              </p>
              <div className="mt-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Last 24 hours
                </div>
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
