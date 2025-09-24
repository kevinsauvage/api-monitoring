import type { BillingRepository } from "@/lib/core/repositories";
import type {
  BillingData,
  BillingHistoryItem,
  PaymentMethod,
} from "@/lib/core/types/billing";
import { SERVICE_IDENTIFIERS } from "@/lib/infrastructure/di/service-identifiers";

import { BaseService } from "./base.service";

export class BillingService extends BaseService {
  private get billingRepository(): BillingRepository {
    return this.resolve<BillingRepository>(
      SERVICE_IDENTIFIERS.BILLING_REPOSITORY
    );
  }

  async getBillingData(userId: string): Promise<BillingData | null> {
    this.validateRequiredParams({ userId }, ["userId"]);

    try {
      return await this.billingRepository.getBillingData(userId);
    } catch (error) {
      this.handleServiceError(error, "getBillingData");
    }
  }

  async getBillingHistory(
    userId: string,
    limit?: number
  ): Promise<BillingHistoryItem[]> {
    this.validateRequiredParams({ userId }, ["userId"]);

    try {
      return await this.billingRepository.getBillingHistory(userId, limit);
    } catch (error) {
      this.handleServiceError(error, "getBillingHistory");
    }
  }

  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    this.validateRequiredParams({ userId }, ["userId"]);

    try {
      return await this.billingRepository.getPaymentMethods(userId);
    } catch (error) {
      this.handleServiceError(error, "getPaymentMethods");
    }
  }

  async getCurrentUserBillingData(): Promise<BillingData | null> {
    const user = await this.requireAuth();
    return this.getBillingData(user.id);
  }

  async getCurrentUserBillingHistory(
    limit?: number
  ): Promise<BillingHistoryItem[]> {
    const user = await this.requireAuth();
    return this.getBillingHistory(user.id, limit);
  }

  async getCurrentUserPaymentMethods(): Promise<PaymentMethod[]> {
    const user = await this.requireAuth();
    return this.getPaymentMethods(user.id);
  }
}
