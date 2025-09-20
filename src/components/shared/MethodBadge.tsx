import { Badge } from "@/components/ui/badge";
import { getMethodColor } from "@/lib/shared/utils/status-utils";

interface MethodBadgeProps {
  method: string;
  className?: string;
}

export function MethodBadge({ method, className = "" }: MethodBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`${getMethodColor(method)} ${className}`}
    >
      {method}
    </Badge>
  );
}
