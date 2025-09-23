import { CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardStats({
  totalConnections,
  activeConnections,
  totalHealthChecks,
  monitoringStats,
}: {
  totalConnections: number;
  activeConnections: number;
  totalHealthChecks: number;
  monitoringStats?: {
    totalChecks: number;
    successRate: number;
    averageResponseTime: number;
    recentFailures: number;
  } | null;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Total Connections
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {totalConnections}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Active Connections
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {activeConnections}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Health Checks
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {totalHealthChecks}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {monitoringStats && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {monitoringStats.successRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
