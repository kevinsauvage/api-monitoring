import { getServerSession } from "next-auth";

import DashboardStats from "@/components/features/dashboard/DashboardStats";
import EmptyDashboardState from "@/components/features/dashboard/EmptyDashboardState";
import PerformanceMetrics from "@/components/features/dashboard/PerformanceMetrics";
import RecentActivity from "@/components/features/dashboard/RecentActivity";
import ResponseTimeChart from "@/components/shared/charts/ResponseTimeChart";
import SuccessRateChart from "@/components/shared/charts/SuccessRateChart";
import UptimeChart from "@/components/shared/charts/UptimeChart";
import { serializeCheckResultsWithDetails } from "@/lib/core/serializers";
import { authOptions } from "@/lib/infrastructure/auth";
import { getDashboardService } from "@/lib/infrastructure/di";
import {
  getStatusData,
  getUptimeData,
} from "@/lib/shared/utils/check-result-utils";

import type { Session } from "next-auth";

export const revalidate = 300; // 5 minutes

export default async function Dashboard() {
  const session = (await getServerSession(authOptions)) as Session;

  const dashboardService = getDashboardService();
  const stats = await dashboardService.getDashboardStats(session.user.id);
  const hasConnections = stats.totalConnections > 0;

  if (!hasConnections) {
    return <EmptyDashboardState />;
  }

  const statusData = getStatusData(stats.recentResults);
  const uptimeData = getUptimeData(stats.recentResults);
  const serializedRecentResults = serializeCheckResultsWithDetails(
    stats.recentResults
  );

  return (
    <div className="space-y-8">
      <PerformanceMetrics
        averageResponseTime={stats.monitoringStats.averageResponseTime}
        successRate={stats.monitoringStats.successRate}
        totalChecks={stats.monitoringStats.totalChecks}
        uptime={statusData.find((s) => s.status === "SUCCESS")?.percentage ?? 0}
      />

      <DashboardStats
        totalConnections={stats.totalConnections}
        activeConnections={stats.activeConnections}
        totalHealthChecks={stats.totalHealthChecks}
        monitoringStats={stats.monitoringStats}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResponseTimeChart data={serializedRecentResults} />
        <SuccessRateChart data={statusData} />
      </div>

      <UptimeChart data={uptimeData} />

      <RecentActivity recentResults={serializedRecentResults} />
    </div>
  );
}
