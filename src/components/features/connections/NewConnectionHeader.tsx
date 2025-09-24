import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPlanIcon, getPlanColor } from "@/components/utils/planUtils";
import { getPlanLimits } from "@/lib/shared/utils/plan-limits";

import type { Subscription } from "@prisma/client";

interface NewConnectionHeaderProps {
  subscription: Subscription;
}

export default function NewConnectionHeader({
  subscription,
}: NewConnectionHeaderProps) {
  const planLimits = getPlanLimits(subscription);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link
            href="/dashboard/connections"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Add New API Connection
          </h1>
          <p className="text-muted-foreground">
            Connect your APIs to start monitoring their health and performance
          </p>
        </div>
      </div>
      <Badge
        className={`${getPlanColor(subscription)} flex items-center space-x-2`}
      >
        {getPlanIcon(subscription)}
        <span>{planLimits.name} Plan</span>
      </Badge>
    </div>
  );
}
