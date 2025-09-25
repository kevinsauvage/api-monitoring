import Link from "next/link";

import { Plus, Zap, Shield, Activity } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function EmptyConnectionsState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 mb-6">
          <Zap className="h-12 w-12 text-blue-600 dark:text-blue-400" />
        </div>

        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
          No API Connections
        </h3>

        <p className="text-slate-600 dark:text-slate-300 mb-8">
          Connect your APIs to start monitoring their health and performance.
          Set up health checks, track response times, and get alerts when issues
          occur.
        </p>

        <div className="space-y-4">
          <Button asChild size="lg" className="gap-2">
            <Link href="/dashboard/connections/new">
              <Plus className="h-4 w-4" />
              Create Your First Connection
            </Link>
          </Button>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <Card className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium text-sm">Monitor Health</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Track API uptime and performance
              </p>
            </Card>

            <Card className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-sm">Real-time Alerts</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Get notified when issues occur
              </p>
            </Card>

            <Card className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-sm">Easy Setup</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Connect APIs in minutes
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
