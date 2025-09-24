"use client";

import { useState } from "react";

import { validateConnection } from "@/actions";
import ConnectionForm from "@/components/features/connections/ConnectionForm";
import ProviderSelection from "@/components/features/connections/ProviderSelection";
import { API_PROVIDERS } from "@/components/utils";
import { log } from "@/lib/shared/utils";

export default function NewConnectionClient() {
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    baseUrl: "",
    apiKey: "",
    secretKey: "",
    accountSid: "",
    authToken: "",
    token: "",
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const selectedProviderData = API_PROVIDERS.find(
    (p) => p.id === selectedProvider
  );

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    const provider = API_PROVIDERS.find((p) => p.id === providerId);
    if (provider) {
      setFormData({
        ...formData,
        name: provider.name,
        baseUrl: provider.baseUrl,
      });
    }
    setValidationResult(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleValidateConnection = async () => {
    if (!selectedProviderData) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      const result = await validateConnection({
        provider: selectedProviderData.id,
        baseUrl: formData.baseUrl,
        apiKey: formData.apiKey,
        secretKey: formData.secretKey,
        accountSid: formData.accountSid,
        authToken: formData.authToken,
        token: formData.token,
        name: formData.name,
      });

      setValidationResult({
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      log.error(
        "Validation error:",
        error instanceof Error ? error.message : String(error)
      );
      setValidationResult({
        success: false,
        message: "Failed to validate connection",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <>
      <ProviderSelection
        selectedProvider={selectedProvider}
        onProviderSelect={handleProviderSelect}
      />

      <ConnectionForm
        selectedProvider={selectedProvider}
        formData={formData}
        onInputChange={handleInputChange}
        showApiKey={showApiKey}
        onToggleShowApiKey={() => setShowApiKey(!showApiKey)}
        isValidating={isValidating}
        validationResult={validationResult}
        onValidateConnection={() => void handleValidateConnection()}
      />
    </>
  );
}
