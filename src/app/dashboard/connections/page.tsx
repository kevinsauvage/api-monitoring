import ConnectionsOverview from "@/components/features/connections/ConnectionsOverview";
import ConnectionsPageHeader from "@/components/features/connections/ConnectionsPageHeader";
import ConnectionsSection from "@/components/features/connections/ConnectionsSection";
import EmptyConnectionsState from "@/components/features/connections/EmptyConnectionsState";
import { serializeConnectionWithHealthChecksAndResults } from "@/lib/core/serializers";
import {
  getConnectionService,
  getCheckResultRepository,
} from "@/lib/infrastructure/di";

export const revalidate = 600; // 10 minutes

export default async function ConnectionsPage() {
  const connectionService = getConnectionService();
  const checkResultRepository = getCheckResultRepository();
  const data = await connectionService.getConnections();
  const { connections, user, limits } = data;

  if (!user) {
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

  // Fetch recent results for each connection to calculate metrics
  const connectionsWithResults = await Promise.all(
    connections.map(async (connection) => {
      const recentResults = await checkResultRepository.findByConnectionId(
        connection.id,
        10 // Get last 10 results for metrics calculation
      );
      return {
        ...connection,
        recentResults,
      };
    })
  );

  const serializedConnections = connectionsWithResults.map(
    serializeConnectionWithHealthChecksAndResults
  );

  const hasConnections = connections.length > 0;
  console.log("🚀 ~ ConnectionsPage ~ connections:", connections);

  return (
    <div className="space-y-8">
      <ConnectionsPageHeader
        userSubscription={user.subscription}
        canCreateConnection={limits.canCreateConnection}
      />

      {hasConnections && (
        <ConnectionsOverview connections={connections} limits={limits} />
      )}

      {hasConnections ? (
        <ConnectionsSection connections={serializedConnections} />
      ) : (
        <EmptyConnectionsState />
      )}
    </div>
  );
}
