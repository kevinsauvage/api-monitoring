import { notFound } from "next/navigation";

import EmptyHealthChecksState from "@/components/features/health-checks/EmptyHealthChecksState";
import HealthChecksHeader from "@/components/features/health-checks/HealthChecksHeader";
import HealthChecksOverview from "@/components/features/health-checks/HealthChecksOverview";
import HealthChecksSection from "@/components/features/health-checks/HealthChecksSection";
import {
  getConnectionService,
  getHealthCheckService,
} from "@/lib/infrastructure/di";

export const revalidate = 300; // 5 minutes

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
    return notFound();
  }

  const { healthChecks } =
    await healthCheckService.getHealthChecksWithResultsForConnection(
      parameters.id
    );

  const hasHealthChecks = healthChecks.length > 0;

  return (
    <div className="space-y-8">
      {hasHealthChecks ? (
        <>
          <HealthChecksHeader
            connectionProvider={connection.provider}
            connectionId={parameters.id}
          />
          <HealthChecksOverview healthChecks={healthChecks} />
          <HealthChecksSection
            healthChecks={healthChecks}
            connectionName={connection.name}
            connectionId={parameters.id}
          />
        </>
      ) : (
        <EmptyHealthChecksState
          connectionName={connection.name}
          connectionId={parameters.id}
        />
      )}
    </div>
  );
}
