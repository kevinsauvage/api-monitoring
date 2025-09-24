"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Calendar,
  Download,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Crown,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import type { User as UserType } from "next-auth";

interface BillingSettingsProps {
  user: UserType;
}

export default function BillingSettings({ user }: BillingSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Mock subscription data - in real app, this would come from props or API
  const subscription = {
    plan: "Pro",
    status: "active",
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    amount: 29.99,
    currency: "USD",
    features: [
      "Unlimited API connections",
      "Advanced health checks",
      "Real-time monitoring",
      "Priority support",
      "Custom alerts",
      "API usage analytics",
    ],
  };

  const handleUpgrade = async () => {
    setIsLoading(true);
    // In real app, this would redirect to Stripe or payment provider
    toast.success("Redirecting to upgrade page...");
    setIsLoading(false);
  };

  const handleManageBilling = async () => {
    setIsLoading(true);
    // In real app, this would redirect to billing portal
    toast.success("Redirecting to billing portal...");
    setIsLoading(false);
  };

  const handleDownloadInvoice = async () => {
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
                  {subscription.plan} Plan
                </h3>
                <Badge variant="default">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                ${subscription.amount}/
                {subscription.currency === "USD" ? "month" : "year"}
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
              {subscription.features.map((feature, index) => (
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
                  {subscription.nextBillingDate.toLocaleDateString()}
                </p>
              </div>
            </div>
            <Badge variant="outline">${subscription.amount}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="text-sm font-medium">Payment Method</span>
                <p className="text-sm text-muted-foreground">
                  **** **** **** 4242
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Update
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
                  5 / Unlimited
                </span>
                <div className="w-20 h-2 bg-muted rounded-full">
                  <div className="w-1/4 h-2 bg-primary rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Health Checks</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  12 / Unlimited
                </span>
                <div className="w-20 h-2 bg-muted rounded-full">
                  <div className="w-1/3 h-2 bg-primary rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Monthly API Calls</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  2.4K / Unlimited
                </span>
                <div className="w-20 h-2 bg-muted rounded-full">
                  <div className="w-1/6 h-2 bg-primary rounded-full"></div>
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
            {[
              {
                date: "2024-01-15",
                amount: 29.99,
                status: "paid",
                invoice: "INV-001",
              },
              {
                date: "2023-12-15",
                amount: 29.99,
                status: "paid",
                invoice: "INV-002",
              },
              {
                date: "2023-11-15",
                amount: 29.99,
                status: "paid",
                invoice: "INV-003",
              },
            ].map((invoice, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="text-sm font-medium">${invoice.amount}</p>
                    <p className="text-xs text-muted-foreground">
                      {invoice.date}
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
