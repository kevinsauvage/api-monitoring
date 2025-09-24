import { notFound } from "next/navigation";

import CreateHealthCheckForm from "@/components/features/health-checks/CreateHealthCheckForm";
import { getConnectionService } from "@/lib/infrastructure/di";

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
    return notFound();
  }

  return (
    <div className="space-y-6">
      <CreateHealthCheckForm apiConnectionId={parameters.id} />
    </div>
  );
}
