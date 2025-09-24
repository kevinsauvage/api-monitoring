"use client";

import { useState } from "react";

import { RefreshCw, DollarSign, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { trackAllCosts } from "@/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export default function CostTrackingButton() {
  const [isTracking, setIsTracking] = useState(false);

  const handleTrackCosts = async () => {
    setIsTracking(true);
    try {
      const result = await trackAllCosts({});
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to track costs");
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Cost Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Manually trigger cost tracking for all your API connections. This
            will fetch the latest usage data from your connected providers.
          </p>
          <Button
            onClick={() => void handleTrackCosts()}
            disabled={isTracking}
            className="w-full"
          >
            {isTracking ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Tracking Costs...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Track All Costs
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
