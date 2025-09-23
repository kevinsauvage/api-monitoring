"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { log } from "@/lib/shared/utils/logger";
import { createHealthCheck } from "@/actions/health-actions";
import {
  getIntervalOptions,
  getDefaultInterval,
} from "@/lib/shared/utils/plan-limits";
import type { Subscription } from "@prisma/client";
import FormHeader from "./FormHeader";
import PlanInfoCard from "./PlanInfoCard";
import BasicConfigSection from "./BasicConfigSection";
import AdvancedConfigSection from "./AdvancedConfigSection";
import FormActions from "./FormActions";

export default function CreateHealthCheckForm({
  apiConnectionId,
}: {
  apiConnectionId: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Array<{
      field: string;
      message: string;
      code: string;
    }>
  >([]);
  const router = useRouter();
  const { data: session } = useSession();

  const subscription = session?.user.subscription as Subscription;
  const intervalOptions = getIntervalOptions(subscription);
  const defaultInterval = getDefaultInterval(subscription);

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);

      const headers = formData.get("headers") as string;
      const queryParams = formData.get("queryParams") as string;

      let parsedHeaders;
      let parsedQueryParams;

      try {
        parsedHeaders = headers
          ? (JSON.parse(headers) as Record<string, string>)
          : undefined;
      } catch {
        toast.error("Invalid JSON format for headers");
        return;
      }

      try {
        parsedQueryParams = queryParams
          ? (JSON.parse(queryParams) as Record<string, string>)
          : undefined;
      } catch {
        toast.error("Invalid JSON format for query parameters");
        return;
      }

      const result = await createHealthCheck({
        apiConnectionId,
        endpoint: formData.get("endpoint") as string,
        method: formData.get("method") as
          | "GET"
          | "POST"
          | "PUT"
          | "PATCH"
          | "DELETE",
        expectedStatus: parseInt(formData.get("expectedStatus") as string, 10),
        timeout: parseInt(formData.get("timeout") as string, 10),
        interval: parseInt(formData.get("interval") as string, 10),
        headers: parsedHeaders ?? {},
        body: formData.get("body") as string,
        queryParams: parsedQueryParams ?? {},
      });

      if (result.success) {
        toast.success("Health check created successfully");
        router.push(`/dashboard/connections/${apiConnectionId}/health-checks`);
        setValidationErrors([]);
      } else {
        if (result.zodError && Array.isArray(result.zodError)) {
          setValidationErrors(result.zodError);
        } else {
          toast.error("Failed to create health check");
          setValidationErrors([]);
        }
      }
    } catch (error) {
      log.error(
        "Failed to create health check:",
        error instanceof Error ? error.message : String(error)
      );
      toast.error("Failed to create health check");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <FormHeader apiConnectionId={apiConnectionId} />

      <PlanInfoCard subscription={subscription} />

      <Card>
        <CardHeader>
          <CardTitle>Health Check Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-8">
            <BasicConfigSection
              defaultInterval={defaultInterval}
              intervalOptions={intervalOptions}
              validationErrors={validationErrors}
            />

            <AdvancedConfigSection validationErrors={validationErrors} />

            <FormActions
              isSubmitting={isSubmitting}
              apiConnectionId={apiConnectionId}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
