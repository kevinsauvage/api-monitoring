import type { ApiConnection, Prisma } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import type { ConnectionWithHealthChecks } from "@/lib/core/types";

export class ConnectionRepository extends BaseRepository {
  async findByUserIdWithHealthChecks(
    userId: string
  ): Promise<ConnectionWithHealthChecks[]> {
    this.validateRequiredParams({ userId }, ["userId"]);

    return this.executeQuery(
      async () =>
        this.prisma.apiConnection.findMany({
          where: { userId },
          include: {
            healthChecks: {
              select: {
                id: true,
                endpoint: true,
                method: true,
                isActive: true,
                lastExecutedAt: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
      this.buildErrorMessage("find", "connections for user", userId)
    );
  }

  async findByIdWithHealthChecks(
    id: string,
    userId: string
  ): Promise<ConnectionWithHealthChecks | null> {
    this.validateRequiredParams({ id, userId }, ["id", "userId"]);

    return this.executeQuery(
      async () =>
        this.prisma.apiConnection.findFirst({
          where: {
            id,
            userId,
          },
          include: {
            healthChecks: {
              select: {
                id: true,
                endpoint: true,
                method: true,
                isActive: true,
                lastExecutedAt: true,
              },
            },
          },
        }),
      this.buildErrorMessage(
        "find",
        "connection with health checks",
        `${id} for user ${userId}`
      )
    );
  }

  async create(data: Prisma.ApiConnectionCreateInput): Promise<ApiConnection> {
    this.validateRequiredParams(data, [
      "name",
      "provider",
      "baseUrl",
      "userId",
    ]);

    return this.executeQuery(
      async () =>
        this.prisma.apiConnection.create({
          data,
        }),
      this.buildErrorMessage("create", "connection")
    );
  }

  async updateMany(
    where: Prisma.ApiConnectionWhereInput,
    data: Prisma.ApiConnectionUpdateInput
  ): Promise<{ count: number }> {
    this.validateRequiredParams({ where, data }, ["where", "data"]);

    return this.executeQuery(
      async () =>
        this.prisma.apiConnection.updateMany({
          where,
          data,
        }),
      this.buildErrorMessage("update", "multiple connections")
    );
  }

  async deleteMany(
    where: Prisma.ApiConnectionWhereInput
  ): Promise<{ count: number }> {
    this.validateRequiredParams({ where }, ["where"]);

    return this.executeQuery(
      async () =>
        this.prisma.apiConnection.deleteMany({
          where,
        }),
      this.buildErrorMessage("delete", "multiple connections")
    );
  }

  async countByUserId(userId: string): Promise<number> {
    this.validateRequiredParams({ userId }, ["userId"]);

    return this.executeQuery(
      async () =>
        this.prisma.apiConnection.count({
          where: { userId },
        }),
      this.buildErrorMessage("count", "connections for user", userId)
    );
  }

  async countActiveByUserId(userId: string): Promise<number> {
    this.validateRequiredParams({ userId }, ["userId"]);

    return this.executeQuery(
      async () =>
        this.prisma.apiConnection.count({
          where: {
            userId,
            isActive: true,
          },
        }),
      this.buildErrorMessage("count", "active connections for user", userId)
    );
  }

  async findFirstByUserAndId(
    id: string,
    userId: string
  ): Promise<ApiConnection | null> {
    this.validateRequiredParams({ id, userId }, ["id", "userId"]);

    return this.executeQuery(
      async () =>
        this.prisma.apiConnection.findFirst({
          where: {
            id,
            userId,
          },
        }),
      this.buildErrorMessage("find", "connection", `${id} for user ${userId}`)
    );
  }

  async findByIdWithCredentials(id: string): Promise<{
    id: string;
    name: string;
    provider: string;
    baseUrl: string;
    apiKey: string | null;
    secretKey: string | null;
    accountSid: string | null;
    authToken: string | null;
    token: string | null;
  } | null> {
    this.validateRequiredParams({ id }, ["id"]);

    return this.executeQuery(
      async () =>
        this.prisma.apiConnection.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            provider: true,
            baseUrl: true,
            apiKey: true,
            secretKey: true,
            accountSid: true,
            authToken: true,
            token: true,
          },
        }),
      this.buildErrorMessage("find", "connection with credentials", id)
    );
  }

  async update(
    id: string,
    data: Prisma.ApiConnectionUpdateInput
  ): Promise<ApiConnection> {
    this.validateRequiredParams({ id, data }, ["id", "data"]);

    return this.executeQuery(
      async () =>
        this.prisma.apiConnection.update({
          where: { id },
          data,
        }),
      this.buildErrorMessage("update", "connection", id)
    );
  }

  async delete(id: string): Promise<void> {
    this.validateRequiredParams({ id }, ["id"]);

    await this.executeQuery(
      async () =>
        this.prisma.apiConnection.delete({
          where: { id },
        }),
      this.buildErrorMessage("delete", "connection", id)
    );
  }
}
