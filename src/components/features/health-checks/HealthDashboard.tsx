import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import RefreshHealthButton from "@/components/features/health-checks/RefreshHealthButton";
import HealthCheckResultsTable from "@/components/features/health-checks/HealthCheckResultsTable";
import { StatusBadge, MethodBadge } from "@/components/shared";
import {
  formatTimestamp,
  formatResponseTime,
  getStatusIcon,
  getUptimeColor,
  getResponseTimeColor,
} from "@/lib/shared/utils";
import type { CheckResultWithDetails } from "@/lib/core/repositories";
import { serializeCheckResultsWithDetails } from "@/lib/core/serializers";

interface DashboardData {
  totalHealthChecks: number;
  activeHealthChecks: number;
  totalChecks: number;
  successRate: number;
  averageResponseTime: number;
  recentFailures: number;
  recentResults: CheckResultWithDetails[];
}

interface HealthDashboardProps {
  dashboardData: DashboardData;
}

export default function HealthDashboard({
  dashboardData,
}: HealthDashboardProps) {
  const {
    totalHealthChecks,
    activeHealthChecks,
    totalChecks,
    successRate,
    averageResponseTime,
    recentFailures,
    recentResults,
  } = dashboardData;

  const serializedResults = serializeCheckResultsWithDetails(recentResults);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Health Overview
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Last updated: {formatTimestamp(new Date())}
          </p>
        </div>
        <RefreshHealthButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Health Checks
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHealthChecks}</div>
            <p className="text-xs text-muted-foreground">
              {activeHealthChecks} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getUptimeColor(successRate)}`}
            >
              {successRate.toFixed(1)}%
            </div>
            <Progress value={successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Response Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getResponseTimeColor(
                averageResponseTime
              )}`}
            >
              {formatResponseTime(averageResponseTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalChecks} total checks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Failures
            </CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {recentFailures}
            </div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="failures">Failures</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardContent>
              {recentResults.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-300">
                    No health check results yet. Create some health checks to
                    start monitoring.
                  </p>
                </div>
              ) : (
                <HealthCheckResultsTable results={serializedResults} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Failures</CardTitle>
            </CardHeader>
            <CardContent>
              {recentResults.filter((r) => r.status !== "SUCCESS").length ===
              0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-300">
                    No failures in recent health checks. Great job!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentResults
                    .filter((r) => r.status !== "SUCCESS")
                    .slice(0, 10)
                    .map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(result.status)}
                            <StatusBadge
                              status={result.status}
                              variant="extended"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <MethodBadge method={result.healthCheck.method} />
                              <span className="font-medium text-slate-900 dark:text-white">
                                {result.healthCheck.endpoint}
                              </span>
                            </div>
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
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
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
                      {
                        recentResults.filter((r) => r.responseTime >= 2000)
                          .length
                      }
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
                      {
                        recentResults.filter((r) => r.status === "SUCCESS")
                          .length
                      }
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
                      {
                        recentResults.filter((r) => r.status === "FAILURE")
                          .length
                      }
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
                      {
                        recentResults.filter((r) => r.status === "TIMEOUT")
                          .length
                      }
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
