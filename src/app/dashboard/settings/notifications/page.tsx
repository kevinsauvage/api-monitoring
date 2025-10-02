import { NotificationSettings } from "@/components/features/settings";
import { getSettingsService } from "@/lib/infrastructure/di";

export default async function NotificationSettingsPage() {
  const settingsService = getSettingsService();
  const notificationSettings = await settingsService.getNotificationSettings();

  return <NotificationSettings initialSettings={notificationSettings} />;
}
