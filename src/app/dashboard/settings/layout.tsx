import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import SettingsNavigation from "@/components/features/settings/SettingsNavigation";
import { authOptions } from "@/lib/infrastructure/auth";
import { getDashboardService } from "@/lib/infrastructure/di";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const dashboardService = getDashboardService();
  const user = await dashboardService.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <SettingsNavigation />
        <div className="lg:col-span-3">{children}</div>
      </div>
    </div>
  );
}
