import Link from "next/link";

import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPlanIcon, getPlanColor } from "@/components/utils/planUtils";
import { getPlanLimits } from "@/lib/shared/utils/plan-limits";

import type { Subscription } from "@prisma/client";

interface ConnectionsPageHeaderProps {
  userSubscription: Subscription;
  canCreateConnection: boolean;
}

export default function ConnectionsPageHeader({
  userSubscription,
  canCreateConnection,
}: ConnectionsPageHeaderProps) {
  const planLimits = getPlanLimits(userSubscription);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          API Connections
        </h1>
        <p className="text-muted-foreground">
          Manage your API integrations and monitor their health
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <Badge
          className={`${getPlanColor(
            userSubscription
          )} flex items-center space-x-2`}
        >
          {getPlanIcon(userSubscription)}
          <span>{planLimits.name} Plan</span>
        </Badge>
        <Button asChild disabled={!canCreateConnection}>
          <Link href="/dashboard/connections/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Connection
          </Link>
        </Button>
      </div>
    </div>
  );
}
