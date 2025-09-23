import axios from "axios";
import { decrypt } from "@/lib/infrastructure/encryption";
import type { InputJsonValue } from "@prisma/client/runtime/library";
import { BaseService } from "./base.service";
import type {
  CostTrackingStrategy,
  CostTrackingResult,
} from "@/lib/core/types";

function getCurrentPeriod() {
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

class StripeCostTrackingStrategy implements CostTrackingStrategy {
  async trackCosts(
    credentials: Record<string, string>
  ): Promise<CostTrackingResult> {
    try {
      const { start, end, period } = getCurrentPeriod();
      const response = await axios.get<{
        data: Array<{ fee: number }>;
      }>(
        `https://api.stripe.com/v1/balance_transactions?created[gte]=${Math.floor(
          start.getTime() / 1000
        )}&created[lte]=${Math.floor(end.getTime() / 1000)}&limit=100`,
        { headers: { Authorization: `Bearer ${credentials["secretKey"]}` } }
      );

      const transactions = response.data.data;
      const totalFees = transactions.reduce(
        (sum, transaction) => sum + (transaction.fee || 0),
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
      return {
        success: false,
        error: `Stripe cost tracking failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }
}

class TwilioCostTrackingStrategy implements CostTrackingStrategy {
  async trackCosts(
    credentials: Record<string, string>
  ): Promise<CostTrackingResult> {
    try {
      const { start, end, period } = getCurrentPeriod();
      const response = await axios.get<{
        usage_records: Array<{ price?: string }>;
      }>(
        `https://api.twilio.com/2010-04-01/Accounts/${
          credentials["accountSid"]
        }/Usage/Records.json?StartDate=${
          start.toISOString().split("T")[0]
        }&EndDate=${end.toISOString().split("T")[0]}`,
        {
          auth: {
            username: credentials["accountSid"],
            password: credentials["authToken"],
          },
        }
      );

      const usage = response.data.usage_records;
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
      return {
        success: false,
        error: `Twilio cost tracking failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }
}

class NoCostTrackingStrategy implements CostTrackingStrategy {
  constructor(private readonly provider: string) {}

  async trackCosts(
    _credentials: Record<string, string>
  ): Promise<CostTrackingResult> {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;

    return Promise.resolve({
      success: true,
      costData: {
        provider: this.provider,
        amount: 0,
        currency: "USD",
        period,
        metadata: { note: `${this.provider} cost tracking not implemented` },
      },
    });
  }
}

class CostTrackingStrategyFactory {
  static createStrategy(provider: string): CostTrackingStrategy {
    switch (provider) {
      case "stripe":
        return new StripeCostTrackingStrategy();
      case "twilio":
        return new TwilioCostTrackingStrategy();
      case "sendgrid":
      case "github":
      case "slack":
        return new NoCostTrackingStrategy(provider);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
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
        await this.costMetricRepository.create({
          amount: result.costData.amount,
          currency: result.costData.currency,
          period: result.costData.period,
          metadata: result.costData.metadata as InputJsonValue,
          apiConnection: { connect: { id: connectionId } },
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
              await this.costMetricRepository.create({
                apiConnection: { connect: { id: connection.id } },
                amount: result.costData.amount,
                currency: result.costData.currency,
                period: result.costData.period,
                metadata: result.costData.metadata as InputJsonValue,
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
}
