import { Activity, Heart } from "lucide-react";
import { getServerSession } from "next-auth";

import EmptyHealthState from "@/components/features/health-checks/EmptyHealthState";
import HealthCheckResultsTable from "@/components/features/health-checks/HealthCheckResultsTable";
import HealthMetricsSection from "@/components/features/health-checks/HealthMetricsSection";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckResultRepository } from "@/lib/core/repositories";
import { serializeCheckResultsWithDetails } from "@/lib/core/serializers";
import { authOptions } from "@/lib/infrastructure/auth";

import type { Session } from "next-auth";

export const revalidate = 180; // 3 minutes

export default async function HealthPage() {
  const session = (await getServerSession(authOptions)) as Session;

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

  const successRate =
    totalChecks > 0 ? Math.round((successfulChecks / totalChecks) * 100) : 0;
  const avgResponseTime =
    totalChecks > 0
      ? Math.round(
          serializedResults.reduce((sum, r) => sum + r.responseTime, 0) /
            totalChecks
        )
      : 0;

  const hasHealthChecks = totalChecks > 0;

  return (
    <div className="space-y-8">
      {hasHealthChecks ? (
        <>
          <HealthMetricsSection
            totalChecks={totalChecks}
            successfulChecks={successfulChecks}
            successRate={successRate}
            avgResponseTime={avgResponseTime}
          />
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
                    You haven&apos;t set up any health checks yet. Create your
                    first health check to start monitoring your API endpoints.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Badge variant="secondary" className="px-4 py-2">
                      <Heart className="w-4 h-4 mr-2" />
                      Set up monitoring
                    </Badge>
                    <Badge variant="outline" className="px-4 py-2">
                      <Activity className="w-4 h-4 mr-2" />
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
        </>
      ) : (
        <EmptyHealthState />
      )}
    </div>
  );
}
