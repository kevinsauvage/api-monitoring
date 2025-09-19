import { getConnectionService } from "@/lib/infrastructure/di";
import CreateHealthCheckForm from "../components/CreateHealthCheckForm";

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
