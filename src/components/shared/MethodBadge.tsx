import { Badge } from "@/components/ui/badge";
import { getMethodColor } from "@/lib/shared/utils/status-utils";

export function MethodBadge({
  method,
  className = "",
}: {
  method: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={`${getMethodColor(method)} ${className}`}
    >
      {method}
    </Badge>
  );
}
