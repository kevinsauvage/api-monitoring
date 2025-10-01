import { notFound } from "next/navigation";

import { History } from "lucide-react";

import HealthCheckResultsTable from "@/components/features/health-checks/HealthCheckResultsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { serializeCheckResultsWithDetails } from "@/lib/core/serializers";
import {
  getConnectionService,
  getHealthCheckService,
} from "@/lib/infrastructure/di";

export const revalidate = 300; // 5 minutes

export default async function ConnectionHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const parameters = await params;
  const connectionService = getConnectionService();
  const healthCheckService = getHealthCheckService();

  const connection = await connectionService.getConnectionById(parameters.id);

  if (!connection) {
    return notFound();
  }

  const recentResults = await healthCheckService.getConnectionHistory(
    parameters.id,
    100
  );

  const serializedResults = serializeCheckResultsWithDetails(recentResults);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Check History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentResults.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No history yet
            </h3>
            <p className="text-muted-foreground">
              Health check results will appear here once monitoring begins.
            </p>
          </div>
        ) : (
          <HealthCheckResultsTable results={serializedResults} />
        )}
      </CardContent>
    </Card>
  );
}
