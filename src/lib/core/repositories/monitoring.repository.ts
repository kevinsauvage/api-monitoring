import type { Stats } from "@/lib/core/types";

import { BaseRepository } from "./base.repository";

import type { HealthCheck, Prisma } from "@prisma/client";

export class MonitoringRepository extends BaseRepository {
  async getHealthChecksWithStats(
    connectionId: string
  ): Promise<Array<HealthCheck & { stats?: Stats }>> {
    this.validateRequiredParams({ connectionId }, ["connectionId"]);

    return this.executeQuery(
      async () => {
        const healthChecks = await this.prisma.healthCheck.findMany({
          where: { apiConnectionId: connectionId },
          orderBy: { createdAt: "desc" },
        });

        if (healthChecks.length === 0) {
          return [];
        }

        const statsMap = await this.getAggregatedStatsForHealthChecks(
          healthChecks.map((healthCheck) => healthCheck.id),
          7
        );

        return healthChecks.map((healthCheck) => ({
          ...healthCheck,
          stats: statsMap.get(healthCheck.id) ?? this.calculateStats(0, 0, 0),
        }));
      },
      this.buildErrorMessage(
        "get",
        "health checks with stats for connection",
        connectionId
      )
    );
  }

  async getHealthCheckStats(
    healthCheckId: string,
    days: number = 7
  ): Promise<Stats> {
    this.validateRequiredParams({ healthCheckId, days }, ["healthCheckId"]);

    return this.executeQuery(
      async () => {
        const statsMap = await this.getAggregatedStatsForHealthChecks(
          [healthCheckId],
          days
        );

        return statsMap.get(healthCheckId) ?? this.calculateStats(0, 0, 0);
      },
      this.buildErrorMessage("get", "health check statistics", healthCheckId)
    );
  }

  async getDashboardStats(userId: string): Promise<Stats> {
    this.validateRequiredParams({ userId }, ["userId"]);

    return this.executeQuery(
      async () => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        const totals = await this.prisma.checkResult.aggregate({
          where: {
            healthCheck: {
              apiConnection: {
                userId,
              },
            },
            timestamp: {
              gte: startDate,
            },
          },
          _count: {
            _all: true,
          },
          _avg: {
            responseTime: true,
          },
        });

        const successCount = await this.prisma.checkResult.count({
          where: {
            healthCheck: {
              apiConnection: {
                userId,
              },
            },
            timestamp: {
              gte: startDate,
            },
            status: "SUCCESS",
          },
        });

        return this.calculateStats(
          totals._count._all,
          successCount,
          totals._avg.responseTime
        );
      },
      this.buildErrorMessage("get", "dashboard statistics for user", userId)
    );
  }

  async storeResult(data: {
    healthCheckId: string;
    status: "SUCCESS" | "FAILURE" | "TIMEOUT" | "ERROR";
    responseTime: number;
    statusCode: number | null;
    errorMessage: string | null | undefined;
    metadata: Record<string, unknown> | null | undefined;
  }) {
    this.validateRequiredParams(data, [
      "healthCheckId",
      "status",
      "responseTime",
    ]);

    return this.executeQuery(
      async () =>
        this.prisma.checkResult.create({
          data: {
            healthCheckId: data.healthCheckId,
            status: data.status,
            responseTime: data.responseTime,
            statusCode: data.statusCode,
            errorMessage: data.errorMessage ?? null,
            metadata: data.metadata as Prisma.InputJsonValue,
          },
        }),
      this.buildErrorMessage("store", "health check result", data.healthCheckId)
    );
  }

  private async getAggregatedStatsForHealthChecks(
    healthCheckIds: string[],
    days: number
  ): Promise<Map<string, Stats>> {
    if (healthCheckIds.length === 0) {
      return new Map();
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const aggregatedResults = await this.prisma.checkResult.groupBy({
      by: ["healthCheckId", "status"],
      where: {
        healthCheckId: {
          in: healthCheckIds,
        },
        timestamp: {
          gte: startDate,
        },
      },
      _count: {
        _all: true,
      },
      _avg: {
        responseTime: true,
      },
    });

    type AccumulatedStats = {
      totalChecks: number;
      successCount: number;
      weightedResponseSum: number;
    };

    const accumulatorMap = new Map<string, AccumulatedStats>();

    for (const row of aggregatedResults) {
      const accumulator = accumulatorMap.get(row.healthCheckId) ?? {
        totalChecks: 0,
        successCount: 0,
        weightedResponseSum: 0,
      };

      const count = row._count._all;

      accumulator.totalChecks += count;

      if (row.status === "SUCCESS") {
        accumulator.successCount += count;
      }

      if (typeof row._avg.responseTime === "number" && count > 0) {
        accumulator.weightedResponseSum += row._avg.responseTime * count;
      }

      accumulatorMap.set(row.healthCheckId, accumulator);
    }

    const statsMap = new Map<string, Stats>();

    for (const id of healthCheckIds) {
      const accumulator = accumulatorMap.get(id);

      if (!accumulator) {
        statsMap.set(id, this.calculateStats(0, 0, 0));
        continue;
      }

      const averageResponseTime =
        accumulator.totalChecks > 0
          ? accumulator.weightedResponseSum / accumulator.totalChecks
          : 0;

      statsMap.set(
        id,
        this.calculateStats(
          accumulator.totalChecks,
          accumulator.successCount,
          averageResponseTime
        )
      );
    }

    return statsMap;
  }

  private calculateStats(
    totalChecks: number,
    successCount: number,
    averageResponseTime: number | null
  ): Stats {
    const safeTotal = Math.max(0, totalChecks);
    const safeSuccess = Math.min(Math.max(0, successCount), safeTotal);
    const successRate = safeTotal > 0 ? (safeSuccess / safeTotal) * 100 : 0;
    const safeAverage =
      safeTotal > 0 && typeof averageResponseTime === "number"
        ? Number(averageResponseTime)
        : 0;

    return {
      totalChecks: safeTotal,
      successRate,
      averageResponseTime: safeAverage,
      recentFailures: Math.max(0, safeTotal - safeSuccess),
    };
  }
}
