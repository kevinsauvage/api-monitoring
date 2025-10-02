"use client";

import { useState } from "react";

import { Bell, Mail, Smartphone, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { updateNotificationSettings } from "@/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

import type { NotificationSettings } from "@prisma/client";

interface NotificationSettingsProps {
  initialSettings: NotificationSettings;
}

export default function NotificationSettings({
  initialSettings,
}: NotificationSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: initialSettings.emailNotifications,
    pushNotifications: initialSettings.pushNotifications,
    smsNotifications: initialSettings.smsNotifications,
    healthCheckAlerts: initialSettings.healthCheckAlerts,
    securityAlerts: initialSettings.securityAlerts,
    frequency: initialSettings.frequency as
      | "immediate"
      | "hourly"
      | "daily"
      | "weekly",
    quietHours: initialSettings.quietHours,
    quietHoursStart: initialSettings.quietHoursStart,
    quietHoursEnd: initialSettings.quietHoursEnd,
  });

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const result = await updateNotificationSettings({
        ...settings,
        frequency: settings.frequency,
      });

      if (result?.success) {
        toast.success("Notification settings updated successfully");
      } else {
        toast.error(
          result?.message ?? "Failed to update notification settings"
        );
      }
    } catch {
      toast.error("An error occurred while updating notification settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notification Channels */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Notification Channels</h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="email-notifications">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) =>
                    handleSettingChange("emailNotifications", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="push-notifications">
                      Push Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications in browser
                    </p>
                  </div>
                </div>
                <Switch
                  id="push-notifications"
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) =>
                    handleSettingChange("pushNotifications", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via SMS
                    </p>
                  </div>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) =>
                    handleSettingChange("smsNotifications", checked)
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Alert Types */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Alert Types</h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="health-alerts">Health Check Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when health checks fail
                    </p>
                  </div>
                </div>
                <Switch
                  id="health-alerts"
                  checked={settings.healthCheckAlerts}
                  onCheckedChange={(checked) =>
                    handleSettingChange("healthCheckAlerts", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="security-alerts">Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about security events
                    </p>
                  </div>
                </div>
                <Switch
                  id="security-alerts"
                  checked={settings.securityAlerts}
                  onCheckedChange={(checked) =>
                    handleSettingChange("securityAlerts", checked)
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Notification Frequency */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Notification Frequency</h4>

            <div className="space-y-2">
              <Label htmlFor="frequency">Alert Frequency</Label>
              <Select
                value={settings.frequency}
                onValueChange={(value) =>
                  handleSettingChange("frequency", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="hourly">Hourly Summary</SelectItem>
                  <SelectItem value="daily">Daily Summary</SelectItem>
                  <SelectItem value="weekly">Weekly Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => void handleSubmit()} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
