import DashboardStats from "./components/DashboardStats";
import RecentActivity from "./components/RecentActivity";
import PerformanceMetrics from "./components/PerformanceMetrics";
import ResponseTimeChart from "./components/ResponseTimeChart";
import SuccessRateChart from "./components/SuccessRateChart";
import UptimeChart from "./components/UptimeChart";
import { getDashboardService } from "@/lib/infrastructure/di";
import {
  getStatusData,
  getUptimeData,
} from "@/lib/shared/utils/check-result-utils";
import { authOptions } from "@/lib/infrastructure/auth";
import { getServerSession } from "next-auth";
import { serializeCheckResultsWithDetails } from "@/lib/core/serializers";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }

  const dashboardService = getDashboardService();
  const stats = await dashboardService.getDashboardStats(session.user.id);
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
