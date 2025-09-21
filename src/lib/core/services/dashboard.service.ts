import { BaseService } from "./base.service";

export class DashboardService extends BaseService {
  async getDashboardStats(userId: string) {
    const totalConnections = await this.connectionRepository.countByUserId(
      userId
    );
    const activeConnections =
      await this.connectionRepository.countActiveByUserId(userId);
    const totalHealthChecks = await this.healthCheckRepository.countByUserId(
      userId
    );
    const monitoringStats = await this.monitoringRepository.getDashboardStats(
      userId
    );
    const recentResults =
      await this.checkResultRepository.findByUserIdWithDetails(userId, 50);

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
}
