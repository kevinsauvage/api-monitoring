import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";
import HealthCheckResultsTable from "./components/HealthCheckResultsTable";
import RefreshHealthButton from "../connections/[id]/health-checks/components/RefreshHealthButton";
import { serializeCheckResultsWithDetails } from "@/lib/serializers";

export default async function HealthPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  const { CheckResultRepository } = await import("@/lib/repositories");
  const checkResultRepository = new CheckResultRepository();

  const recentResults = await checkResultRepository.findByUserIdWithDetails(
    session.user.id,
    50
  );

  const serializedResults = serializeCheckResultsWithDetails(recentResults);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Activity
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Latest health check results from all your endpoints
          </p>
        </div>
        <RefreshHealthButton />
      </div>

      <Card>
        <CardContent className="p-6">
          {serializedResults.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-300">
                No health check results yet. Create some health checks to start
                monitoring.
              </p>
            </div>
          ) : (
            <HealthCheckResultsTable results={serializedResults} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
