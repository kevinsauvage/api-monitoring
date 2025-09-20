import { getConnectionService } from "@/lib/infrastructure/di";
import CreateHealthCheckForm from "@/components/features/health-checks/CreateHealthCheckForm";

// Enable route-level caching for new health check page
export const revalidate = 600; // 10 minutes

export default async function NewHealthCheckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const parameters = await params;
  const connectionService = getConnectionService();
  const connection = await connectionService.getConnectionById(parameters.id);

  if (!connection) {
    return null; // Layout handles the not found case
  }

  return (
    <div className="space-y-6">
      <CreateHealthCheckForm apiConnectionId={parameters.id} />
    </div>
  );
}
