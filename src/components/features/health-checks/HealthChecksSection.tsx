import Link from "next/link";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { HealthCheckWithResults } from "@/lib/core/types";

import HealthChecksList from "./HealthChecksList";

interface HealthChecksSectionProps {
  healthChecks: HealthCheckWithResults[];
  connectionName: string;
  connectionId: string;
}

export default function HealthChecksSection({
  healthChecks,
  connectionName,
  connectionId,
}: HealthChecksSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Health Checks for {connectionName}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            {healthChecks.length} health check
            {healthChecks.length !== 1 ? "s" : ""} configured
          </p>
        </div>
      </div>

      <HealthChecksList
        healthChecks={healthChecks}
        connectionName={connectionName}
        connectionId={connectionId}
      />
    </div>
  );
}
