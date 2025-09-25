import { getServerSession } from "next-auth";

import NewAlertClient from "@/components/features/alerts/NewAlertClient";
import NewAlertHeader from "@/components/features/alerts/NewAlertHeader";
import { authOptions } from "@/lib/infrastructure/auth";
import { getConnectionService } from "@/lib/infrastructure/di";

import type { Session } from "next-auth";

export const revalidate = 600; // 10 minutes

export default async function NewAlertPage() {
  const session = (await getServerSession(authOptions)) as Session;
  const connectionService = getConnectionService();
  const connectionData = await connectionService.getConnectionsForUser(
    session.user.id
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <NewAlertHeader />
      <NewAlertClient apiConnections={connectionData.connections} />
    </div>
  );
}
