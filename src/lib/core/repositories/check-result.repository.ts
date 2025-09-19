import { prisma } from "@/lib/infrastructure/database";
import type { CheckResult, Prisma } from "@prisma/client";

// Use Prisma's generated types instead of custom interfaces
export type CheckResultWithDetails = Prisma.CheckResultGetPayload<{
  include: {
    healthCheck: {
      select: {
        id: true;
        endpoint: true;
        method: true;
        apiConnection: {
          select: {
            name: true;
            provider: true;
          };
        };
      };
    };
  };
}>;

export class CheckResultRepository {
  public prisma = prisma;

  async findByUserIdWithDetails(
    userId: string,
    limit = 50
  ): Promise<CheckResultWithDetails[]> {
    return this.prisma.checkResult.findMany({
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
    });
  }

  async findByConnectionId(
    connectionId: string,
    limit = 100
  ): Promise<CheckResultWithDetails[]> {
    return this.prisma.checkResult.findMany({
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
    });
  }

  async findByHealthCheckId(
    healthCheckId: string,
    limit = 10
  ): Promise<CheckResult[]> {
    return this.prisma.checkResult.findMany({
      where: {
        healthCheckId,
      },
      orderBy: { timestamp: "desc" },
      take: limit,
    });
  }

  async create(data: Prisma.CheckResultCreateInput): Promise<CheckResult> {
    return this.prisma.checkResult.create({
      data,
    });
  }
}
