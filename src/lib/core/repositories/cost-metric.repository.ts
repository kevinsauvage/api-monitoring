import { BaseRepository } from "./base.repository";
import type { CostMetric, Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export class CostMetricRepository extends BaseRepository {
  async create(data: {
    apiConnectionId: string;
    amount: number;
    currency: string;
    period: string;
    metadata?: Prisma.InputJsonValue;
  }): Promise<CostMetric> {
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
            apiConnection: { connect: { id: data.apiConnectionId } },
            amount: new Decimal(data.amount),
            currency: data.currency,
            period: data.period,
            ...(data.metadata && { metadata: data.metadata }),
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

  /**
   * Find cost metrics with pagination for a user
   *
   * @param userId - The user's unique identifier
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @param startDate - Optional start date filter
   * @param endDate - Optional end date filter
   * @returns Promise resolving to paginated cost metrics
   */
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

  /**
   * Get cost metrics by provider for a user
   *
   * @param userId - The user's unique identifier
   * @param provider - The provider to filter by
   * @param startDate - Optional start date filter
   * @param endDate - Optional end date filter
   * @returns Promise resolving to cost metrics for the provider
   */
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

  /**
   * Get total cost for a user within a date range
   *
   * @param userId - The user's unique identifier
   * @param startDate - Start date for the range
   * @param endDate - End date for the range
   * @returns Promise resolving to total cost
   */
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

  /**
   * Find cost metric by ID
   *
   * @param id - The cost metric's unique identifier
   * @returns Promise resolving to cost metric or null if not found
   */
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

  /**
   * Update a cost metric
   *
   * @param id - The cost metric's unique identifier
   * @param data - Data to update
   * @returns Promise resolving to the updated cost metric
   */
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

  /**
   * Delete a cost metric by ID
   *
   * @param id - The cost metric's unique identifier
   * @returns Promise resolving when deletion is complete
   */
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
