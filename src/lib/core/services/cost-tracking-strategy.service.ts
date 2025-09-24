import { CostTrackingStrategyFactory } from "@/lib/core/strategies/cost-tracking";
import { SERVICE_IDENTIFIERS } from "@/lib/infrastructure/di";
import { decrypt } from "@/lib/infrastructure/encryption";
import type { CostTrackingResult } from "@/lib/shared/types/api-results";

import { BaseService } from "./base.service";

import type { CostMetricService } from "./cost-metric.service";

export class CostTrackingService extends BaseService {
  private get costMetricService(): CostMetricService {
    return this.resolve<CostMetricService>(
      SERVICE_IDENTIFIERS.COST_METRIC_SERVICE
    );
  }

  async trackCostsForConnection(
    connectionId: string
  ): Promise<CostTrackingResult> {
    try {
      const connection =
        await this.connectionRepository.findByIdWithCredentials(connectionId);
      if (!connection) {
        throw new Error("Connection not found");
      }

      const { provider, apiKey, secretKey, accountSid, authToken, token } =
        connection;

      const strategy = CostTrackingStrategyFactory.createStrategy(provider);

      const credentials = this.prepareCredentials(provider, {
        apiKey: apiKey ? decrypt(apiKey) : "",
        secretKey: secretKey ? decrypt(secretKey) : "",
        accountSid: accountSid ? decrypt(accountSid) : "",
        authToken: authToken ? decrypt(authToken) : "",
        token: token ? decrypt(token) : "",
      });

      const result = await strategy.trackCosts(credentials);

      if (result.success && result.costData) {
        await this.costMetricService.createCostMetric(connectionId, {
          amount: result.costData.amount,
          currency: result.costData.currency,
          period: result.costData.period,
          metadata: result.costData.metadata,
        });
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private prepareCredentials(
    provider: string,
    credentials: Record<string, string>
  ): Record<string, string> {
    switch (provider) {
      case "stripe":
        return { secretKey: credentials["secretKey"] };
      case "twilio":
        return {
          accountSid: credentials["accountSid"],
          authToken: credentials["authToken"],
        };
      case "sendgrid":
        return { apiKey: credentials["apiKey"] };
      case "github":
      case "slack":
        return { token: credentials["token"] };
      default:
        return {};
    }
  }

  async trackAllUserCosts(userId: string): Promise<void> {
    try {
      const connections =
        await this.connectionRepository.findByUserIdWithHealthChecks(userId);

      const batchSize = 5;
      for (let i = 0; i < connections.length; i += batchSize) {
        const batch = connections.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (connection) => {
            const result = await this.trackCostsForConnection(connection.id);
            if (result.success && result.costData) {
              await this.costMetricService.createCostMetric(connection.id, {
                amount: result.costData.amount,
                currency: result.costData.currency,
                period: result.costData.period,
                metadata: result.costData.metadata,
              });
            }
          })
        );

        // Add delay between batches to avoid rate limiting
        if (i + batchSize < connections.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      this.handleServiceError(error, "trackAllUserCosts");
    }
  }

  async getCostAnalytics(userId: string, startDate?: Date, endDate?: Date) {
    const result = await this.costMetricService.getCostAnalytics(
      userId,
      startDate,
      endDate
    );
    return result.data;
  }

  async getCostMetricsForUser(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const result = await this.costMetricService.getCostMetricsForUser(
      userId,
      startDate,
      endDate
    );
    return result.data ?? [];
  }

  async getCostMetricsForConnection(
    connectionId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const result = await this.costMetricService.getCostMetricsForConnection(
      connectionId,
      startDate,
      endDate
    );
    return result.data ?? [];
  }
}
