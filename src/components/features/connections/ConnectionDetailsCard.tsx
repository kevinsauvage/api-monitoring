import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTimestamp } from "@/lib/shared/utils/utils";

import type { ApiConnection } from "@prisma/client";

export default function ConnectionDetailsCard({
  connection,
}: {
  connection: ApiConnection;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connection Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Provider
            </label>
            <p className="text-foreground">{connection.provider}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Base URL
            </label>
            <p className="text-foreground font-mono text-sm">
              {connection.baseUrl}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Created
            </label>
            <p className="text-foreground">
              {formatTimestamp(connection.createdAt)}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Last Updated
            </label>
            <p className="text-foreground">
              {formatTimestamp(connection.updatedAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
