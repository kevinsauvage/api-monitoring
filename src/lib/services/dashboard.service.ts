import { BaseService } from "./base.service";
import type { ConnectionRepository } from "@/lib/repositories/connection.repository";
import type { HealthCheckRepository } from "@/lib/repositories/health-check.repository";
import type { CheckResultRepository } from "@/lib/repositories/check-result.repository";
import type { UserRepository } from "@/lib/repositories/user.repository";
import type { MonitoringService } from "./monitoring.service";
import { SERVICE_IDENTIFIERS } from "@/lib/di";

export class DashboardService extends BaseService {
  private get connectionRepository(): ConnectionRepository {
    return this.resolve<ConnectionRepository>(
      SERVICE_IDENTIFIERS.CONNECTION_REPOSITORY
    );
  }

  private get healthCheckRepository(): HealthCheckRepository {
    return this.resolve<HealthCheckRepository>(
      SERVICE_IDENTIFIERS.HEALTH_CHECK_REPOSITORY
    );
  }

  private get checkResultRepository(): CheckResultRepository {
    return this.resolve<CheckResultRepository>(
      SERVICE_IDENTIFIERS.CHECK_RESULT_REPOSITORY
    );
  }

  private get userRepository(): UserRepository {
    return this.resolve<UserRepository>(SERVICE_IDENTIFIERS.USER_REPOSITORY);
  }

  private get monitoringService(): MonitoringService {
    return this.resolve<MonitoringService>(
      SERVICE_IDENTIFIERS.MONITORING_SERVICE
    );
  }

  async getDashboardStats(userId: string) {
    // Get basic connection stats
    const totalConnections = await this.connectionRepository.countByUserId(
      userId
    );
    const activeConnections =
      await this.connectionRepository.countActiveByUserId(userId);
    const totalHealthChecks = await this.healthCheckRepository.countByUserId(
      userId
    );
    const monitoringStats = await this.monitoringService.getDashboardData(
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

    const userData = await this.userRepository.findByIdWithSubscription(
      user.id
    );

    return userData;
  }
}
