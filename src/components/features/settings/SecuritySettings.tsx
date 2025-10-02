"use client";

import { useState } from "react";

import { Shield, Smartphone, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { enableTwoFactor, disableTwoFactor } from "@/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SecuritySettings({}) {
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleTwoFactorToggle = async (enabled: boolean) => {
    setIsLoading(true);

    try {
      const result = enabled
        ? await enableTwoFactor({
            theme: "system",
            language: "en",
            timezone: "UTC",
            dateFormat: "MM/dd/yyyy",
            timeFormat: "12h",
            showNotifications: true,
            showTooltips: true,
            enableAnalytics: false,
            enableCrashReporting: false,
          })
        : await disableTwoFactor({
            theme: "system",
            language: "en",
            timezone: "UTC",
            dateFormat: "MM/dd/yyyy",
            timeFormat: "12h",
            showNotifications: true,
            showTooltips: true,
            enableAnalytics: false,
            enableCrashReporting: false,
          });

      if (result.success) {
        setTwoFactorEnabled(enabled);
        toast.success(
          enabled
            ? "Two-factor authentication enabled"
            : "Two-factor authentication disabled"
        );
      } else {
        toast.error(
          result.message || "Failed to update two-factor authentication"
        );
      }
    } catch {
      toast.error("An error occurred while updating two-factor authentication");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Label htmlFor="two-factor">Enable 2FA</Label>
                {twoFactorEnabled && (
                  <Badge variant="default" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              id="two-factor"
              checked={twoFactorEnabled}
              onCheckedChange={() =>
                void handleTwoFactorToggle(twoFactorEnabled)
              }
              disabled={isLoading}
            />
          </div>

          {twoFactorEnabled && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>
                  Two-factor authentication is protecting your account
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Email Verified</span>
              </div>
              <Badge variant="default">Secure</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {twoFactorEnabled ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
                <span className="text-sm">Two-Factor Authentication</span>
              </div>
              <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                {twoFactorEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-sm">OAuth Authentication</span>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
