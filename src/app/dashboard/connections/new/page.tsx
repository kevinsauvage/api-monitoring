import { getServerSession } from "next-auth";

import NewConnectionClient from "@/components/features/connections/NewConnectionClient";
import NewConnectionHeader from "@/components/features/connections/NewConnectionHeader";
import PlanLimitsCard from "@/components/features/connections/PlanLimitsCard";
import { authOptions } from "@/lib/infrastructure/auth";

import type { Subscription } from "@prisma/client";

export const revalidate = 600; // 10 minutes

export default async function NewConnectionPage() {
  const session = await getServerSession(authOptions);
  const subscription = session?.user.subscription as Subscription;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <NewConnectionHeader subscription={subscription} />
      <PlanLimitsCard subscription={subscription} />
      <NewConnectionClient />
    </div>
  );
}
