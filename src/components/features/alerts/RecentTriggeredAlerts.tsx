import { AlertTriangle, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AlertWithHistory } from "@/lib/core/types";
import {
  getAlertTypeLabel,
  getAlertTypeIcon,
  getAlertSeverityColor,
  getAlertSeverityLabel,
  getUnresolvedHistoryCount,
  getLatestHistoryEntry,
} from "@/lib/shared/utils/alert-utils";

interface RecentTriggeredAlertsProps {
  alerts: AlertWithHistory[];
}

export default function RecentTriggeredAlerts({
  alerts,
}: RecentTriggeredAlertsProps) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>Recent Triggered Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-300">
              No triggered alerts in the recent period
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span>Recent Triggered Alerts</span>
          <Badge variant="secondary" className="ml-2">
            {alerts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => {
            const latestEntry = getLatestHistoryEntry(alert);
            const unresolvedCount = getUnresolvedHistoryCount(alert);

            return (
              <div
                key={alert.id}
                className="flex items-start space-x-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <span className="text-lg">
                    {getAlertTypeIcon(alert.type)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      {getAlertTypeLabel(alert.type)} Alert
                    </h4>
                    {latestEntry && (
                      <Badge
                        className={getAlertSeverityColor(latestEntry.severity)}
                      >
                        {getAlertSeverityLabel(latestEntry.severity)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    {alert.apiConnection?.name ?? "Global Alert"}
                  </p>
                  {latestEntry && (
                    <div className="mt-2">
                      <p className="text-sm text-slate-700 dark:text-slate-200">
                        {latestEntry.message}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(latestEntry.timestamp).toLocaleString()}
                        </span>
                        {unresolvedCount > 0 && (
                          <Badge
                            variant="outline"
                            className="text-red-600 border-red-200"
                          >
                            {unresolvedCount} unresolved
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
