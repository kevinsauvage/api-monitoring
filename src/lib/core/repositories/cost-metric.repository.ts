import { BaseRepository } from "./base.repository";
import type { CostMetric, Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export class CostMetricRepository extends BaseRepository {
  async create(data: Prisma.CostMetricCreateInput): Promise<CostMetric> {
    this.validateRequiredParams(data, [
      "apiConnectionId",
      "amount",
      "currency",
      "period",
    ]);

    return this.executeQuery(
      async () =>
        this.prisma.costMetric.create({
          data: {
            apiConnection: data.apiConnection,
            amount: new Decimal(data.amount.toString()),
            currency: data.currency,
            period: data.period,
            metadata: data.metadata,
          },
        }),
      this.buildErrorMessage("create", "cost metric")
    );
  }

  async findByConnectionId(
    connectionId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<CostMetric[]> {
    this.validateRequiredParams({ connectionId }, ["connectionId"]);

    const where: Prisma.CostMetricWhereInput = {
      apiConnectionId: connectionId,
    };

    if (startDate && endDate) {
      where.timestamp = {
        gte: startDate,
        lte: endDate,
      };
    }

    return this.executeQuery(
      async () =>
        this.prisma.costMetric.findMany({
          where,
          orderBy: { timestamp: "desc" },
        }),
      this.buildErrorMessage(
        "find",
        "cost metrics for connection",
        connectionId
      )
    );
  }

  async findByUserId(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<
    Array<CostMetric & { apiConnection: { name: string; provider: string } }>
  > {
    this.validateRequiredParams({ userId }, ["userId"]);

    const where: Prisma.CostMetricWhereInput = {
      apiConnection: {
        userId,
      },
    };

    if (startDate && endDate) {
      where.timestamp = {
        gte: startDate,
        lte: endDate,
      };
    }

    return this.executeQuery(
      async () =>
        this.prisma.costMetric.findMany({
          where,
          include: {
            apiConnection: {
              select: {
                name: true,
                provider: true,
              },
            },
          },
          orderBy: { timestamp: "desc" },
        }),
      this.buildErrorMessage("find", "cost metrics for user", userId)
    );
  }

  async getCostStatistics(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
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
  }> {
    this.validateRequiredParams({ userId }, ["userId"]);

    const where: Prisma.CostMetricWhereInput = {
      apiConnection: {
        userId,
      },
    };

    if (startDate && endDate) {
      where.timestamp = {
        gte: startDate,
        lte: endDate,
      };
    }

    const metrics = await this.executeQuery(
      async () =>
        this.prisma.costMetric.findMany({
          where,
          include: {
            apiConnection: {
              select: {
                provider: true,
              },
            },
          },
        }),
      this.buildErrorMessage("getCostStatistics", "cost metrics")
    );

    // Calculate statistics
    const totalCost = metrics.reduce(
      (sum, metric) => sum + Number(metric.amount),
      0
    );
    const averageCost = metrics.length > 0 ? totalCost / metrics.length : 0;

    // Group by provider
    const costByProvider = metrics.reduce<
      Array<{ provider: string; totalCost: number; count: number }>
    >((acc, metric) => {
      const provider = metric.apiConnection.provider;
      const existing = acc.find((item) => item.provider === provider);
      if (existing) {
        existing.totalCost += Number(metric.amount);
        existing.count += 1;
      } else {
        acc.push({
          provider,
          totalCost: Number(metric.amount),
          count: 1,
        });
      }
      return acc;
    }, []);

    // Group by period
    const costByPeriod = metrics.reduce<
      Array<{ period: string; totalCost: number; count: number }>
    >((acc, metric) => {
      const period = metric.period;
      const existing = acc.find((item) => item.period === period);
      if (existing) {
        existing.totalCost += Number(metric.amount);
        existing.count += 1;
      } else {
        acc.push({
          period,
          totalCost: Number(metric.amount),
          count: 1,
        });
      }
      return acc;
    }, []);

    // Group by date for trend
    const costTrend = metrics.reduce(
      (acc: Array<{ date: string; totalCost: number }>, metric) => {
        const date = metric.timestamp.toISOString().split("T")[0];
        const existing = acc.find((item) => item.date === date);
        if (existing) {
          existing.totalCost += Number(metric.amount);
        } else {
          acc.push({
            date,
            totalCost: Number(metric.amount),
          });
        }
        return acc;
      },
      []
    );

    return {
      totalCost,
      averageCost,
      costByProvider,
      costByPeriod,
      costTrend: costTrend.sort((a, b) => a.date.localeCompare(b.date)),
    };
  }

  async deleteOldMetrics(userId: string, beforeDate: Date): Promise<number> {
    this.validateRequiredParams({ userId, beforeDate }, [
      "userId",
      "beforeDate",
    ]);

    const result = await this.executeQuery(
      async () =>
        this.prisma.costMetric.deleteMany({
          where: {
            apiConnection: {
              userId,
            },
            timestamp: {
              lt: beforeDate,
            },
          },
        }),
      this.buildErrorMessage("delete", "old cost metrics for user", userId)
    );

    return result.count;
  }

  async findByUserIdPaginated(
    userId: string,
    page: number = 1,
    limit: number = 50,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    data: Array<
      CostMetric & { apiConnection: { name: string; provider: string } }
    >;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    this.validateRequiredParams({ userId, page, limit }, ["userId"]);

    return this.executePaginated(
      async () => this.findByUserId(userId, startDate, endDate),
      page,
      limit,
      this.buildErrorMessage("find", "cost metrics for user", userId)
    );
  }

  async findByProvider(
    userId: string,
    provider: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<CostMetric[]> {
    this.validateRequiredParams({ userId, provider }, ["userId", "provider"]);

    const where: Prisma.CostMetricWhereInput = {
      apiConnection: {
        userId,
        provider,
      },
    };

    if (startDate && endDate) {
      where.timestamp = {
        gte: startDate,
        lte: endDate,
      };
    }

    return this.executeQuery(
      async () =>
        this.prisma.costMetric.findMany({
          where,
          orderBy: { timestamp: "desc" },
        }),
      this.buildErrorMessage(
        "find",
        "cost metrics by provider",
        `${provider} for user ${userId}`
      )
    );
  }

  async getTotalCost(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    this.validateRequiredParams({ userId, startDate, endDate }, [
      "userId",
      "startDate",
      "endDate",
    ]);

    const metrics = await this.executeQuery(
      async () =>
        this.prisma.costMetric.findMany({
          where: {
            apiConnection: {
              userId,
            },
            timestamp: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            amount: true,
          },
        }),
      this.buildErrorMessage("get", "total cost for user", userId)
    );

    return metrics.reduce((total, metric) => total + Number(metric.amount), 0);
  }

  async findById(id: string): Promise<CostMetric | null> {
    this.validateRequiredParams({ id }, ["id"]);

    return this.executeQuery(
      async () =>
        this.prisma.costMetric.findUnique({
          where: { id },
        }),
      this.buildErrorMessage("find", "cost metric", id)
    );
  }

  async update(
    id: string,
    data: Prisma.CostMetricUpdateInput
  ): Promise<CostMetric> {
    this.validateRequiredParams({ id, data }, ["id", "data"]);

    return this.executeQuery(
      async () =>
        this.prisma.costMetric.update({
          where: { id },
          data,
        }),
      this.buildErrorMessage("update", "cost metric", id)
    );
  }

  async delete(id: string): Promise<void> {
    this.validateRequiredParams({ id }, ["id"]);

    await this.executeQuery(
      async () =>
        this.prisma.costMetric.delete({
          where: { id },
        }),
      this.buildErrorMessage("delete", "cost metric", id)
    );
  }
}
