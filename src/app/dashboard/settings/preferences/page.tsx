import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import { PreferencesSettings } from "@/components/features/settings";
import { authOptions } from "@/lib/infrastructure/auth";
import { getSettingsService } from "@/lib/infrastructure/di";

export default async function PreferencesSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const settingsService = getSettingsService();
  const userPreferences = await settingsService.getUserPreferences();

  return <PreferencesSettings initialPreferences={userPreferences} />;
}
