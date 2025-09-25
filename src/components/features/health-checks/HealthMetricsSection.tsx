import { Activity, CheckCircle, Clock, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface HealthMetricsSectionProps {
  totalChecks: number;
  successfulChecks: number;
  successRate: number;
  avgResponseTime: number;
}

export default function HealthMetricsSection({
  totalChecks,
  successfulChecks,
  successRate,
  avgResponseTime,
}: HealthMetricsSectionProps) {
  if (totalChecks === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-emerald-200/50 dark:border-emerald-800/50 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Success Rate
              </p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {successRate}%
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 mr-1" />
              {successfulChecks} successful checks
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200/50 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Avg Response Time
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {avgResponseTime}ms
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Activity className="h-4 w-4 mr-1" />
              {totalChecks} total checks
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200/50 dark:border-orange-800/50 hover:border-orange-300 dark:hover:border-orange-700 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Recent Failures
              </p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {totalChecks - successfulChecks}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
              <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 mr-1" />
              Failed checks
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-violet-200/50 dark:border-violet-800/50 hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Checks
              </p>
              <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                {totalChecks}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-violet-50 dark:bg-violet-950 flex items-center justify-center">
              <Activity className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Activity className="h-4 w-4 mr-1" />
              All time
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
