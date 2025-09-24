import Link from "next/link";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function HealthChecksHeader({
  connectionProvider,
  connectionId,
}: {
  connectionProvider: string;
  connectionId: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Health Checks</h1>
        <p className="text-muted-foreground">
          Monitor the health and performance of your {connectionProvider} API
          endpoints
        </p>
      </div>
      <Button asChild>
        <Link href={`/dashboard/connections/${connectionId}/health-checks/new`}>
          <Plus className="w-4 h-4 mr-2" />
          Add Health Check
        </Link>
      </Button>
    </div>
  );
}
