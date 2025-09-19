import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPlanIcon, getPlanColor } from "@/components/utils/planUtils";
import { getPlanLimits } from "@/lib/shared/utils/plan-limits";
import type { Subscription } from "@prisma/client";

interface ConnectionsHeaderProps {
  userSubscription: Subscription;
  canCreateConnection: boolean;
}

export default function ConnectionsHeader({
  userSubscription,
  canCreateConnection,
}: ConnectionsHeaderProps) {
  const planLimits = getPlanLimits(userSubscription);

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Connections</h1>
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
