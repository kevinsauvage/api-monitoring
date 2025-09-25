import { getServerSession } from "next-auth";

import HealthPageHeader from "@/components/features/health-checks/HealthPageHeader";
import { HealthCheckRepository } from "@/lib/core/repositories";
import { authOptions } from "@/lib/infrastructure/auth";

import type { Session } from "next-auth";

export default async function HealthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = (await getServerSession(authOptions)) as Session;
  const healthCheckRepository = new HealthCheckRepository();

  const totalHealthChecks = await healthCheckRepository.countByUserId(
    session.user.id
  );
  const hasHealthChecks = totalHealthChecks > 0;

  return (
    <div className="space-y-8">
      {hasHealthChecks && (
        <HealthPageHeader
          title="Health Dashboard"
          description="Monitor your API endpoints and track their performance"
        />
      )}
      {children}
    </div>
  );
}
