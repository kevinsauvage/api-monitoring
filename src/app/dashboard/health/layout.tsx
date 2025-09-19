import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/infrastructure/auth";
import { redirect } from "next/navigation";
import { getMonitoringService } from "@/lib/infrastructure/di";
import HealthNavigation from "./components/HealthNavigation";

export default async function HealthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const monitoringService = getMonitoringService();
  const monitoringStats = await monitoringService.getDashboardData(
    session.user.id
  );

  // Get additional data needed for the dashboard
  const { HealthCheckRepository, CheckResultRepository } = await import(
    "@/lib/core/repositories"
  );
  const healthCheckRepository = new HealthCheckRepository();
  const checkResultRepository = new CheckResultRepository();

  const totalHealthChecks = await healthCheckRepository.countByUserId(
    session.user.id
  );

  // Get active health checks count
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Health Monitoring
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mt-1">
          Monitor the health and performance of all your API endpoints
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Total Health Checks
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {dashboardData.totalHealthChecks}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {dashboardData.activeHealthChecks} active
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Success Rate
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {dashboardData.successRate.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Last 24 hours
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Avg Response Time
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {Math.round(dashboardData.averageResponseTime)}ms
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {dashboardData.totalChecks} total checks
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Recent Failures
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {dashboardData.recentFailures}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Last 24 hours
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <HealthNavigation />

      {/* Page Content */}
      {children}
    </div>
  );
}
