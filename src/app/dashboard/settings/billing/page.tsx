import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import BillingSettings from "@/components/features/settings/BillingSettings";
import { authOptions } from "@/lib/infrastructure/auth";
import { getDashboardService } from "@/lib/infrastructure/di";

export default async function BillingSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const dashboardService = getDashboardService();
  const user = await dashboardService.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  return <BillingSettings user={user} />;
}
