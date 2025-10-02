import { redirect } from "next/navigation";

import { ProfileSettings } from "@/components/features/settings";
import { getDashboardService } from "@/lib/infrastructure/di";

export default async function SettingsPage() {
  const dashboardService = getDashboardService();
  const user = await dashboardService.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  return <ProfileSettings user={user} />;
}
