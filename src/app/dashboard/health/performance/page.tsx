import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

export default async function PerformancePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return null;
  }

  // Get recent results
  const { CheckResultRepository } = await import("@/lib/repositories");
  const checkResultRepository = new CheckResultRepository();

  const recentResults = await checkResultRepository.findByUserIdWithDetails(
    session.user.id,
    50
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Performance Metrics
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Response time distribution and status breakdown
        </p>
      </div>

      {/* Performance Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Response Time Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Fast (&lt; 500ms)
                </span>
                <span className="text-sm font-medium">
                  {recentResults.filter((r) => r.responseTime < 500).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Medium (500ms - 2s)
                </span>
                <span className="text-sm font-medium">
                  {
                    recentResults.filter(
                      (r) => r.responseTime >= 500 && r.responseTime < 2000
                    ).length
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Slow (&gt; 2s)
                </span>
                <span className="text-sm font-medium">
                  {recentResults.filter((r) => r.responseTime >= 2000).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    Success
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {recentResults.filter((r) => r.status === "SUCCESS").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    Failure
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {recentResults.filter((r) => r.status === "FAILURE").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    Timeout
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {recentResults.filter((r) => r.status === "TIMEOUT").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    Error
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {recentResults.filter((r) => r.status === "ERROR").length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Average Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {Math.round(
                recentResults.reduce((acc, r) => acc + r.responseTime, 0) /
                  recentResults.length || 0
              )}
              ms
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Across all checks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fastest Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.min(...recentResults.map((r) => r.responseTime))}ms
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Best performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Slowest Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {Math.max(...recentResults.map((r) => r.responseTime))}ms
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Needs attention
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
