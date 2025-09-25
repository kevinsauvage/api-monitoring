import type { AlertRepository } from "@/lib/core/repositories/alert.repository";
import {
  serializeAlertsWithHistory,
  serializeAlert,
} from "@/lib/core/serializers/alert.serializer";
import type {
  AlertWithHistory,
  AlertStats,
  AlertFilters,
  AlertDashboardData,
} from "@/lib/core/types";
import { SERVICE_IDENTIFIERS } from "@/lib/infrastructure/di/service-identifiers";

import { BaseService } from "./base.service";

import type { Prisma } from "@prisma/client";

export class AlertService extends BaseService {
  private get alertRepository(): AlertRepository {
    return this.resolve<AlertRepository>(SERVICE_IDENTIFIERS.ALERT_REPOSITORY);
  }

  async getAlerts(
    userId: string,
    filters?: AlertFilters,
    limit?: number
  ): Promise<AlertWithHistory[]> {
    try {
      const alerts = await this.alertRepository.findByUserId(
        userId,
        filters,
        limit
      );
      return serializeAlertsWithHistory(alerts);
    } catch (error) {
      this.handleServiceError(error, "getAlerts");
    }
  }

  async getAlertById(
    id: string,
    userId: string
  ): Promise<AlertWithHistory | null> {
    try {
      const alert = await this.alertRepository.findById(id, userId);
      if (!alert) return null;

      return serializeAlertsWithHistory([alert])[0];
    } catch (error) {
      this.handleServiceError(error, "getAlertById");
    }
  }

  async createAlert(
    userId: string,
    data: Prisma.AlertCreateInput
  ): Promise<AlertWithHistory> {
    try {
      const alert = await this.alertRepository.create({
        ...data,
        user: { connect: { id: userId } },
      });

      return {
        ...serializeAlert(alert),
        alertHistory: [],
        apiConnection: null,
      };
    } catch (error) {
      this.handleServiceError(error, "createAlert");
    }
  }

  async updateAlert(
    id: string,
    userId: string,
    data: Prisma.AlertUpdateInput
  ): Promise<AlertWithHistory> {
    try {
      const alert = await this.alertRepository.update(id, userId, data);
      return {
        ...serializeAlert(alert),
        alertHistory: [],
        apiConnection: null,
      };
    } catch (error) {
      this.handleServiceError(error, "updateAlert");
    }
  }

  async deleteAlert(id: string, userId: string): Promise<void> {
    try {
      await this.alertRepository.delete(id, userId);
    } catch (error) {
      this.handleServiceError(error, "deleteAlert");
    }
  }

  async toggleAlert(id: string, userId: string): Promise<AlertWithHistory> {
    try {
      const alert = await this.alertRepository.toggleActive(id, userId);
      return {
        ...serializeAlert(alert),
        alertHistory: [],
        apiConnection: null,
      };
    } catch (error) {
      this.handleServiceError(error, "toggleAlert");
    }
  }

  async getAlertStats(userId: string): Promise<AlertStats> {
    try {
      return await this.alertRepository.getStats(userId);
    } catch (error) {
      this.handleServiceError(error, "getAlertStats");
    }
  }

  async getRecentTriggeredAlerts(
    userId: string,
    limit: number = 10
  ): Promise<AlertWithHistory[]> {
    try {
      const alerts = await this.alertRepository.getRecentTriggeredAlerts(
        userId,
        limit
      );
      return serializeAlertsWithHistory(alerts);
    } catch (error) {
      this.handleServiceError(error, "getRecentTriggeredAlerts");
    }
  }

  async getAlertDashboardData(userId: string): Promise<AlertDashboardData> {
    try {
      const [alerts, stats, recentTriggered] = await Promise.all([
        this.alertRepository.findByUserId(userId),
        this.alertRepository.getStats(userId),
        this.alertRepository.getRecentTriggeredAlerts(userId, 5),
      ]);

      return {
        alerts: serializeAlertsWithHistory(alerts),
        stats,
        recentTriggered: serializeAlertsWithHistory(recentTriggered),
      };
    } catch (error) {
      this.handleServiceError(error, "getAlertDashboardData");
    }
  }

  async addAlertHistory(
    alertId: string,
    message: string,
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  ): Promise<void> {
    try {
      await this.alertRepository.addAlertHistory(alertId, message, severity);
    } catch (error) {
      this.handleServiceError(error, "addAlertHistory");
    }
  }

  async getAlertHistory(
    alertId: string,
    userId: string,
    limit?: number
  ): Promise<
    Array<{
      id: string;
      alertId: string;
      message: string;
      severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
      timestamp: string;
      resolved: boolean;
      resolvedAt: string | null;
    }>
  > {
    try {
      const history = await this.alertRepository.getAlertHistory(
        alertId,
        userId,
        limit
      );
      return history.map((item) => ({
        id: item.id,
        alertId: item.alertId,
        message: item.message,
        severity: item.severity,
        timestamp: item.timestamp.toISOString(),
        resolved: item.resolved,
        resolvedAt: item.resolvedAt?.toISOString() ?? null,
      }));
    } catch (error) {
      this.handleServiceError(error, "getAlertHistory");
    }
  }

  async markHistoryAsResolved(
    historyId: string,
    userId: string
  ): Promise<void> {
    try {
      await this.alertRepository.markHistoryAsResolved(historyId, userId);
    } catch (error) {
      this.handleServiceError(error, "markHistoryAsResolved");
    }
  }

  async getCurrentUserAlerts(
    filters?: AlertFilters,
    limit?: number
  ): Promise<AlertWithHistory[]> {
    const user = await this.requireAuth();
    return this.getAlerts(user.id, filters, limit);
  }

  async getCurrentUserAlertById(id: string): Promise<AlertWithHistory | null> {
    const user = await this.requireAuth();
    return this.getAlertById(id, user.id);
  }

  async createCurrentUserAlert(
    data: Omit<Prisma.AlertCreateInput, "user">
  ): Promise<AlertWithHistory> {
    const user = await this.requireAuth();
    return this.createAlert(user.id, data as Prisma.AlertCreateInput);
  }

  async updateCurrentUserAlert(
    id: string,
    data: Prisma.AlertUpdateInput
  ): Promise<AlertWithHistory> {
    const user = await this.requireAuth();
    return this.updateAlert(id, user.id, data);
  }

  async deleteCurrentUserAlert(id: string): Promise<void> {
    const user = await this.requireAuth();
    return this.deleteAlert(id, user.id);
  }

  async toggleCurrentUserAlert(id: string): Promise<AlertWithHistory> {
    const user = await this.requireAuth();
    return this.toggleAlert(id, user.id);
  }

  async getCurrentUserAlertStats(): Promise<AlertStats> {
    const user = await this.requireAuth();
    return this.getAlertStats(user.id);
  }

  async getCurrentUserAlertDashboardData(): Promise<AlertDashboardData> {
    const user = await this.requireAuth();
    return this.getAlertDashboardData(user.id);
  }
}
