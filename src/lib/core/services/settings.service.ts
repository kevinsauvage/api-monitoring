import * as bcrypt from "bcryptjs";

import type { settingsSchemas } from "@/lib/shared/schemas";

import { BaseService } from "./base.service";

import type { UserPreferences, NotificationSettings } from "@prisma/client";

export class SettingsService extends BaseService {
  async updateProfile(
    data: typeof settingsSchemas.updateProfile._type
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.requireAuth();

    // Check if email is already taken by another user
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser && existingUser.id !== user.id) {
      return { success: false, message: "Email is already taken" };
    }

    // Update user profile
    await this.userRepository.update(user.id, {
      name: data.name,
      email: data.email,
    });

    return { success: true, message: "Profile updated successfully" };
  }

  async updatePassword(
    data: typeof settingsSchemas.updatePassword._type
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.requireAuth();

    // Get current user to verify password
    const currentUser = await this.userRepository.findById(user.id);
    if (!currentUser?.password) {
      return { success: false, message: "User not found or no password set" };
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      data.currentPassword,
      currentUser.password
    );

    if (!isCurrentPasswordValid) {
      return { success: false, message: "Current password is incorrect" };
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(data.newPassword, 12);

    // Update password in database
    await this.userRepository.update(user.id, {
      password: hashedNewPassword,
    });

    return { success: true, message: "Password updated successfully" };
  }

  async updateNotificationSettings(
    data: typeof settingsSchemas.updateNotificationSettings._type
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.requireAuth();

    // Update or create notification settings
    await this.notificationSettingsRepository.update(user.id, data);

    return {
      success: true,
      message: "Notification settings updated successfully",
    };
  }

  async updatePreferences(
    data: typeof settingsSchemas.updatePreferences._type
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.requireAuth();

    await this.userPreferencesRepository.update(user.id, data);

    return { success: true, message: "Preferences updated successfully" };
  }

  async getUserPreferences(): Promise<UserPreferences> {
    const user = await this.requireAuth();
    return this.userPreferencesRepository.getOrCreate(user.id);
  }

  async getNotificationSettings(): Promise<NotificationSettings> {
    const user = await this.requireAuth();
    return this.notificationSettingsRepository.getOrCreate(user.id);
  }

  async clearUserData(): Promise<{ success: boolean; message: string }> {
    const user = await this.requireAuth();

    // Delete user preferences and notification settings
    await Promise.all([
      this.userPreferencesRepository.delete(user.id),
      this.notificationSettingsRepository.delete(user.id),
    ]);

    return { success: true, message: "Data cleared successfully" };
  }

  async exportUserData(): Promise<{ success: boolean; message: string }> {
    await this.requireAuth();

    // In a real app, you would:
    // 1. Collect all user data
    // 2. Create a downloadable archive
    // 3. Send download link via email

    return { success: true, message: "Data export started" };
  }
}
