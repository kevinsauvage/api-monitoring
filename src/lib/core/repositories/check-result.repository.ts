import type { CheckResult, Prisma } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import type { CheckResultWithDetails, PaginationInfo } from "@/lib/core/types";

export class CheckResultRepository extends BaseRepository {
  async findByUserIdWithDetails(
    userId: string,
    limit = 50
  ): Promise<CheckResultWithDetails[]> {
    this.validateRequiredParams({ userId, limit }, ["userId", "limit"]);

    return this.executeQuery(
      async () =>
        this.prisma.checkResult.findMany({
          where: {
            healthCheck: {
              apiConnection: {
                userId,
              },
            },
          },
          orderBy: { timestamp: "desc" },
          take: limit,
          include: {
            healthCheck: {
              select: {
                id: true,
                endpoint: true,
                method: true,
                apiConnection: {
                  select: {
                    name: true,
                    provider: true,
                  },
                },
              },
            },
          },
        }),
      this.buildErrorMessage("find", "check results for user", userId)
    );
  }

  async findByConnectionId(
    connectionId: string,
    limit = 100
  ): Promise<CheckResultWithDetails[]> {
    this.validateRequiredParams({ connectionId, limit }, [
      "connectionId",
      "limit",
    ]);
    return this.executeQuery(
      async () =>
        this.prisma.checkResult.findMany({
          where: {
            healthCheck: {
              apiConnectionId: connectionId,
            },
          },
          orderBy: { timestamp: "desc" },
          take: limit,
          include: {
            healthCheck: {
              select: {
                id: true,
                endpoint: true,
                method: true,
                apiConnection: {
                  select: {
                    name: true,
                    provider: true,
                  },
                },
              },
            },
          },
        }),
      this.buildErrorMessage(
        "find",
        "check results for connection",
        connectionId
      )
    );
  }

  async findByHealthCheckId(
    healthCheckId: string,
    limit = 10
  ): Promise<CheckResult[]> {
    this.validateRequiredParams({ healthCheckId, limit }, [
      "healthCheckId",
      "limit",
    ]);
    return this.executeQuery(
      async () =>
        this.prisma.checkResult.findMany({
          where: {
            healthCheckId,
          },
          orderBy: { timestamp: "desc" },
          take: limit,
        }),
      this.buildErrorMessage(
        "find",
        "check results for health check",
        healthCheckId
      )
    );
  }

  async create(data: Prisma.CheckResultCreateInput): Promise<CheckResult> {
    this.validateRequiredParams(data, [
      "healthCheckId",
      "status",
      "responseTime",
    ]);

    return this.executeQuery(
      async () =>
        this.prisma.checkResult.create({
          data,
        }),
      this.buildErrorMessage("create", "check result")
    );
  }

  async findById(id: string): Promise<CheckResult | null> {
    this.validateRequiredParams({ id }, ["id"]);

    return this.executeQuery(
      async () =>
        this.prisma.checkResult.findUnique({
          where: { id },
        }),
      this.buildErrorMessage("find", "check result", id)
    );
  }

  async update(
    id: string,
    data: Prisma.CheckResultUpdateInput
  ): Promise<CheckResult> {
    this.validateRequiredParams({ id }, ["id"]);

    return this.executeQuery(
      async () =>
        this.prisma.checkResult.update({
          where: { id },
          data,
        }),
      this.buildErrorMessage("update", "check result", id)
    );
  }

  async delete(id: string): Promise<void> {
    this.validateRequiredParams({ id }, ["id"]);

    await this.executeQuery(
      async () =>
        this.prisma.checkResult.delete({
          where: { id },
        }),
      this.buildErrorMessage("delete", "check result", id)
    );
  }

  async deleteMany(
    where: Prisma.CheckResultWhereInput
  ): Promise<{ count: number }> {
    return this.executeQuery(
      async () =>
        this.prisma.checkResult.deleteMany({
          where,
        }),
      this.buildErrorMessage("delete", "multiple check results")
    );
  }

  async countByUserId(userId: string): Promise<number> {
    this.validateRequiredParams({ userId }, ["userId"]);

    return this.executeQuery(
      async () =>
        this.prisma.checkResult.count({
          where: {
            healthCheck: {
              apiConnection: {
                userId,
              },
            },
          },
        }),
      this.buildErrorMessage("count", "check results for user", userId)
    );
  }

  async findByUserIdPaginated(
    userId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    data: CheckResultWithDetails[];
    pagination: PaginationInfo;
  }> {
    this.validateRequiredParams({ userId, page, limit }, ["userId"]);

    return this.executePaginated(
      async () => this.findByUserIdWithDetails(userId, limit * 10), // Get more data for accurate pagination
      page,
      limit,
      this.buildErrorMessage("find", "check results for user", userId)
    );
  }
}
