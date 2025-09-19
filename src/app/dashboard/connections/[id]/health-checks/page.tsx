import {
  getConnectionService,
  getHealthCheckService,
} from "@/lib/infrastructure/di";
import HealthChecksHeader from "@/components/features/health-checks/HealthChecksHeader";
import HealthChecksOverview from "@/components/features/health-checks/HealthChecksOverview";
import HealthChecksList from "@/components/features/health-checks/HealthChecksList";

export default async function ConnectionHealthChecksPage({
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

  const { healthChecks } =
    await healthCheckService.getHealthChecksWithResultsForConnection(
      parameters.id
    );

  return (
    <div className="space-y-8">
      <HealthChecksHeader
        connectionProvider={connection.provider}
        connectionId={parameters.id}
      />

      <HealthChecksOverview healthChecks={healthChecks} />

      <HealthChecksList
        healthChecks={healthChecks}
        connectionName={connection.name}
        connectionId={parameters.id}
      />
    </div>
  );
}
