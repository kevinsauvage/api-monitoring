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

    return this.executeQuery(
      async () => {
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

        // Calculate actual API calls from check results in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const apiCallsCount = await this.prisma.checkResult.count({
          where: {
            healthCheck: {
              apiConnection: {
                userId: userId,
              },
            },
            timestamp: {
              gte: thirtyDaysAgo,
            },
          },
        });

        // Calculate next billing date (30 days from creation for demo)
        const nextBillingDate = new Date(user.createdAt);
        nextBillingDate.setDate(nextBillingDate.getDate() + 30);

        // Get plan pricing from actual plan limits
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
              current: apiCallsCount,
              limit: -1, // Unlimited for all plans
            },
          },
        };
      },
      this.buildErrorMessage("get", "billing data", userId)
    );
  }

  async getBillingHistory(
    userId: string,
    _limit: number = 10
  ): Promise<BillingHistoryItem[]> {
    this.validateRequiredParams({ userId }, ["userId"]);

    return this.executeQuery(
      async () => {
        // Since there's no billing table, return empty array for now
        // In a real app, this would query a billing/invoice table
        return Promise.resolve([]);
      },
      this.buildErrorMessage("get", "billing history", userId)
    );
  }

  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    this.validateRequiredParams({ userId }, ["userId"]);

    return this.executeQuery(
      async () => {
        // Since there's no payment methods table, return empty array for now
        // In a real app, this would query a payment methods table or Stripe
        return Promise.resolve([]);
      },
      this.buildErrorMessage("get", "payment methods", userId)
    );
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
