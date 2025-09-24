import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import { getCostAnalytics, getCostMetrics } from "@/actions";
import CostAnalyticsDashboard from "@/components/features/cost/CostAnalyticsDashboard";
import { authOptions } from "@/lib/infrastructure/auth";

export const revalidate = 300; // 5 minutes

export default async function CostAnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const [costAnalyticsResult, costMetricsResult] = await Promise.all([
    getCostAnalytics({}),
    getCostMetrics({}),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cost Analytics</h1>
        <p className="text-muted-foreground">
          Monitor and analyze your API spending across all providers
        </p>
      </div>

      <CostAnalyticsDashboard
        costAnalytics={
          costAnalyticsResult.data ?? {
            totalCost: 0,
            averageCost: 0,
            costByProvider: [],
            costByPeriod: [],
            costTrend: [],
          }
        }
        costMetrics={costMetricsResult.data ?? []}
      />
    </div>
  );
}
