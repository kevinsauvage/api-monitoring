"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createAlert } from "@/actions/alert-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

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

interface AlertFormProps {
  apiConnections?: Array<{
    id: string;
    name: string;
    baseUrl: string;
  }>;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export default function AlertForm({
  apiConnections = [],
  onSuccess,
  children,
}: AlertFormProps) {
  const [open, setOpen] = useState(false);
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
      setOpen(false);
      form.reset();
      onSuccess?.();
      router.refresh();
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Alert
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Alert</DialogTitle>
          <DialogDescription>
            Set up monitoring alerts for your API connections.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
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
                    <FormLabel>API Connection (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select connection" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="global">Global Alert</SelectItem>
                        {apiConnections.map((connection) => (
                          <SelectItem key={connection.id} value={connection.id}>
                            {connection.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Leave empty for global alerts
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., error_rate > 5%, response_time > 2000ms"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe when this alert should trigger
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="threshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Threshold</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormDescription>Numeric threshold value</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>Enable this alert</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormLabel>Notification Channels</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {["email", "slack", "webhook"].map((channel) => (
                  <Button
                    key={channel}
                    type="button"
                    variant={
                      selectedChannels.includes(channel) ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => toggleChannel(channel)}
                  >
                    {channel}
                  </Button>
                ))}
              </div>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Alert"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
