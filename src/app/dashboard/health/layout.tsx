import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/infrastructure/auth";
import { getMonitoringService } from "@/lib/infrastructure/di";
import HealthLayoutHeader from "@/components/features/health-checks/HealthLayoutHeader";
import HealthMetricsCards from "@/components/features/health-checks/HealthMetricsCards";
import HealthNavigation from "./components/HealthNavigation";
import {
  CheckResultRepository,
  HealthCheckRepository,
} from "@/lib/core/repositories";

export default async function HealthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = (await getServerSession(authOptions)) as Session;

  const monitoringService = getMonitoringService();
  const monitoringStats = await monitoringService.getDashboardData(
    session.user.id
  );

  const healthCheckRepository = new HealthCheckRepository();
  const checkResultRepository = new CheckResultRepository();

  const totalHealthChecks = await healthCheckRepository.countByUserId(
    session.user.id
  );

  const activeHealthChecks = await healthCheckRepository.countActiveByUserId(
    session.user.id
  );

  const recentResults = await checkResultRepository.findByUserIdWithDetails(
    session.user.id,
    50
  );

  const dashboardData = {
    totalHealthChecks,
    activeHealthChecks,
    ...monitoringStats,
    recentResults,
  };

  return (
    <div className="space-y-8">
      <HealthLayoutHeader
        title="Health Monitoring"
        description="Monitor the health and performance of all your API endpoints"
      />
      <HealthMetricsCards
        totalHealthChecks={dashboardData.totalHealthChecks}
        activeHealthChecks={dashboardData.activeHealthChecks}
        successRate={dashboardData.successRate}
        averageResponseTime={dashboardData.averageResponseTime}
        totalChecks={dashboardData.totalChecks}
        recentFailures={dashboardData.recentFailures}
      />
      <HealthNavigation />
      {children}
    </div>
  );
}
