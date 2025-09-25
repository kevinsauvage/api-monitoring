import { BaseRepository } from "./base.repository";

import type {
  Alert,
  AlertHistory,
  AlertType,
  AlertSeverity,
  Prisma,
} from "@prisma/client";

export interface AlertWithHistory extends Alert {
  alertHistory: AlertHistory[];
  apiConnection?: {
    id: string;
    name: string;
    baseUrl: string;
  } | null;
}

export interface AlertStats {
  totalAlerts: number;
  activeAlerts: number;
  triggeredAlerts: number;
  resolvedAlerts: number;
}

export interface AlertFilters {
  type?: AlertType;
  isActive?: boolean;
  apiConnectionId?: string;
  severity?: AlertSeverity;
}

export class AlertRepository extends BaseRepository {
  async findByUserId(
    userId: string,
    filters?: AlertFilters,
    limit?: number
  ): Promise<AlertWithHistory[]> {
    this.validateRequiredParams({ userId }, ["userId"]);

    return this.executeQuery(async () => {
      const where: Prisma.AlertWhereInput = {
        userId,
        ...(filters?.type && { type: filters.type }),
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
        ...(filters?.apiConnectionId && {
          apiConnectionId: filters.apiConnectionId,
        }),
      };

      return this.prisma.alert.findMany({
        where,
        include: {
          alertHistory: {
            orderBy: { timestamp: "desc" },
            take: 5, // Get last 5 history entries
          },
          apiConnection: {
            select: {
              id: true,
              name: true,
              baseUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        ...(limit && { take: limit }),
      });
    }, this.buildErrorMessage("find", "alerts for user", userId));
  }

  async findById(id: string, userId: string): Promise<AlertWithHistory | null> {
    this.validateRequiredParams({ id, userId }, ["id", "userId"]);

    return this.executeQuery(
      async () =>
        this.prisma.alert.findFirst({
          where: { id, userId },
          include: {
            alertHistory: {
              orderBy: { timestamp: "desc" },
            },
            apiConnection: {
              select: {
                id: true,
                name: true,
                baseUrl: true,
              },
            },
          },
        }),
      this.buildErrorMessage("find", "alert", id)
    );
  }

  async create(data: Prisma.AlertCreateInput): Promise<Alert> {
    this.validateRequiredParams({ data }, ["data"]);

    return this.executeQuery(
      async () => this.prisma.alert.create({ data }),
      this.buildErrorMessage("create", "alert")
    );
  }

  async update(
    id: string,
    userId: string,
    data: Prisma.AlertUpdateInput
  ): Promise<Alert> {
    this.validateRequiredParams({ id, userId, data }, ["id", "userId", "data"]);

    return this.executeQuery(
      async () =>
        this.prisma.alert.update({
          where: { id, userId },
          data,
        }),
      this.buildErrorMessage("update", "alert", id)
    );
  }

  async delete(id: string, userId: string): Promise<void> {
    this.validateRequiredParams({ id, userId }, ["id", "userId"]);

    return this.executeQuery(async () => {
      await this.prisma.alert.delete({
        where: { id, userId },
      });
    }, this.buildErrorMessage("delete", "alert", id));
  }

  async toggleActive(id: string, userId: string): Promise<Alert> {
    this.validateRequiredParams({ id, userId }, ["id", "userId"]);

    return this.executeQuery(async () => {
      const alert = await this.prisma.alert.findFirst({
        where: { id, userId },
      });

      if (!alert) {
        throw new Error("Alert not found");
      }

      return this.prisma.alert.update({
        where: { id, userId },
        data: { isActive: !alert.isActive },
      });
    }, this.buildErrorMessage("toggle", "alert", id));
  }

  async getStats(userId: string): Promise<AlertStats> {
    this.validateRequiredParams({ userId }, ["userId"]);

    return this.executeQuery(async () => {
      const [totalAlerts, activeAlerts, triggeredAlerts, resolvedAlerts] =
        await Promise.all([
          this.prisma.alert.count({ where: { userId } }),
          this.prisma.alert.count({ where: { userId, isActive: true } }),
          this.prisma.alert.count({
            where: { userId, lastTriggered: { not: null } },
          }),
          this.prisma.alertHistory.count({
            where: {
              alert: { userId },
              resolved: true,
            },
          }),
        ]);

      return {
        totalAlerts,
        activeAlerts,
        triggeredAlerts,
        resolvedAlerts,
      };
    }, this.buildErrorMessage("get", "alert stats for user", userId));
  }

  async addAlertHistory(
    alertId: string,
    message: string,
    severity: AlertSeverity
  ): Promise<AlertHistory> {
    this.validateRequiredParams({ alertId, message, severity }, [
      "alertId",
      "message",
      "severity",
    ]);

    return this.executeQuery(
      async () =>
        this.prisma.alertHistory.create({
          data: {
            alertId,
            message,
            severity,
          },
        }),
      this.buildErrorMessage("create", "alert history for alert", alertId)
    );
  }

  async getAlertHistory(
    alertId: string,
    userId: string,
    limit?: number
  ): Promise<AlertHistory[]> {
    this.validateRequiredParams({ alertId, userId }, ["alertId", "userId"]);

    return this.executeQuery(
      async () =>
        this.prisma.alertHistory.findMany({
          where: {
            alertId,
            alert: { userId },
          },
          orderBy: { timestamp: "desc" },
          ...(limit && { take: limit }),
        }),
      this.buildErrorMessage("find", "alert history for alert", alertId)
    );
  }

  async markHistoryAsResolved(
    historyId: string,
    userId: string
  ): Promise<AlertHistory> {
    this.validateRequiredParams({ historyId, userId }, ["historyId", "userId"]);

    return this.executeQuery(
      async () =>
        this.prisma.alertHistory.update({
          where: {
            id: historyId,
            alert: { userId },
          },
          data: {
            resolved: true,
            resolvedAt: new Date(),
          },
        }),
      this.buildErrorMessage("update", "alert history", historyId)
    );
  }

  async getRecentTriggeredAlerts(
    userId: string,
    limit: number = 10
  ): Promise<AlertWithHistory[]> {
    this.validateRequiredParams({ userId }, ["userId"]);

    return this.executeQuery(
      async () =>
        this.prisma.alert.findMany({
          where: {
            userId,
            lastTriggered: { not: null },
          },
          include: {
            alertHistory: {
              where: { resolved: false },
              orderBy: { timestamp: "desc" },
              take: 1,
            },
            apiConnection: {
              select: {
                id: true,
                name: true,
                baseUrl: true,
              },
            },
          },
          orderBy: { lastTriggered: "desc" },
          take: limit,
        }),
      this.buildErrorMessage("find", "recent triggered alerts for user", userId)
    );
  }

  async countByUserId(userId: string): Promise<number> {
    this.validateRequiredParams({ userId }, ["userId"]);

    return this.executeQuery(
      async () => this.prisma.alert.count({ where: { userId } }),
      this.buildErrorMessage("count", "alerts for user", userId)
    );
  }

  async countActiveByUserId(userId: string): Promise<number> {
    this.validateRequiredParams({ userId }, ["userId"]);

    return this.executeQuery(
      async () =>
        this.prisma.alert.count({ where: { userId, isActive: true } }),
      this.buildErrorMessage("count", "active alerts for user", userId)
    );
  }
}
