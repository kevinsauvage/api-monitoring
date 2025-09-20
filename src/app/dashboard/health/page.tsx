import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/infrastructure/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import HealthCheckResultsTable from "./components/HealthCheckResultsTable";
import RefreshHealthButton from "@/components/features/health-checks/RefreshHealthButton";
import { serializeCheckResultsWithDetails } from "@/lib/core/serializers";
import { CheckResultRepository } from "@/lib/core/repositories";

export const revalidate = 180; // 3 minutes

export default async function HealthPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  const checkResultRepository = new CheckResultRepository();

  const recentResults = await checkResultRepository.findByUserIdWithDetails(
    session.user.id,
    50
  );

  const serializedResults = serializeCheckResultsWithDetails(recentResults);

  const totalChecks = serializedResults.length;
  const successfulChecks = serializedResults.filter(
    (r) => r.status === "SUCCESS"
  ).length;
  const failedChecks = serializedResults.filter(
    (r) => r.status === "FAILURE" || r.status === "ERROR"
  ).length;
  const timeoutChecks = serializedResults.filter(
    (r) => r.status === "TIMEOUT"
  ).length;

  const successRate =
    totalChecks > 0 ? Math.round((successfulChecks / totalChecks) * 100) : 0;
  const avgResponseTime =
    totalChecks > 0
      ? Math.round(
          serializedResults.reduce((sum, r) => sum + r.responseTime, 0) /
            totalChecks
        )
      : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Health Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor your API endpoints and track their performance
          </p>
        </div>
        <RefreshHealthButton />
      </div>

      {totalChecks > 0 && (
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

          <Card className="border-red-200/50 dark:border-red-800/50 hover:border-red-300 dark:hover:border-red-700 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Failed Checks
                  </p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {failedChecks}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Heart className="h-4 w-4 mr-1" />
                  {timeoutChecks} timeouts
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
                  <Badge variant="outline" className="text-xs">
                    Last 50 results
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Health Check Results */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Health Check Results
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {serializedResults.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                <Activity className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Health Check Results
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You haven&apos;t set up any health checks yet. Create your first
                health check to start monitoring your API endpoints.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Badge variant="secondary" className="px-4 py-2">
                  <Heart className="w-4 h-4 mr-2" />
                  Set up monitoring
                </Badge>
                <Badge variant="outline" className="px-4 py-2">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Track performance
                </Badge>
              </div>
            </div>
          ) : (
            <div className="px-6 pb-6">
              <HealthCheckResultsTable results={serializedResults} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
