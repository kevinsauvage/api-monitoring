import Link from "next/link";

import { Plus, Heart, Activity, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EmptyHealthChecksStateProps {
  connectionName: string;
  connectionId: string;
}

export default function EmptyHealthChecksState({
  connectionName,
  connectionId,
}: EmptyHealthChecksStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 mb-6">
          <Heart className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>

        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
          No Health Checks for {connectionName}
        </h3>

        <p className="text-slate-600 dark:text-slate-300 mb-8">
          Start monitoring your API endpoints by creating health checks. Track
          response times, success rates, and get notified when issues occur.
        </p>

        <div className="space-y-4">
          <Button asChild size="lg" className="gap-2">
            <Link
              href={`/dashboard/connections/${connectionId}/health-checks/new`}
            >
              <Plus className="h-4 w-4" />
              Create Your First Health Check
            </Link>
          </Button>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <Card className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-sm">Monitor Endpoints</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Track API endpoint health
              </p>
            </Card>

            <Card className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium text-sm">Real-time Monitoring</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Continuous health tracking
              </p>
            </Card>

            <Card className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <h4 className="font-medium text-sm">Instant Alerts</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Get notified of issues
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
