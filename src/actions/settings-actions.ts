"use server";

import { getSettingsService } from "@/lib/infrastructure/di/service-factory";
import { settingsSchemas } from "@/lib/shared/schemas";
import {
  createDataAction,
  createAuthenticatedAction,
} from "@/lib/shared/utils/action-factory";

const settingsService = getSettingsService();

export const updateUserProfile = createAuthenticatedAction(
  settingsSchemas.updateProfile,
  async (input, _userId) => settingsService.updateProfile(input),
  ["/dashboard/settings"]
);

export const updatePassword = createAuthenticatedAction(
  settingsSchemas.updatePassword,
  async (input, _userId) => settingsService.updatePassword(input),
  ["/dashboard/settings"]
);

export const updateNotificationSettings = createAuthenticatedAction(
  settingsSchemas.updateNotificationSettings,
  async (input, _userId) => settingsService.updateNotificationSettings(input),
  ["/dashboard/settings"]
);

export const updatePreferences = createAuthenticatedAction(
  settingsSchemas.updatePreferences,
  async (input, _userId) => settingsService.updatePreferences(input),
  ["/dashboard/settings"]
);

export const getUserPreferences = createDataAction(
  settingsSchemas.updatePreferences, // Using same schema for now
  async (_input) => settingsService.getUserPreferences(),
  ["/dashboard/settings"]
);

export const getNotificationSettings = createDataAction(
  settingsSchemas.updateNotificationSettings, // Using same schema for now
  async (_input) => settingsService.getNotificationSettings(),
  ["/dashboard/settings"]
);

export const clearData = createDataAction(
  settingsSchemas.emptyInput,
  async (_input) => settingsService.clearUserData(),
  ["/dashboard/settings"]
);

export const exportData = createDataAction(
  settingsSchemas.emptyInput,
  async (_input) => settingsService.exportUserData(),
  ["/dashboard/settings"]
);

// Two-factor authentication actions (placeholder for now)
export const enableTwoFactor = createDataAction(
  settingsSchemas.updatePreferences, // Using same schema for now
  async (_input) =>
    Promise.resolve({
      success: true,
      message: "Two-factor authentication enabled",
    }),
  ["/dashboard/settings"]
);

export const disableTwoFactor = createDataAction(
  settingsSchemas.updatePreferences, // Using same schema for now
  async (_input) =>
    Promise.resolve({
      success: true,
      message: "Two-factor authentication disabled",
    }),
  ["/dashboard/settings"]
);
