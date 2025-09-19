import { prisma } from "@/lib/infrastructure/database";
import type { ApiConnection, Prisma } from "@prisma/client";

export type ConnectionWithHealthChecks = Prisma.ApiConnectionGetPayload<{
  include: {
    healthChecks: {
      select: {
        id: true;
        endpoint: true;
        method: true;
        isActive: true;
        lastExecutedAt: true;
      };
    };
  };
}>;

export class ConnectionRepository {
  public prisma = prisma;

  async findByUserIdWithHealthChecks(
    userId: string
  ): Promise<ConnectionWithHealthChecks[]> {
    return this.prisma.apiConnection.findMany({
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
    });
  }

  async findByIdWithHealthChecks(
    id: string,
    userId: string
  ): Promise<ConnectionWithHealthChecks | null> {
    return this.prisma.apiConnection.findFirst({
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
    });
  }

  async create(data: Prisma.ApiConnectionCreateInput): Promise<ApiConnection> {
    return this.prisma.apiConnection.create({
      data,
    });
  }

  async updateMany(
    where: Prisma.ApiConnectionWhereInput,
    data: Prisma.ApiConnectionUpdateInput
  ): Promise<{ count: number }> {
    return this.prisma.apiConnection.updateMany({
      where,
      data,
    });
  }

  async deleteMany(
    where: Prisma.ApiConnectionWhereInput
  ): Promise<{ count: number }> {
    return this.prisma.apiConnection.deleteMany({
      where,
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.apiConnection.count({
      where: { userId },
    });
  }

  async countActiveByUserId(userId: string): Promise<number> {
    return this.prisma.apiConnection.count({
      where: {
        userId,
        isActive: true,
      },
    });
  }

  async findFirstByUserAndId(
    id: string,
    userId: string
  ): Promise<ApiConnection | null> {
    return this.prisma.apiConnection.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  async findByIdWithCredentials(id: string): Promise<{
    id: string;
    name: string;
    provider: string;
    baseUrl: string;
    apiKey: string;
    secretKey: string | null;
  } | null> {
    return this.prisma.apiConnection.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        provider: true,
        baseUrl: true,
        apiKey: true,
        secretKey: true,
      },
    });
  }

  async findByIdAndUserId(
    id: string,
    userId: string
  ): Promise<ApiConnection | null> {
    return this.prisma.apiConnection.findFirst({
      where: {
        id,
        userId,
      },
    });
  }
}
