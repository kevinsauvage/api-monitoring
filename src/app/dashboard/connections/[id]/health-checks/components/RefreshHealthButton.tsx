"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { log } from "@/lib/logger";
import { refreshHealthData } from "@/actions/health-actions";

export default function RefreshHealthButton() {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const result = await refreshHealthData();

      if (result.success) {
        toast.success("Health data refreshed");
      } else {
        toast.error("Failed to refresh health data");
      }
    } catch (error) {
      log.error("Failed to refresh health data", {
        error: error instanceof Error ? error.message : String(error),
      });
      toast.error("Failed to refresh health data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={() => void handleRefresh()}
      disabled={loading}
      size="sm"
      variant="outline"
      className="gap-2"
    >
      <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
      Refresh
    </Button>
  );
}
