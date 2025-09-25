import Link from "next/link";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { SerializedConnectionWithHealthChecks } from "@/lib/core/serializers";
import type { CheckResultWithDetails } from "@/lib/core/types";

import ConnectionsList from "./ConnectionsList";

interface ConnectionsSectionProps {
  connections: (SerializedConnectionWithHealthChecks & {
    recentResults?: CheckResultWithDetails[];
  })[];
}

export default function ConnectionsSection({
  connections,
}: ConnectionsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            All Connections
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            {connections.length} connection{connections.length !== 1 ? "s" : ""}{" "}
            configured
          </p>
        </div>
      </div>

      <ConnectionsList connections={connections} />
    </div>
  );
}
