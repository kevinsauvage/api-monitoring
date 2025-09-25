import { Plus } from "lucide-react";
import Link from "next/link";

import AlertTable from "./AlertTable";
import { Button } from "@/components/ui/button";

import type { AlertWithHistory } from "@/lib/core/types";

interface AlertsSectionProps {
  alerts: AlertWithHistory[];
  apiConnections?: Array<{
    id: string;
    name: string;
    baseUrl: string;
  }>;
  onEdit?: (alert: AlertWithHistory) => void;
  onDelete?: (alert: AlertWithHistory) => Promise<void>;
  onToggle?: (alert: AlertWithHistory) => Promise<void>;
  onViewHistory?: (alert: AlertWithHistory) => void;
}

export default function AlertsSection({
  alerts,
  apiConnections = [],
  onEdit,
  onDelete,
  onToggle,
  onViewHistory,
}: AlertsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            All Alerts
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            {alerts.length} alert{alerts.length !== 1 ? "s" : ""} configured
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/dashboard/alerts/new">
            <Plus className="h-4 w-4" />
            Create Alert
          </Link>
        </Button>
      </div>

      <AlertTable
        alerts={alerts}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
        onViewHistory={onViewHistory}
      />
    </div>
  );
}
