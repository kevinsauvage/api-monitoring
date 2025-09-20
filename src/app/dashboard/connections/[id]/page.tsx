import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HealthCheckResultsTable from "@/components/features/health-checks/HealthCheckResultsTable";
import ConnectionHeader from "@/components/features/connections/ConnectionHeader";
import ConnectionMetrics from "@/components/features/connections/ConnectionMetrics";
import ConnectionResponseTimeChart from "@/components/features/connections/ConnectionResponseTimeChart";
import ConnectionSuccessRateChart from "@/components/features/connections/ConnectionSuccessRateChart";
import ConnectionUptimeChart from "@/components/features/connections/ConnectionUptimeChart";
import ConnectionDetailsCard from "@/components/features/connections/ConnectionDetailsCard";
import {
  getConnectionService,
  getCheckResultRepository,
} from "@/lib/infrastructure/di";
import {
  getResponseTimeData,
  getStatusData,
  getUptimeData,
} from "@/lib/shared/utils/check-result-utils";
import { serializeCheckResultsWithDetails } from "@/lib/core/serializers";
import { notFound } from "next/navigation";

export const revalidate = 300; // 5 minutes

export default async function ConnectionOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const parameters = await params;
  const connectionService = getConnectionService();
  const connection = await connectionService.getConnectionById(parameters.id);

  if (!connection) {
    return notFound();
  }

  const checkResultRepository = getCheckResultRepository();
  const recentResults = await checkResultRepository.findByConnectionId(
    parameters.id,
    50
  );

  const responseTimeData = getResponseTimeData(recentResults);
  const statusData = getStatusData(recentResults);
  const uptimeData = getUptimeData(recentResults);
  const serializedResults = serializeCheckResultsWithDetails(recentResults);

  return (
    <div className="space-y-8">
      <ConnectionHeader connection={connection} />

      <ConnectionMetrics
        connection={connection}
        recentResults={recentResults}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConnectionResponseTimeChart
          data={responseTimeData}
          connectionName={connection.name}
        />
        <ConnectionSuccessRateChart
          data={statusData}
          connectionName={connection.name}
        />
      </div>

      <ConnectionUptimeChart
        data={uptimeData}
        connectionName={connection.name}
      />

      <ConnectionDetailsCard connection={connection} />

      {serializedResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Health Check Results</CardTitle>
          </CardHeader>
          <CardContent>
            <HealthCheckResultsTable results={serializedResults} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
