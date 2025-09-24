import type { Subscription } from "@prisma/client";

export interface BillingData {
  subscription: Subscription;
  planName: string;
  planDescription: string;
  features: string[];
  amount: number;
  currency: string;
  nextBillingDate: Date;
  status: "active" | "cancelled" | "past_due" | "trialing";
  usage: {
    connections: {
      current: number;
      limit: number;
    };
    healthChecks: {
      current: number;
      limit: number;
    };
    apiCalls: {
      current: number;
      limit: number;
    };
  };
}

export interface BillingHistoryItem {
  id: string;
  date: Date;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed";
  invoiceId: string;
  description: string;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "bank_account";
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}
