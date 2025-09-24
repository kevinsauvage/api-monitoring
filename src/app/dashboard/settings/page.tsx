import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import { ProfileSettings } from "@/components/features/settings";
import { authOptions } from "@/lib/infrastructure/auth";
import { getDashboardService } from "@/lib/infrastructure/di";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const dashboardService = getDashboardService();
  const user = await dashboardService.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  return <ProfileSettings user={user} />;
}
