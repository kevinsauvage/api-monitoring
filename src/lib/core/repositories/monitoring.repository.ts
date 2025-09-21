import type { HealthCheck, Prisma } from "@prisma/client";
import { BaseRepository } from "./base.repository";

/**
 * Repository for managing monitoring and analytics data
 * Provides data access methods for monitoring operations with standardized error handling
 */
export class MonitoringRepository extends BaseRepository {
  /**
   * Get health checks for a connection with stats
   *
   * @param connectionId - The connection's unique identifier
   * @returns Promise resolving to array of health checks with statistics
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
    return this.executeQuery(async () => {
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
    }, this.buildErrorMessage("get", "health checks with stats for connection", connectionId));
  }

  /**
   * Get aggregated statistics for a health check
   *
   * @param healthCheckId - The health check's unique identifier
   * @param days - Number of days to look back (default: 7)
   * @returns Promise resolving to statistics object
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
    return this.executeQuery(async () => {
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
      const recentFailures = results.filter(
        (r) => r.status !== "SUCCESS"
      ).length;

      return {
        totalChecks,
        successRate,
        averageResponseTime,
        recentFailures,
      };
    }, this.buildErrorMessage("get", "health check statistics", healthCheckId));
  }

  /**
   * Get dashboard statistics for a user
   *
   * @param userId - The user's unique identifier
   * @returns Promise resolving to dashboard statistics object
   */
  async getDashboardStats(userId: string): Promise<{
    totalChecks: number;
    successRate: number;
    averageResponseTime: number;
    recentFailures: number;
  }> {
    return this.executeQuery(async () => {
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
      const recentFailures = results.filter(
        (r) => r.status !== "SUCCESS"
      ).length;

      return {
        totalChecks,
        successRate,
        averageResponseTime,
        recentFailures,
      };
    }, this.buildErrorMessage("get", "dashboard statistics for user", userId));
  }

  /**
   * Store a health check result
   *
   * @param data - Health check result data
   * @returns Promise resolving to the created check result
   */
  async storeResult(data: {
    healthCheckId: string;
    status: "SUCCESS" | "FAILURE" | "TIMEOUT" | "ERROR";
    responseTime: number;
    statusCode: number | null;
    errorMessage: string | null | undefined;
    metadata: Record<string, unknown> | null | undefined;
  }) {
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

  /**
   * Get performance metrics for a connection
   *
   * @param connectionId - The connection's unique identifier
   * @param days - Number of days to look back (default: 30)
   * @returns Promise resolving to performance metrics
   */
  async getPerformanceMetrics(
    connectionId: string,
    days: number = 30
  ): Promise<{
    averageResponseTime: number;
    successRate: number;
    totalRequests: number;
    uptime: number;
    errorRate: number;
  }> {
    return this.executeQuery(async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const results = await this.prisma.checkResult.findMany({
        where: {
          healthCheck: {
            apiConnectionId: connectionId,
          },
          timestamp: {
            gte: startDate,
          },
        },
      });

      const totalRequests = results.length;
      const successfulRequests = results.filter(
        (r) => r.status === "SUCCESS"
      ).length;
      const failedRequests = results.filter(
        (r) => r.status === "FAILURE"
      ).length;

      const averageResponseTime =
        totalRequests > 0
          ? results.reduce((sum, r) => sum + r.responseTime, 0) / totalRequests
          : 0;

      const successRate =
        totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
      const errorRate =
        totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0;
      const uptime = 100 - errorRate;

      return {
        averageResponseTime,
        successRate,
        totalRequests,
        uptime,
        errorRate,
      };
    }, this.buildErrorMessage("get", "performance metrics for connection", connectionId));
  }

  /**
   * Get system-wide monitoring statistics
   *
   * @returns Promise resolving to system-wide statistics
   */
  async getSystemStats(): Promise<{
    totalUsers: number;
    totalConnections: number;
    totalHealthChecks: number;
    totalCheckResults: number;
    systemUptime: number;
  }> {
    return this.executeQuery(async () => {
      const [
        totalUsers,
        totalConnections,
        totalHealthChecks,
        totalCheckResults,
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.apiConnection.count(),
        this.prisma.healthCheck.count(),
        this.prisma.checkResult.count(),
      ]);

      // Calculate system uptime based on recent check results
      const recentResults = await this.prisma.checkResult.findMany({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      });

      const systemUptime =
        recentResults.length > 0
          ? (recentResults.filter((r) => r.status === "SUCCESS").length /
              recentResults.length) *
            100
          : 100;

      return {
        totalUsers,
        totalConnections,
        totalHealthChecks,
        totalCheckResults,
        systemUptime,
      };
    }, "get system-wide monitoring statistics");
  }
}
