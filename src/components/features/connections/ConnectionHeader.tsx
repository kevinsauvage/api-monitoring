import ConnectionActions from "./ConnectionActions";

import type { ApiConnection } from "@prisma/client";

export default function ConnectionHeader({
  connection,
}: {
  connection: ApiConnection;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{connection.name}</h1>
        <p className="text-muted-foreground">
          Monitor and manage your {connection.provider} API connection
        </p>
      </div>
      <ConnectionActions connection={connection} />
    </div>
  );
}
