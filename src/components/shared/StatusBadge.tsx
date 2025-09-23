import { Badge } from "@/components/ui/badge";
import {
  getStatusColor,
  getStatusColorExtended,
  getStatusIcon,
} from "@/lib/shared/utils/status-utils";
import type { CheckStatus } from "@prisma/client";

export function StatusBadge({
  status,
  showIcon = false,
  variant = "default",
  className = "",
}: {
  status: CheckStatus | string;
  showIcon?: boolean;
  variant?: "default" | "extended";
  className?: string;
}) {
  const colorClass =
    variant === "extended"
      ? getStatusColorExtended(status)
      : getStatusColor(status);

  return (
    <Badge className={`${colorClass} ${className}`}>
      {showIcon && <span className="mr-1">{getStatusIcon(status)}</span>}
      {status}
    </Badge>
  );
}
