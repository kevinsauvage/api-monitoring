import type {
  HealthCheckWithConnectionAndSubscription,
  PaginationInfo,
} from "@/lib/core/types";
import { PLAN_LIMITS } from "@/lib/shared/utils/plan-limits";

import { BaseRepository } from "./base.repository";

import type { HealthCheck, Prisma } from "@prisma/client";

const MINIMUM_PLAN_INTERVAL_SECONDS = Math.min(
  ...Object.values(PLAN_LIMITS).map((plan) => plan.minInterval)
);

export class HealthCheckRepository extends BaseRepository {
  async findByConnectionId(connectionId: string): Promise<HealthCheck[]> {
    this.validateRequiredParams({ connectionId }, ["connectionId"]);

    return this.executeQuery(
      async () =>
        this.prisma.healthCheck.findMany({
          where: { apiConnectionId: connectionId },
          orderBy: { createdAt: "desc" },
        }),
      this.buildErrorMessage(
        "find",
        "health checks for connection",
        connectionId
      )
    );
  }

  async update(
    id: string,
    data: Prisma.HealthCheckUpdateInput
  ): Promise<HealthCheck> {
    this.validateRequiredParams({ id, data }, ["id", "data"]);

    return this.executeQuery(
      async () =>
        this.prisma.healthCheck.update({
          where: { id },
          data,
        }),
      this.buildErrorMessage("update", "health check", id)
    );
  }

  async countByUserId(userId: string): Promise<number> {
    this.validateRequiredParams({ userId }, ["userId"]);

    return this.executeQuery(
      async () =>
        this.prisma.healthCheck.count({
          where: {
            apiConnection: {
              userId,
            },
          },
        }),
      this.buildErrorMessage("count", "health checks for user", userId)
    );
  }

  async countActiveByUserId(userId: string): Promise<number> {
    this.validateRequiredParams({ userId }, ["userId"]);

    return this.executeQuery(
      async () =>
        this.prisma.healthCheck.count({
          where: {
            apiConnection: {
              userId,
            },
            isActive: true,
          },
        }),
      this.buildErrorMessage("count", "active health checks for user", userId)
    );
  }

  async findFirstByUserAndId(
    id: string,
    userId: string
  ): Promise<HealthCheck | null> {
    this.validateRequiredParams({ id, userId }, ["id", "userId"]);

    return this.executeQuery(
      async () =>
        this.prisma.healthCheck.findFirst({
          where: {
            id,
            apiConnection: {
              userId,
            },
          },
        }),
      this.buildErrorMessage("find", "health check", `${id} for user ${userId}`)
    );
  }

  async create(data: Prisma.HealthCheckCreateInput): Promise<HealthCheck> {
    this.validateRequiredParams(data, ["endpoint", "method", "apiConnection"]);

    return this.executeQuery(
      async () =>
        this.prisma.healthCheck.create({
          data,
        }),
      this.buildErrorMessage("create", "health check")
    );
  }

  async findById(id: string): Promise<HealthCheck | null> {
    this.validateRequiredParams({ id }, ["id"]);

    return this.executeQuery(
      async () =>
        this.prisma.healthCheck.findUnique({
          where: { id },
        }),
      this.buildErrorMessage("find", "health check", id)
    );
  }

  async delete(id: string): Promise<void> {
    this.validateRequiredParams({ id }, ["id"]);

    await this.executeQuery(
      async () =>
        this.prisma.healthCheck.delete({
          where: { id },
        }),
      this.buildErrorMessage("delete", "health check", id)
    );
  }

  async findDueForExecution(
    currentTime: Date
  ): Promise<Array<HealthCheckWithConnectionAndSubscription>> {
    this.validateRequiredParams({ currentTime }, ["currentTime"]);

    return this.executeQuery(
      async () =>
        this.prisma.healthCheck.findMany({
          where: {
            isActive: true,
            OR: [
              { lastExecutedAt: null },
              {
                lastExecutedAt: {
                  lte: new Date(
                    currentTime.getTime() - MINIMUM_PLAN_INTERVAL_SECONDS * 1000
                  ),
                },
              },
            ],
          },
          select: {
            id: true,
            apiConnectionId: true,
            endpoint: true,
            method: true,
            expectedStatus: true,
            timeout: true,
            interval: true,
            lastExecutedAt: true,
            apiConnection: {
              select: {
                id: true,
                isActive: true,
                user: {
                  select: {
                    id: true,
                    subscription: true,
                  },
                },
              },
            },
          },
          orderBy: { lastExecutedAt: "asc" },
        }),
      this.buildErrorMessage("find", "health checks due for execution")
    );
  }

  async findByUserIdPaginated(
    userId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    data: HealthCheck[];
    pagination: PaginationInfo;
  }> {
    this.validateRequiredParams({ userId, page, limit }, ["userId"]);

    return this.executePaginated(
      async () =>
        this.prisma.healthCheck.findMany({
          where: {
            apiConnection: {
              userId,
            },
          },
          orderBy: { createdAt: "desc" },
        }),
      page,
      limit,
      this.buildErrorMessage("find", "health checks for user", userId)
    );
  }

  async findActiveByUserId(userId: string): Promise<HealthCheck[]> {
    this.validateRequiredParams({ userId }, ["userId"]);

    return this.executeQuery(
      async () =>
        this.prisma.healthCheck.findMany({
          where: {
            apiConnection: {
              userId,
            },
            isActive: true,
          },
          orderBy: { createdAt: "desc" },
        }),
      this.buildErrorMessage("find", "active health checks for user", userId)
    );
  }

  async updateStatus(id: string, isActive: boolean): Promise<HealthCheck> {
    this.validateRequiredParams({ id, isActive }, ["id", "isActive"]);

    return this.executeQuery(
      async () =>
        this.prisma.healthCheck.update({
          where: { id },
          data: { isActive },
        }),
      this.buildErrorMessage("update", "health check status", id)
    );
  }

  async updateLastExecuted(
    id: string,
    lastExecutedAt: Date
  ): Promise<HealthCheck> {
    this.validateRequiredParams({ id, lastExecutedAt }, [
      "id",
      "lastExecutedAt",
    ]);

    return this.executeQuery(
      async () =>
        this.prisma.healthCheck.update({
          where: { id },
          data: { lastExecutedAt },
        }),
      this.buildErrorMessage("update", "health check last executed", id)
    );
  }
}
