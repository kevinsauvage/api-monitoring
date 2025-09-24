import type { ApiResult } from "@/lib/shared/types/api-results";

import { BaseService } from "./base.service";
import { ServiceResponseBuilder } from "./service-response-builder";

import type { CostMetric } from "@prisma/client";
import type { InputJsonValue } from "@prisma/client/runtime/library";

export class CostMetricService extends BaseService {
  async createCostMetric(
    connectionId: string,
    data: {
      amount: number;
      currency: string;
      period: string;
      metadata?: unknown;
    }
  ): Promise<ApiResult<CostMetric>> {
    try {
      const costMetric = await this.costMetricRepository.create({
        amount: data.amount,
        currency: data.currency,
        period: data.period,
        metadata: data.metadata as InputJsonValue,
        apiConnection: {
          connect: { id: connectionId },
        },
      });

      return ServiceResponseBuilder.success(
        costMetric,
        "Cost metric created successfully"
      );
    } catch (error) {
      return ServiceResponseBuilder.error(error, "createCostMetric");
    }
  }

  async getCostMetricsForUser(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<
    ApiResult<
      Array<
        CostMetric & {
          apiConnection: { id: string; name: string; provider: string };
        }
      >
    >
  > {
    try {
      const costMetrics = await this.costMetricRepository.findByUserId(
        userId,
        startDate,
        endDate
      );

      return ServiceResponseBuilder.success(costMetrics);
    } catch (error) {
      return ServiceResponseBuilder.error(error, "getCostMetricsForUser");
    }
  }

  async getCostMetricsForConnection(
    connectionId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ApiResult<CostMetric[]>> {
    try {
      const costMetrics = await this.costMetricRepository.findByConnectionId(
        connectionId,
        startDate,
        endDate
      );

      return ServiceResponseBuilder.success(costMetrics);
    } catch (error) {
      return ServiceResponseBuilder.error(error, "getCostMetricsForConnection");
    }
  }

  async getCostAnalytics(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<
    ApiResult<{
      totalCost: number;
      averageCost: number;
      costByProvider: Array<{
        provider: string;
        totalCost: number;
        count: number;
      }>;
      costByPeriod: Array<{
        period: string;
        totalCost: number;
        count: number;
      }>;
      costTrend: Array<{
        date: string;
        totalCost: number;
      }>;
    }>
  > {
    try {
      const analytics = await this.costMetricRepository.getCostStatistics(
        userId,
        startDate,
        endDate
      );

      return ServiceResponseBuilder.success(analytics);
    } catch (error) {
      return ServiceResponseBuilder.error(error, "getCostAnalytics");
    }
  }

  async getCostMetricsByPeriod(
    userId: string,
    period: string
  ): Promise<ApiResult<CostMetric[]>> {
    try {
      const costMetrics = await this.costMetricRepository.findByPeriod(
        userId,
        period
      );

      return ServiceResponseBuilder.success(costMetrics);
    } catch (error) {
      return ServiceResponseBuilder.error(error, "getCostMetricsByPeriod");
    }
  }

  async deleteCostMetricsForConnection(
    connectionId: string
  ): Promise<ApiResult<void>> {
    try {
      await this.costMetricRepository.deleteByConnectionId(connectionId);

      return ServiceResponseBuilder.success(
        undefined,
        "Cost metrics deleted successfully"
      );
    } catch (error) {
      return ServiceResponseBuilder.error(
        error,
        "deleteCostMetricsForConnection"
      );
    }
  }

  async getLatestCostMetricForConnection(
    connectionId: string
  ): Promise<ApiResult<CostMetric | null>> {
    try {
      const costMetric =
        await this.costMetricRepository.findLatestByConnectionId(connectionId);

      return ServiceResponseBuilder.success(costMetric);
    } catch (error) {
      return ServiceResponseBuilder.error(
        error,
        "getLatestCostMetricForConnection"
      );
    }
  }

  async getCostMetricsCount(userId: string): Promise<ApiResult<number>> {
    try {
      const count = await this.costMetricRepository.countByUserId(userId);

      return ServiceResponseBuilder.success(count);
    } catch (error) {
      return ServiceResponseBuilder.error(error, "getCostMetricsCount");
    }
  }

  async batchCreateCostMetrics(
    metrics: Array<{
      connectionId: string;
      amount: number;
      currency: string;
      period: string;
      metadata?: unknown;
    }>
  ): Promise<ApiResult<CostMetric[]>> {
    try {
      const createdMetrics = await Promise.all(
        metrics.map(async (metric) =>
          this.costMetricRepository.create({
            amount: metric.amount,
            currency: metric.currency,
            period: metric.period,
            metadata: metric.metadata as InputJsonValue,
            apiConnection: {
              connect: { id: metric.connectionId },
            },
          })
        )
      );

      return ServiceResponseBuilder.success(
        createdMetrics,
        "Cost metrics created successfully"
      );
    } catch (error) {
      return ServiceResponseBuilder.error(error, "batchCreateCostMetrics");
    }
  }
}
