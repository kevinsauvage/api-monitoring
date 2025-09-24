/**
 * Reusable status indicator component
 */

import React from "react";

import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

import { ColorUtils } from "@/lib/shared/utils/color-utils";

import type { CheckStatus } from "@prisma/client";

interface StatusIndicatorProps {
  status: CheckStatus | string | undefined;
  variant?: "default" | "extended" | "text";
  showIcon?: boolean;
  className?: string;
}

export function StatusIndicator({
  status,
  variant = "default",
  showIcon = true,
  className = "",
}: StatusIndicatorProps) {
  const getColorClass = () => {
    switch (variant) {
      case "extended":
        return ColorUtils.getStatusColorExtended(status ?? "UNKNOWN");
      case "text":
        return ColorUtils.getStatusTextColor(status);
      case "default":
        return ColorUtils.getStatusColor(status);
    }
  };

  const getIcon = () => {
    if (!status) return <AlertTriangle className="w-4 h-4" />;

    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="w-4 h-4" />;
      case "FAILURE":
      case "ERROR":
        return <XCircle className="w-4 h-4" />;
      case "TIMEOUT":
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-1 ${getColorClass()} ${className}`}
    >
      {showIcon && getIcon()}
      <span className="capitalize">{status?.toLowerCase() ?? "unknown"}</span>
    </div>
  );
}
