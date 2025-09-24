import type { DashboardStats } from "@/lib/core/types";

import { BaseService } from "./base.service";

export class DashboardService extends BaseService {
  async getDashboardStats(userId: string): Promise<DashboardStats> {
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
