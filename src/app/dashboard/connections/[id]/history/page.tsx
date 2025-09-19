import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";
import { getConnectionService, getHealthCheckService } from "@/lib/infrastructure/di";
import HealthCheckResultsTable from "../../../health/components/HealthCheckResultsTable";
import { serializeCheckResultsWithDetails } from "@/lib/core/serializers";

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
    return null; // Layout handles the not found case
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
