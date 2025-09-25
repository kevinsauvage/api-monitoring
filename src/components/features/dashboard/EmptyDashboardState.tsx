import Link from "next/link";

import { Plus, Zap, Shield, Activity, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function EmptyDashboardState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 mb-6">
          <Zap className="h-12 w-12 text-blue-600 dark:text-blue-400" />
        </div>

        <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
          Welcome to API Monitoring
        </h3>

        <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg">
          Get started by connecting your first API to begin monitoring its
          health, performance, and uptime. Set up alerts and track metrics in
          real-time.
        </p>

        <div className="space-y-6">
          <Button asChild size="lg" className="gap-2">
            <Link href="/dashboard/connections/new">
              <Plus className="h-4 w-4" />
              Create Your First Connection
            </Link>
          </Button>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            <Card className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-sm mb-2">Health Monitoring</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Track API uptime and performance metrics
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-sm mb-2">Real-time Alerts</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Get notified instantly when issues occur
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-sm mb-2">
                Performance Analytics
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Detailed insights and historical data
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <Zap className="h-8 w-8 text-orange-600" />
              </div>
              <h4 className="font-semibold text-sm mb-2">Easy Setup</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Connect APIs in minutes, not hours
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
