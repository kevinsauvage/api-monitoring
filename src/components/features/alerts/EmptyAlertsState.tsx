import { Bell, Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function EmptyAlertsState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
          <Bell className="h-10 w-10 text-blue-600 dark:text-blue-400" />
        </div>

        <h3 className="mt-6 text-lg font-semibold text-slate-900 dark:text-white">
          No alerts configured
        </h3>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Get started by creating your first alert to monitor your API
          endpoints. Set up notifications for error rates, response times, and
          more.
        </p>

        <div className="mt-8">
          <Button asChild size="lg" className="gap-2">
            <Link href="/dashboard/alerts/new">
              <Plus className="h-4 w-4" />
              Create Your First Alert
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
