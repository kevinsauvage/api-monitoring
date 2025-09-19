import { prisma } from "@/lib/infrastructure/database";
import type { HealthCheck, Prisma } from "@prisma/client";

export class HealthCheckRepository {
  public prisma = prisma;

  async findByConnectionId(connectionId: string): Promise<HealthCheck[]> {
    return this.prisma.healthCheck.findMany({
      where: { apiConnectionId: connectionId },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(
    id: string,
    data: Prisma.HealthCheckUpdateInput
  ): Promise<HealthCheck> {
    return this.prisma.healthCheck.update({
      where: { id },
      data,
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.healthCheck.count({
      where: {
        apiConnection: {
          userId,
        },
      },
    });
  }

  async countActiveByUserId(userId: string): Promise<number> {
    return this.prisma.healthCheck.count({
      where: {
        apiConnection: {
          userId,
        },
        isActive: true,
      },
    });
  }

  async findFirstByUserAndId(
    id: string,
    userId: string
  ): Promise<HealthCheck | null> {
    return this.prisma.healthCheck.findFirst({
      where: {
        id,
        apiConnection: {
          userId,
        },
      },
    });
  }

  async create(data: Prisma.HealthCheckCreateInput): Promise<HealthCheck> {
    return this.prisma.healthCheck.create({
      data,
    });
  }

  async findById(id: string): Promise<HealthCheck | null> {
    return this.prisma.healthCheck.findUnique({
      where: { id },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.healthCheck.delete({
      where: { id },
    });
  }
}
