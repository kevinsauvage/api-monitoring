import { PreferencesSettings } from "@/components/features/settings";
import { getSettingsService } from "@/lib/infrastructure/di";

export default async function PreferencesSettingsPage() {
  const settingsService = getSettingsService();
  const userPreferences = await settingsService.getUserPreferences();

  return <PreferencesSettings initialPreferences={userPreferences} />;
}
