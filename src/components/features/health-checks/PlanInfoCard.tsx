import { Info, Crown, Star, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlanLimits } from "@/lib/shared/utils/plan-limits";

import type { Subscription } from "@prisma/client";

export default function PlanInfoCard({
  subscription,
}: {
  subscription: Subscription;
}) {
  const planLimits = getPlanLimits(subscription);

  const getPlanIcon = (plan: Subscription) => {
    switch (plan) {
      case "HOBBY":
        return <Star className="h-4 w-4" />;
      case "STARTUP":
        return <Zap className="h-4 w-4" />;
      case "BUSINESS":
        return <Crown className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const getPlanColor = (plan: Subscription) => {
    switch (plan) {
      case "HOBBY":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "STARTUP":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "BUSINESS":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <Info className="h-5 w-5" />
          <span>Plan Limits</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Badge
            className={`${getPlanColor(
              subscription
            )} flex items-center space-x-2`}
          >
            {getPlanIcon(subscription)}
            <span>{planLimits.name} Plan</span>
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-chart-1 rounded-full" />
            <span>Max health checks: {planLimits.maxHealthChecks}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-chart-2 rounded-full" />
            <span>Min interval: {planLimits.minInterval}s</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-chart-3 rounded-full" />
            <span>
              Advanced features: {subscription === "HOBBY" ? "Limited" : "Full"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
