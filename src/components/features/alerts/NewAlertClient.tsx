"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createAlert } from "@/actions/alert-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import AlertConditionBuilder from "./AlertConditionBuilder";

const alertFormSchema = z.object({
  apiConnectionId: z.string().optional(),
  type: z.enum([
    "ERROR_RATE",
    "RESPONSE_TIME",
    "RATE_LIMIT",
    "UPTIME",
    "CUSTOM",
  ]),
  condition: z.string().min(1, "Condition is required"),
  threshold: z.number().min(0, "Threshold must be positive"),
  isActive: z.boolean().default(true),
  channels: z.array(z.string()).min(1, "At least one channel is required"),
  webhookUrl: z.string().url().optional().or(z.literal("")),
  slackChannel: z.string().optional(),
});

type AlertFormData = z.infer<typeof alertFormSchema>;

interface NewAlertClientProps {
  apiConnections?: Array<{
    id: string;
    name: string;
    baseUrl: string;
  }>;
}

export default function NewAlertClient({
  apiConnections = [],
}: NewAlertClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<AlertFormData>({
    resolver: zodResolver(alertFormSchema),
    defaultValues: {
      type: "ERROR_RATE",
      condition: "",
      threshold: 0,
      isActive: true,
      channels: ["email"],
      webhookUrl: "",
      slackChannel: "",
      apiConnectionId: "global",
    },
  });

  const onSubmit = async (data: AlertFormData) => {
    setIsSubmitting(true);
    try {
      // Convert "global" to undefined for the API
      const alertData = {
        ...data,
        apiConnectionId:
          data.apiConnectionId === "global" ? undefined : data.apiConnectionId,
      };

      await createAlert(alertData);
      router.push("/dashboard/alerts");
    } catch (_error) {
      // Handle error silently or show toast notification
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedChannels = form.watch("channels");

  const toggleChannel = (channel: string) => {
    const currentChannels = form.getValues("channels");
    if (currentChannels.includes(channel)) {
      form.setValue(
        "channels",
        currentChannels.filter((c) => c !== channel)
      );
    } else {
      form.setValue("channels", [...currentChannels, channel]);
    }
  };

  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
            className="space-y-8"
          >
            {/* Alert Configuration Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                  Alert Configuration
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Define what you want to monitor and when to trigger alerts.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alert Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select alert type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ERROR_RATE">Error Rate</SelectItem>
                          <SelectItem value="RESPONSE_TIME">
                            Response Time
                          </SelectItem>
                          <SelectItem value="RATE_LIMIT">Rate Limit</SelectItem>
                          <SelectItem value="UPTIME">Uptime</SelectItem>
                          <SelectItem value="CUSTOM">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apiConnectionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Connection</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select connection" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="global">Global Alert</SelectItem>
                          {apiConnections.map((connection) => (
                            <SelectItem
                              key={connection.id}
                              value={connection.id}
                            >
                              {connection.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Leave as &quot;Global Alert&quot; to monitor all
                        connections
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <FormLabel>Alert Condition</FormLabel>
                  <FormDescription className="mt-1">
                    Configure the condition that should trigger this alert using
                    YAML format
                  </FormDescription>
                </div>

                <AlertConditionBuilder
                  alertType={form.watch("type")}
                  threshold={form.watch("threshold")}
                  onConditionChange={(condition) =>
                    form.setValue("condition", condition)
                  }
                  onThresholdChange={(threshold) =>
                    form.setValue("threshold", threshold)
                  }
                />

                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Notification Settings Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                  Notification Settings
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Choose how you want to be notified when this alert triggers.
                </p>
              </div>

              <div>
                <FormLabel className="text-base">
                  Notification Channels
                </FormLabel>
                <div className="flex flex-wrap gap-3 mt-3">
                  {["email", "slack", "webhook"].map((channel) => (
                    <Button
                      key={channel}
                      type="button"
                      variant={
                        selectedChannels.includes(channel)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => toggleChannel(channel)}
                      className="capitalize"
                    >
                      {channel}
                    </Button>
                  ))}
                </div>
                <FormDescription className="mt-2">
                  Select one or more channels to receive notifications
                </FormDescription>
                <FormMessage />
              </div>

              {selectedChannels.includes("webhook") && (
                <FormField
                  control={form.control}
                  name="webhookUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Webhook URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://hooks.slack.com/services/..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the webhook URL for your notification service
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {selectedChannels.includes("slack") && (
                <FormField
                  control={form.control}
                  name="slackChannel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slack Channel</FormLabel>
                      <FormControl>
                        <Input placeholder="#alerts" {...field} />
                      </FormControl>
                      <FormDescription>
                        Specify the Slack channel for notifications
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/alerts")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating Alert..." : "Create Alert"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
