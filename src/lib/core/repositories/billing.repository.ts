import type {
  BillingData,
  BillingHistoryItem,
  PaymentMethod,
} from "@/lib/core/types/billing";
import { getPlanLimits } from "@/lib/shared/utils/plan-limits";

import { BaseRepository } from "./base.repository";

import type { Subscription } from "@prisma/client";

export class BillingRepository extends BaseRepository {
  async getBillingData(userId: string): Promise<BillingData | null> {
    this.validateRequiredParams({ userId }, ["userId"]);

    return this.executeQuery(async () => {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          subscription: true,
          createdAt: true,
          apiConnections: {
            where: { isActive: true },
            select: {
              id: true,
              healthChecks: {
                where: { isActive: true },
                select: { id: true },
              },
            },
          },
        },
      });

      if (!user) {
        return null;
      }

      const planLimits = getPlanLimits(user.subscription);
      const totalHealthChecks = user.apiConnections.reduce(
        (acc, connection) => acc + connection.healthChecks.length,
        0
      );

      // Calculate next billing date (30 days from creation for demo)
      const nextBillingDate = new Date(user.createdAt);
      nextBillingDate.setDate(nextBillingDate.getDate() + 30);

      // Get plan pricing (mock data - in real app this would come from Stripe)
      const planPricing = this.getPlanPricing(user.subscription);

      return {
        subscription: user.subscription,
        planName: planLimits.name,
        planDescription: planLimits.description,
        features: planLimits.features,
        amount: planPricing.amount,
        currency: planPricing.currency,
        nextBillingDate,
        status: "active",
        usage: {
          connections: {
            current: user.apiConnections.length,
            limit: planLimits.maxConnections,
          },
          healthChecks: {
            current: totalHealthChecks,
            limit: planLimits.maxHealthChecks,
          },
          apiCalls: {
            current: 2400, // Mock data - would be calculated from actual usage
            limit: -1, // Unlimited for all plans
          },
        },
      };
    }, this.buildErrorMessage("get", "billing data", userId));
  }

  async getBillingHistory(
    userId: string,
    limit: number = 10
  ): Promise<BillingHistoryItem[]> {
    this.validateRequiredParams({ userId }, ["userId"]);

    return this.executeQuery(async () => {
      // Mock billing history - in real app this would come from Stripe
      const mockHistory: BillingHistoryItem[] = [
        {
          id: "inv_001",
          date: new Date("2024-01-15"),
          amount: 29.99,
          currency: "USD",
          status: "paid",
          invoiceId: "INV-001",
          description: "Monthly subscription",
        },
        {
          id: "inv_002",
          date: new Date("2023-12-15"),
          amount: 29.99,
          currency: "USD",
          status: "paid",
          invoiceId: "INV-002",
          description: "Monthly subscription",
        },
        {
          id: "inv_003",
          date: new Date("2023-11-15"),
          amount: 29.99,
          currency: "USD",
          status: "paid",
          invoiceId: "INV-003",
          description: "Monthly subscription",
        },
      ];

      return mockHistory.slice(0, limit);
    }, this.buildErrorMessage("get", "billing history", userId));
  }

  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    this.validateRequiredParams({ userId }, ["userId"]);

    return this.executeQuery(async () => {
      // Mock payment methods - in real app this would come from Stripe
      const mockPaymentMethods: PaymentMethod[] = [
        {
          id: "pm_1234567890",
          type: "card",
          last4: "4242",
          brand: "visa",
          expiryMonth: 12,
          expiryYear: 2025,
          isDefault: true,
        },
      ];

      return mockPaymentMethods;
    }, this.buildErrorMessage("get", "payment methods", userId));
  }

  private getPlanPricing(subscription: Subscription): {
    amount: number;
    currency: string;
  } {
    const pricing = {
      HOBBY: { amount: 0, currency: "USD" },
      STARTUP: { amount: 19.99, currency: "USD" },
      BUSINESS: { amount: 49.99, currency: "USD" },
    };

    return pricing[subscription];
  }
}
