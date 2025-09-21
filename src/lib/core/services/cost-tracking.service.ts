import { BaseService } from "./base.service";
import { decrypt } from "@/lib/infrastructure/encryption";
import type { InputJsonValue } from "@prisma/client/runtime/library";
import axios from "axios";

interface CostTrackingResult {
  success: boolean;
  costData?: {
    provider: string;
    amount: number;
    currency: string;
    period: string;
    metadata?: unknown;
  };
  error?: string;
}

export class CostTrackingService extends BaseService {
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
      let result: CostTrackingResult;

      switch (provider) {
        case "stripe":
          result = secretKey
            ? await this.trackStripeCosts(secretKey)
            : this.errorResult("Stripe secret key not configured");
          break;
        case "twilio":
          result =
            accountSid && authToken
              ? await this.trackTwilioCosts(accountSid, authToken)
              : this.errorResult("Twilio credentials not configured");
          break;
        case "sendgrid":
          result = apiKey
            ? this.trackSendGridCosts(apiKey)
            : this.errorResult("SendGrid API key not configured");
          break;
        case "github":
          result = token
            ? this.trackGitHubCosts(token)
            : this.errorResult("GitHub token not configured");
          break;
        case "slack":
          result = token
            ? this.trackSlackCosts(token)
            : this.errorResult("Slack token not configured");
          break;
        default:
          result = this.errorResult(
            `Cost tracking not supported for provider: ${provider}`
          );
      }

      if (result.success && result.costData) {
        await this.costMetricRepository.create({
          apiConnectionId: connectionId,
          amount: result.costData.amount,
          currency: result.costData.currency,
          period: result.costData.period,
          metadata: result.costData.metadata as InputJsonValue,
        });
      }

      return result;
    } catch (error) {
      return this.errorResult(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  private async trackStripeCosts(
    secretKey: string
  ): Promise<CostTrackingResult> {
    try {
      const { start, end, period } = this.getCurrentPeriod();
      const response = await axios.get<{
        data: Array<{ fee: number }>;
      }>(
        `https://api.stripe.com/v1/balance_transactions?created[gte]=${Math.floor(
          start.getTime() / 1000
        )}&created[lte]=${Math.floor(end.getTime() / 1000)}&limit=100`,
        { headers: { Authorization: `Bearer ${decrypt(secretKey)}` } }
      );

      const transactions = response.data.data ?? [];
      const totalFees = transactions.reduce(
        (sum, transaction) => sum + (transaction.fee ?? 0),
        0
      );

      return {
        success: true,
        costData: {
          provider: "stripe",
          amount: totalFees / 100,
          currency: "USD",
          period,
          metadata: { transactionCount: transactions.length, totalFees },
        },
      };
    } catch (error) {
      return this.errorResult(
        `Stripe cost tracking failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private async trackTwilioCosts(
    accountSid: string,
    authToken: string
  ): Promise<CostTrackingResult> {
    try {
      const { start, end, period } = this.getCurrentPeriod();
      const response = await axios.get<{
        usage_records: Array<{ price?: string }>;
      }>(
        `https://api.twilio.com/2010-04-01/Accounts/${decrypt(
          accountSid
        )}/Usage/Records.json?StartDate=${
          start.toISOString().split("T")[0]
        }&EndDate=${end.toISOString().split("T")[0]}`,
        {
          auth: { username: decrypt(accountSid), password: decrypt(authToken) },
        }
      );

      const usage = response.data.usage_records ?? [];
      const totalCost = usage.reduce(
        (sum, record) => sum + parseFloat(record.price ?? "0"),
        0
      );

      return {
        success: true,
        costData: {
          provider: "twilio",
          amount: totalCost,
          currency: "USD",
          period,
          metadata: { usageCount: usage.length },
        },
      };
    } catch (error) {
      return this.errorResult(
        `Twilio cost tracking failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private trackSendGridCosts(_apiKey: string): CostTrackingResult {
    const { period } = this.getCurrentPeriod();
    // SendGrid doesn't have direct cost API, return estimated cost
    return {
      success: true,
      costData: {
        provider: "sendgrid",
        amount: 0, // Would need to implement SendGrid billing API
        currency: "USD",
        period,
        metadata: { note: "SendGrid cost tracking not implemented" },
      },
    };
  }

  private trackGitHubCosts(_token: string): CostTrackingResult {
    const { period } = this.getCurrentPeriod();
    // GitHub doesn't have direct cost API for personal accounts
    return {
      success: true,
      costData: {
        provider: "github",
        amount: 0,
        currency: "USD",
        period,
        metadata: {
          note: "GitHub cost tracking not available for personal accounts",
        },
      },
    };
  }

  private trackSlackCosts(_token: string): CostTrackingResult {
    const { period } = this.getCurrentPeriod();
    // Slack doesn't have direct cost API
    return {
      success: true,
      costData: {
        provider: "slack",
        amount: 0,
        currency: "USD",
        period,
        metadata: { note: "Slack cost tracking not implemented" },
      },
    };
  }

  async trackAllUserCosts(userId: string): Promise<void> {
    try {
      const connections =
        await this.connectionRepository.findByUserIdWithHealthChecks(userId);

      for (const connection of connections) {
        const result = await this.trackCostsForConnection(connection.id);

        if (result.success && result.costData) {
          await this.costMetricRepository.create({
            apiConnectionId: connection.id,
            amount: result.costData.amount,
            currency: result.costData.currency,
            period: result.costData.period,
            metadata: result.costData.metadata as InputJsonValue,
          });
        }
      }
    } catch (error) {
      this.handleServiceError(error, "trackAllUserCosts");
    }
  }

  async getCostAnalytics(userId: string, startDate?: Date, endDate?: Date) {
    return this.costMetricRepository.getCostStatistics(
      userId,
      startDate,
      endDate
    );
  }

  async getCostMetricsForUser(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    return this.costMetricRepository.findByUserId(userId, startDate, endDate);
  }

  async getCostMetricsForConnection(
    connectionId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    return this.costMetricRepository.findByConnectionId(
      connectionId,
      startDate,
      endDate
    );
  }

  private errorResult(error: string): CostTrackingResult {
    return { success: false, error };
  }

  private getCurrentPeriod() {
    const now = new Date();
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        "0"
      )}`,
    };
  }
}
