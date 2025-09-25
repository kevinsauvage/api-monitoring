import { getServerSession } from "next-auth";

import AlertsPageHeader from "@/components/features/alerts/AlertsPageHeader";
import AlertsSection from "@/components/features/alerts/AlertsSection";
import AlertStats from "@/components/features/alerts/AlertStats";
import EmptyAlertsState from "@/components/features/alerts/EmptyAlertsState";
import RecentTriggeredAlerts from "@/components/features/alerts/RecentTriggeredAlerts";
import { authOptions } from "@/lib/infrastructure/auth";
import { getAlertService, getConnectionService } from "@/lib/infrastructure/di";

import type { Session } from "next-auth";

export const revalidate = 300; // 5 minutes

export default async function AlertsPage() {
  const session = (await getServerSession(authOptions)) as Session;
  const alertService = getAlertService();
  const connectionService = getConnectionService();

  const [dashboardData, connectionData] = await Promise.all([
    alertService.getAlertDashboardData(session.user.id),
    connectionService.getConnectionsForUser(session.user.id),
  ]);

  const hasAlerts = dashboardData.alerts.length > 0;

  return (
    <div className="space-y-8">
      <AlertsPageHeader
        title="Alert Dashboard"
        description="Monitor and manage your API alerts and notifications"
      />

      {hasAlerts && <AlertStats stats={dashboardData.stats} />}

      {hasAlerts ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AlertsSection
              alerts={dashboardData.alerts}
              apiConnections={connectionData.connections}
            />
          </div>

          <div className="space-y-6">
            <RecentTriggeredAlerts alerts={dashboardData.recentTriggered} />
          </div>
        </div>
      ) : (
        <EmptyAlertsState />
      )}
    </div>
  );
}
