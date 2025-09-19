import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Shield } from "lucide-react";
import { ZodError } from "@/components/ui/zod-error";

interface AdvancedConfigSectionProps {
  validationErrors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

export default function AdvancedConfigSection({
  validationErrors = [],
}: AdvancedConfigSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Code className="h-5 w-5" />
          <span>Advanced Configuration</span>
        </h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="headers" className="text-sm font-medium">
              Custom Headers (JSON)
            </Label>
            <Textarea
              id="headers"
              name="headers"
              placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
              className="min-h-[100px] font-mono text-sm"
            />
            <ZodError errors={validationErrors} fieldName="headers" />
            <p className="text-xs text-muted-foreground">
              Optional custom headers to include with the request
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="queryParams" className="text-sm font-medium">
              Query Parameters (JSON)
            </Label>
            <Textarea
              id="queryParams"
              name="queryParams"
              placeholder='{"param1": "value1", "param2": "value2"}'
              className="min-h-[100px] font-mono text-sm"
            />
            <ZodError errors={validationErrors} fieldName="queryParams" />
            <p className="text-xs text-muted-foreground">
              Optional query parameters to append to the URL
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="body" className="text-sm font-medium">
              Request Body
            </Label>
            <Textarea
              id="body"
              name="body"
              placeholder='{"key": "value"}'
              className="min-h-[100px] font-mono text-sm"
            />
            <ZodError errors={validationErrors} fieldName="body" />
            <p className="text-xs text-muted-foreground">
              Optional request body for POST, PUT, PATCH requests
            </p>
          </div>
        </div>
      </div>

      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security Notice</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            <strong>Important:</strong> Never include sensitive information like
            API keys or passwords in headers, query parameters, or request body.
            These will be logged and could be visible in monitoring data. Use
            the connection&apos;s stored credentials instead.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
