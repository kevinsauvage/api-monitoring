"use client";

import { useState } from "react";

import { Palette, Globe, Eye, Database, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { updatePreferences, clearData, exportData } from "@/actions";
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

import type { UserPreferences } from "@prisma/client";

interface PreferencesSettingsProps {
  initialPreferences: UserPreferences;
}

export default function PreferencesSettings({
  initialPreferences,
}: PreferencesSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    theme: initialPreferences.theme as "light" | "dark" | "system",
    language: initialPreferences.language,
    timezone: initialPreferences.timezone,
    dateFormat: initialPreferences.dateFormat,
    timeFormat: initialPreferences.timeFormat as "12h" | "24h",
    autoRefresh: initialPreferences.autoRefresh,
    refreshInterval: initialPreferences.refreshInterval,
    showNotifications: initialPreferences.showNotifications,
    compactMode: initialPreferences.compactMode,
    showTooltips: initialPreferences.showTooltips,
    enableAnalytics: initialPreferences.enableAnalytics,
    enableCrashReporting: initialPreferences.enableCrashReporting,
  });

  const handlePreferenceChange = (key: string, value: string | boolean) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);

    try {
      const result = await updatePreferences(preferences);

      if (result.success) {
        toast.success("Preferences updated successfully");
      } else {
        toast.error(result.message || "Failed to update preferences");
      }
    } catch (error) {
      toast.error("An error occurred while updating preferences");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async () => {
    if (
      !confirm(
        "Are you sure you want to clear all your data? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await clearData();

      if (result.success) {
        toast.success("Data cleared successfully");
      } else {
        toast.error(result.message || "Failed to clear data");
      }
    } catch (error) {
      toast.error("An error occurred while clearing data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    setIsLoading(true);

    try {
      const result = await exportData();

      if (result.success) {
        toast.success(
          "Data export started. You will receive an email when ready."
        );
      } else {
        toast.error(result.message || "Failed to start data export");
      }
    } catch (error) {
      toast.error("An error occurred while exporting data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={preferences.theme}
                onValueChange={(value) =>
                  handlePreferenceChange("theme", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="compact-mode">Compact Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Use a more compact interface layout
                </p>
              </div>
              <Switch
                id="compact-mode"
                checked={preferences.compactMode}
                onCheckedChange={(checked) =>
                  handlePreferenceChange("compactMode", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-tooltips">Show Tooltips</Label>
                <p className="text-sm text-muted-foreground">
                  Display helpful tooltips throughout the interface
                </p>
              </div>
              <Switch
                id="show-tooltips"
                checked={preferences.showTooltips}
                onCheckedChange={(checked) =>
                  handlePreferenceChange("showTooltips", checked)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Localization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Localization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={preferences.language}
                onValueChange={(value) =>
                  handlePreferenceChange("language", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={preferences.timezone}
                onValueChange={(value) =>
                  handlePreferenceChange("timezone", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">
                    Pacific Time
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-format">Date Format</Label>
              <Select
                value={preferences.dateFormat}
                onValueChange={(value) =>
                  handlePreferenceChange("dateFormat", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time-format">Time Format</Label>
              <Select
                value={preferences.timeFormat}
                onValueChange={(value) =>
                  handlePreferenceChange("timeFormat", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12 Hour</SelectItem>
                  <SelectItem value="24h">24 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data & Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data & Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-refresh">Auto Refresh</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically refresh dashboard data
                </p>
              </div>
              <Switch
                id="auto-refresh"
                checked={preferences.autoRefresh}
                onCheckedChange={(checked) =>
                  handlePreferenceChange("autoRefresh", checked)
                }
              />
            </div>

            {preferences.autoRefresh && (
              <div className="space-y-2">
                <Label htmlFor="refresh-interval">Refresh Interval</Label>
                <Select
                  value={preferences.refreshInterval}
                  onValueChange={(value) =>
                    handlePreferenceChange("refreshInterval", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enable-analytics">Usage Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Help improve the product by sharing anonymous usage data
                </p>
              </div>
              <Switch
                id="enable-analytics"
                checked={preferences.enableAnalytics}
                onCheckedChange={(checked) =>
                  handlePreferenceChange("enableAnalytics", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enable-crash-reporting">Crash Reporting</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically send crash reports to help improve stability
                </p>
              </div>
              <Switch
                id="enable-crash-reporting"
                checked={preferences.enableCrashReporting}
                onCheckedChange={(checked) =>
                  handlePreferenceChange("enableCrashReporting", checked)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Export Your Data</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Download a copy of all your data including connections, health
                checks, and analytics.
              </p>
              <Button onClick={handleExportData} disabled={isLoading}>
                <Eye className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>

            <Separator />

            <div className="p-4 bg-destructive/10 rounded-lg">
              <h4 className="font-medium mb-2 text-destructive">Danger Zone</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Permanently delete all your data. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                onClick={handleClearData}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSavePreferences} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
