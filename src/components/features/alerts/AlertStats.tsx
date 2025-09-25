import { Bell, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { AlertStats } from "@/lib/core/types";

interface AlertStatsProps {
  stats: AlertStats;
}

export default function AlertStats({ stats }: AlertStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Total Alerts
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.totalAlerts}
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
                Active Alerts
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.activeAlerts}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Triggered Alerts
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.triggeredAlerts}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
              <XCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Resolved Alerts
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.resolvedAlerts}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
