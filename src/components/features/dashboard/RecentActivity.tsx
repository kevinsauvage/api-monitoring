import { CheckCircle, XCircle, Clock, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SerializedCheckResultWithDetails } from "@/lib/core/serializers";

interface RecentActivityProps {
  recentResults: SerializedCheckResultWithDetails[];
}

export default function RecentActivity({ recentResults }: RecentActivityProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400";
      case "FAILURE":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400";
      case "TIMEOUT":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400";
      case "ERROR":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400";
      default:
        return "text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="w-4 h-4" />;
      case "FAILURE":
      case "ERROR":
        return <XCircle className="w-4 h-4" />;
      case "TIMEOUT":
        return <Clock className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
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
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {recentResults.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No recent activity
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Health checks will appear here once you start monitoring your
              APIs.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentResults.map((result) => (
              <div
                key={result.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">
                    {getProviderIcon(
                      result.healthCheck?.apiConnection?.provider ?? "unknown"
                    )}
                  </span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          result.status === "SUCCESS"
                            ? "default"
                            : "destructive"
                        }
                        className={getStatusColor(result.status)}
                      >
                        {getStatusIcon(result.status)}
                        <span className="ml-1">{result.status}</span>
                      </Badge>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {result.healthCheck?.apiConnection?.name ??
                          "Unknown Connection"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {result.responseTime}ms
                      </span>
                      {result.statusCode && (
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {result.statusCode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {new Date(result.timestamp).toLocaleString("us-Us", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
