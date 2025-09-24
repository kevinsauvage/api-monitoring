import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import ConnectionNavigation from "@/components/features/connections/ConnectionNavigation";
import { Button } from "@/components/ui/button";
import { getConnectionService } from "@/lib/infrastructure/di";

export default async function ConnectionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const parameters = await params;
  const connectionService = getConnectionService();
  const connection = await connectionService.getConnectionById(parameters.id);

  if (!connection) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/connections">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Connection not found
            </h1>
          </div>
        </div>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">
            Connection not found
          </h3>
          <p className="text-muted-foreground mb-6">
            The connection you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
          <Button asChild>
            <Link href="/dashboard/connections">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Connections
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/connections">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {connection.name}
          </h1>
          <p className="text-muted-foreground">
            {connection.provider} • {connection.baseUrl}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <ConnectionNavigation connectionId={connection.id} />

      {/* Content */}
      {children}
    </div>
  );
}
