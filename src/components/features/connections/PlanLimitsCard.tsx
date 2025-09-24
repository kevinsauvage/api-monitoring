import { Info, Globe, Shield, Settings } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { Subscription } from "@prisma/client";

interface PlanLimitsCardProps {
  subscription: Subscription;
}

export default function PlanLimitsCard({ subscription }: PlanLimitsCardProps) {
  const getPlanLimits = (plan: Subscription) => {
    switch (plan) {
      case "HOBBY":
        return { maxConnections: 3, maxHealthChecks: 10 };
      case "STARTUP":
        return { maxConnections: 10, maxHealthChecks: 50 };
      case "BUSINESS":
        return { maxConnections: 50, maxHealthChecks: 200 };
      default:
        return { maxConnections: 50, maxHealthChecks: 200 };
    }
  };

  const limits = getPlanLimits(subscription);

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <Info className="h-5 w-5" />
          <span>Plan Limits</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span>Max connections: {limits.maxConnections}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span>Max health checks: {limits.maxHealthChecks}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span>
              Advanced features: {subscription === "HOBBY" ? "Limited" : "Full"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
