import ConnectionsHeader from "@/components/features/connections/ConnectionsHeader";
import ConnectionsOverview from "@/components/features/connections/ConnectionsOverview";
import ConnectionsList from "@/components/features/connections/ConnectionsList";
import { getConnectionService } from "@/lib/infrastructure/di";
import { serializeConnectionWithHealthChecks } from "@/lib/core/serializers";

export const revalidate = 600; // 10 minutes

export default async function ConnectionsPage() {
  const connectionService = getConnectionService();
  const data = await connectionService.getConnections();
  const { connections, user, limits } = data;

  if (!user || !limits) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Unable to load connections data.
          </p>
        </div>
      </div>
    );
  }

  // Serialize connections for client components
  const serializedConnections = connections.map(
    serializeConnectionWithHealthChecks
  );

  return (
    <div className="space-y-8">
      <ConnectionsHeader
        userSubscription={user.subscription}
        canCreateConnection={limits.canCreateConnection}
      />

      <ConnectionsOverview connections={connections} limits={limits} />

      <ConnectionsList connections={serializedConnections} />
    </div>
  );
}
