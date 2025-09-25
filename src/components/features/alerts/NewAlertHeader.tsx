import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NewAlertHeader() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/alerts">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Alerts
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Create New Alert
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Set up monitoring alerts for your API endpoints. Configure conditions,
          thresholds, and notification channels.
        </p>
      </div>
    </div>
  );
}
