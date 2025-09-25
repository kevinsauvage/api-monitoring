import Link from "next/link";

import { Heart, Plus, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function EmptyHealthState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 mb-6">
          <Heart className="h-12 w-12 text-blue-600 dark:text-blue-400" />
        </div>

        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
          No Health Checks Configured
        </h3>

        <p className="text-slate-600 dark:text-slate-300 mb-8">
          Start monitoring your API endpoints by setting up health checks. Track
          response times, success rates, and get notified when issues occur.
        </p>

        <div className="space-y-4">
          <Button asChild size="lg" className="gap-2">
            <Link href="/dashboard/connections/new">
              <Plus className="h-4 w-4" />
              Create Your First Connection
            </Link>
          </Button>

          <div className="flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <TrendingUp className="h-4 w-4" />
              Monitor performance
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Heart className="h-4 w-4" />
              Track uptime
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
