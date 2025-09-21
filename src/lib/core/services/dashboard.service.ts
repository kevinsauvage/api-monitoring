import type { JsonValue } from "@prisma/client/runtime/library";
import { BaseService } from "./base.service";

export interface DashboardStats {
  totalConnections: number;
  activeConnections: number;
  totalHealthChecks: number;
  monitoringStats: {
    successRate: number;
    averageResponseTime: number;
    totalChecks: number;
    recentFailures: number;
  };
  recentResults: Array<{
    id: string;
    healthCheckId: string;
    status: "SUCCESS" | "FAILURE" | "TIMEOUT" | "ERROR";
    responseTime: number;
    statusCode: number | null;
    errorMessage: string | null;
    timestamp: Date;
    metadata: JsonValue;
    healthCheck: {
      id: string;
      endpoint: string;
      method: string;
      apiConnection: {
        provider: string;
        name: string;
      };
    };
  }>;
}

export class DashboardService extends BaseService {
  async getDashboardStats(userId: string): Promise<DashboardStats> {
    // Execute all queries in parallel for better performance
    const [
      totalConnections,
      activeConnections,
      totalHealthChecks,
      monitoringStats,
      recentResults,
    ] = await Promise.all([
      this.connectionRepository.countByUserId(userId),
      this.connectionRepository.countActiveByUserId(userId),
      this.healthCheckRepository.countByUserId(userId),
      this.monitoringRepository.getDashboardStats(userId),
      this.checkResultRepository.findByUserIdWithDetails(userId, 50),
    ]);

    return {
      totalConnections,
      activeConnections,
      totalHealthChecks,
      monitoringStats,
      recentResults,
    };
  }

  async getUser() {
    const user = await this.requireAuth();
    return this.userRepository.findByIdWithSubscription(user.id);
  }

  async getDashboardStatsForUser(userId: string): Promise<DashboardStats> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return this.getDashboardStats(userId);
  }
}
