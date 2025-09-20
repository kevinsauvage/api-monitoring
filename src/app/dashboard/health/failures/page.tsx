import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/infrastructure/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { formatTimestamp, formatResponseTime } from "@/lib/shared/utils/utils";
import { CheckResultRepository } from "@/lib/core/repositories";

export const revalidate = 120; // 2 minutes

export default async function FailuresPage() {
  const session = (await getServerSession(authOptions)) as Session;

  const checkResultRepository = new CheckResultRepository();
  const recentResults = await checkResultRepository.findByUserIdWithDetails(
    session.user.id,
    50
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "FAILURE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "TIMEOUT":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "ERROR":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
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
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const failureResults = recentResults.filter((r) => r.status !== "SUCCESS");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Recent Failures
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Health check failures and errors from your endpoints
        </p>
      </div>

      {/* Failures Content */}
      <Card>
        <CardHeader>
          <CardTitle>Failure Details</CardTitle>
        </CardHeader>
        <CardContent>
          {failureResults.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-300">
                No failures in recent health checks. Great job!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {failureResults.slice(0, 20).map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(result.status)}
                      <Badge
                        variant="outline"
                        className={getStatusColor(result.status)}
                      >
                        {result.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {result.healthCheck.method}{" "}
                        {result.healthCheck.endpoint}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {result.healthCheck.apiConnection.name} (
                        {result.healthCheck.apiConnection.provider})
                      </p>
                      {result.errorMessage && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          {result.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {formatResponseTime(result.responseTime)}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {formatTimestamp(result.timestamp)}
                    </p>
                    {result.statusCode && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Status: {result.statusCode}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
