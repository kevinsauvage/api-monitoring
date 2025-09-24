"use client";

import { useState } from "react";

import {
  CreditCard,
  Calendar,
  Download,
  ExternalLink,
  CheckCircle,
  Crown,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type {
  BillingData,
  BillingHistoryItem,
  PaymentMethod,
} from "@/lib/core/types";

import type { User as UserType } from "next-auth";

interface BillingSettingsProps {
  user: UserType;
  billingData: BillingData | null;
  billingHistory: BillingHistoryItem[];
  paymentMethods: PaymentMethod[];
}

export default function BillingSettings({
  user: _user,
  billingData,
  billingHistory,
  paymentMethods,
}: BillingSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Use the real data passed from server-side
  if (!billingData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Unable to load billing data</p>
        </div>
      </div>
    );
  }

  const handleUpgrade = () => {
    setIsLoading(true);
    // In real app, this would redirect to Stripe or payment provider
    toast.success("Redirecting to upgrade page...");
    setIsLoading(false);
  };

  const handleManageBilling = () => {
    setIsLoading(true);
    // In real app, this would redirect to billing portal
    toast.success("Redirecting to billing portal...");
    setIsLoading(false);
  };

  const handleDownloadInvoice = () => {
    setIsLoading(true);
    // In real app, this would download the invoice
    toast.success("Downloading invoice...");
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold">
                  {billingData.planName} Plan
                </h3>
                <Badge variant="default">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {billingData.status === "active"
                    ? "Active"
                    : billingData.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {billingData.amount > 0
                  ? `$${billingData.amount}/${
                      billingData.currency === "USD" ? "month" : "year"
                    }`
                  : "Free"}
              </p>
            </div>
            <Button onClick={handleUpgrade} disabled={isLoading}>
              <Zap className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Plan Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {billingData.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="text-sm font-medium">Next Billing Date</span>
                <p className="text-sm text-muted-foreground">
                  {billingData.nextBillingDate.toLocaleDateString()}
                </p>
              </div>
            </div>
            <Badge variant="outline">
              {billingData.amount > 0 ? `$${billingData.amount}` : "Free"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="text-sm font-medium">Payment Method</span>
                <p className="text-sm text-muted-foreground">
                  {paymentMethods.length > 0
                    ? `**** **** **** ${paymentMethods[0].last4}`
                    : "No payment method on file"}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              {paymentMethods.length > 0 ? "Update" : "Add Payment Method"}
            </Button>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleDownloadInvoice}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </Button>
            <Button onClick={handleManageBilling} disabled={isLoading}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Manage Billing
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage & Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Usage & Limits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">API Connections</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {billingData.usage.connections.current} /{" "}
                  {billingData.usage.connections.limit === -1
                    ? "Unlimited"
                    : billingData.usage.connections.limit}
                </span>
                <div className="w-20 h-2 bg-muted rounded-full">
                  <div
                    className="h-2 bg-primary rounded-full"
                    style={{
                      width:
                        billingData.usage.connections.limit === -1
                          ? "100%"
                          : `${
                              (billingData.usage.connections.current /
                                billingData.usage.connections.limit) *
                              100
                            }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Health Checks</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {billingData.usage.healthChecks.current} /{" "}
                  {billingData.usage.healthChecks.limit === -1
                    ? "Unlimited"
                    : billingData.usage.healthChecks.limit}
                </span>
                <div className="w-20 h-2 bg-muted rounded-full">
                  <div
                    className="h-2 bg-primary rounded-full"
                    style={{
                      width:
                        billingData.usage.healthChecks.limit === -1
                          ? "100%"
                          : `${
                              (billingData.usage.healthChecks.current /
                                billingData.usage.healthChecks.limit) *
                              100
                            }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Monthly API Calls</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {billingData.usage.apiCalls.current.toLocaleString()} /{" "}
                  {billingData.usage.apiCalls.limit === -1
                    ? "Unlimited"
                    : billingData.usage.apiCalls.limit.toLocaleString()}
                </span>
                <div className="w-20 h-2 bg-muted rounded-full">
                  <div
                    className="h-2 bg-primary rounded-full"
                    style={{
                      width:
                        billingData.usage.apiCalls.limit === -1
                          ? "100%"
                          : `${
                              (billingData.usage.apiCalls.current /
                                billingData.usage.apiCalls.limit) *
                              100
                            }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {billingHistory.length > 0 ? (
              billingHistory.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="text-sm font-medium">${invoice.amount}</p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.date.toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {invoice.status}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No billing history available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
