"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { API_PROVIDERS } from "@/components/utils/constants";

export default function ProviderSelection({
  selectedProvider,
  onProviderSelect,
}: {
  selectedProvider: string;
  onProviderSelect: (providerId: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5" />
          <span>Choose API Provider</span>
        </CardTitle>
        <CardDescription>
          Select the API service you want to monitor
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {API_PROVIDERS.map((provider) => (
            <Button
              key={provider.id}
              variant={selectedProvider === provider.id ? "default" : "outline"}
              className="h-auto p-6 justify-start hover:shadow-md transition-shadow"
              onClick={() => onProviderSelect(provider.id)}
            >
              <div className="flex items-center space-x-4">
                <span className="text-3xl">{provider.icon}</span>
                <div className="text-left">
                  <h3 className="font-semibold text-base">{provider.name}</h3>
                  <p className="text-sm opacity-80">{provider.description}</p>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
