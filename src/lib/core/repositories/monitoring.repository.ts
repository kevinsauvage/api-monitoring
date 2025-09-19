import { prisma } from "@/lib/infrastructure/database";
import type { HealthCheck, Prisma } from "@prisma/client";

export class MonitoringRepository {
  public prisma = prisma;

  /**
   * Get health checks for a connection with stats
   */
  async getHealthChecksWithStats(connectionId: string): Promise<
    Array<
      HealthCheck & {
        stats?: {
          totalChecks: number;
          successRate: number;
          averageResponseTime: number;
          recentFailures: number;
        };
      }
    >
  > {
    const healthChecks = await this.prisma.healthCheck.findMany({
      where: { apiConnectionId: connectionId },
      orderBy: { createdAt: "desc" },
    });

    // Get stats for each health check
    const healthChecksWithStats = await Promise.all(
      healthChecks.map(async (healthCheck) => {
        const stats = await this.getHealthCheckStats(healthCheck.id, 7);
        return {
          ...healthCheck,
          stats,
        };
      })
    );

    return healthChecksWithStats;
  }

  /**
   * Get aggregated statistics for a health check
   */
  async getHealthCheckStats(
    healthCheckId: string,
    days: number = 7
  ): Promise<{
    totalChecks: number;
    successRate: number;
    averageResponseTime: number;
    recentFailures: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const results = await this.prisma.checkResult.findMany({
      where: {
        healthCheckId,
        timestamp: {
          gte: startDate,
        },
      },
      orderBy: { timestamp: "desc" },
    });

    const totalChecks = results.length;
    const successfulChecks = results.filter(
      (r) => r.status === "SUCCESS"
    ).length;
    const successRate =
      totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0;
    const averageResponseTime =
      totalChecks > 0
        ? results.reduce((sum, r) => sum + r.responseTime, 0) / totalChecks
        : 0;
    const recentFailures = results.filter((r) => r.status !== "SUCCESS").length;

    return {
      totalChecks,
      successRate,
      averageResponseTime,
      recentFailures,
    };
  }

  /**
   * Get dashboard statistics for a user
   */
  async getDashboardStats(userId: string): Promise<{
    totalChecks: number;
    successRate: number;
    averageResponseTime: number;
    recentFailures: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const results = await this.prisma.checkResult.findMany({
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
      orderBy: { timestamp: "desc" },
    });

    const totalChecks = results.length;
    const successfulChecks = results.filter(
      (r) => r.status === "SUCCESS"
    ).length;
    const successRate =
      totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0;
    const averageResponseTime =
      totalChecks > 0
        ? results.reduce((sum, r) => sum + r.responseTime, 0) / totalChecks
        : 0;
    const recentFailures = results.filter((r) => r.status !== "SUCCESS").length;

    return {
      totalChecks,
      successRate,
      averageResponseTime,
      recentFailures,
    };
  }

  /**
   * Store a health check result
   */
  async storeResult(data: {
    healthCheckId: string;
    status: "SUCCESS" | "FAILURE" | "TIMEOUT" | "ERROR";
    responseTime: number;
    statusCode: number | null;
    errorMessage: string | null | undefined;
    metadata: Record<string, unknown> | null | undefined;
  }) {
    return this.prisma.checkResult.create({
      data: {
        healthCheckId: data.healthCheckId,
        status: data.status,
        responseTime: data.responseTime,
        statusCode: data.statusCode,
        errorMessage: data.errorMessage ?? null,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });
  }
}
