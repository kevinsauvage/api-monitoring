"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Zap,
  Shield,
  Globe,
  Settings,
  Sparkles,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createConnection } from "@/actions";
import type { ConnectionCreateResult } from "@/lib/core/types";
import { ZodError } from "@/components/ui/zod-error";
import { API_PROVIDERS } from "@/components/utils/constants";
import { redirect } from "next/navigation";

const initialState: ConnectionCreateResult = {
  success: false,
  message: "",
  zodError: [],
};

export default function ConnectionForm({
  selectedProvider,
  formData,
  onInputChange,
  showApiKey,
  onToggleShowApiKey,
  isValidating,
  validationResult,
  onValidateConnection,
}: {
  selectedProvider: string;
  formData: {
    name: string;
    baseUrl: string;
    apiKey: string;
    secretKey: string;
    accountSid: string;
    authToken: string;
    token: string;
  };
  onInputChange: (field: string, value: string) => void;
  showApiKey: boolean;
  onToggleShowApiKey: () => void;
  isValidating: boolean;
  validationResult: {
    success: boolean;
    message: string;
  } | null;
  onValidateConnection: () => void;
}) {
  const selectedProviderData = API_PROVIDERS.find(
    (p) => p.id === selectedProvider
  );

  const [state, formAction, isPending] = useActionState(
    async (
      _prevState: ConnectionCreateResult,
      formData: FormData
    ): Promise<ConnectionCreateResult> => {
      const data = {
        name: formData.get("name") as string,
        provider: formData.get("provider") as string,
        baseUrl: formData.get("baseUrl") as string,
        apiKey: (formData.get("apiKey") as string) || undefined,
        secretKey: (formData.get("secretKey") as string) || undefined,
        accountSid: (formData.get("accountSid") as string) || undefined,
        authToken: (formData.get("authToken") as string) || undefined,
        token: (formData.get("token") as string) || undefined,
      };

      await createConnection(data);
      redirect("/dashboard/connections");
    },
    initialState
  );

  const getRequiredFields = () => {
    if (!selectedProviderData) return [];
    return selectedProviderData.fields.filter((field) => field.required);
  };

  const isFormValid = () => {
    if (!selectedProviderData) return false;
    const requiredFields = getRequiredFields();
    return requiredFields.every((field) => {
      const value = formData[field.name as keyof typeof formData];
      return value && value.trim().length > 0;
    });
  };

  if (!selectedProvider) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Connection Details</span>
        </CardTitle>
        <CardDescription>
          Configure your {selectedProviderData?.name} API connection
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state.message && !state.success && (
          <Alert className="mb-6" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        <form action={formAction} className="space-y-8">
          <input type="hidden" name="provider" value={selectedProvider} />

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Basic Information</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Connection Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => onInputChange("name", e.target.value)}
                    placeholder="My API Connection"
                    required
                    className="h-11"
                  />
                  <ZodError errors={state.zodError ?? []} fieldName="name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="baseUrl" className="text-sm font-medium">
                    Base URL *
                  </Label>
                  <Input
                    id="baseUrl"
                    name="baseUrl"
                    type="url"
                    value={formData.baseUrl}
                    onChange={(e) => onInputChange("baseUrl", e.target.value)}
                    placeholder="https://api.example.com"
                    required
                    className="h-11"
                  />
                  <ZodError errors={state.zodError ?? []} fieldName="baseUrl" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>API Credentials</span>
              </h3>
              <div className="space-y-4">
                {selectedProviderData?.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name} className="text-sm font-medium">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        type={
                          field.type === "password"
                            ? showApiKey
                              ? "text"
                              : "password"
                            : "text"
                        }
                        value={formData[field.name as keyof typeof formData]}
                        onChange={(e) =>
                          onInputChange(field.name, e.target.value)
                        }
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        required={field.required}
                        className="h-11 pr-12"
                      />
                      {field.type === "password" && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-9 w-9 p-0"
                          onClick={onToggleShowApiKey}
                        >
                          {showApiKey ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                    <ZodError
                      errors={state.zodError ?? []}
                      fieldName={field.name}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Secure Storage:</strong> Your API credentials are
              encrypted and stored securely. We never store them in plain text
              and only use them for monitoring purposes.
            </AlertDescription>
          </Alert>

          {isFormValid() && (
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => void onValidateConnection()}
                disabled={isValidating}
                className="h-11 px-6"
              >
                {isValidating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>

              {validationResult && (
                <Alert
                  variant={validationResult.success ? "default" : "destructive"}
                >
                  {validationResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {validationResult.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6">
            <Button variant="outline" asChild className="h-11 px-8">
              <Link href="/dashboard/connections">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid() || isPending}
              className="h-11 px-8"
            >
              {isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Connection
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
