import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import { NotificationSettings } from "@/components/features/settings";
import { authOptions } from "@/lib/infrastructure/auth";
import { getSettingsService } from "@/lib/infrastructure/di";

export default async function NotificationSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const settingsService = getSettingsService();
  const notificationSettings = await settingsService.getNotificationSettings();

  return <NotificationSettings initialSettings={notificationSettings} />;
}
