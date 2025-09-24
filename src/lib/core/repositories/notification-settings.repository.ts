import type { NotificationSettings, Prisma } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export class NotificationSettingsRepository extends BaseRepository {
  async findByUserId(userId: string): Promise<NotificationSettings | null> {
    this.validateRequiredParams({ userId }, ["userId"]);

    return this.executeQuery(
      async () =>
        this.prisma.notificationSettings.findUnique({
          where: { userId },
        }),
      this.buildErrorMessage("find", "notification settings", userId)
    );
  }

  async create(
    data: Prisma.NotificationSettingsCreateInput
  ): Promise<NotificationSettings> {
    this.validateRequiredParams(data, ["userId"]);

    return this.executeQuery(
      async () =>
        this.prisma.notificationSettings.create({
          data,
        }),
      this.buildErrorMessage("create", "notification settings")
    );
  }

  async update(
    userId: string,
    data: Partial<Prisma.NotificationSettingsUpdateInput>
  ): Promise<NotificationSettings> {
    this.validateRequiredParams({ userId, data }, ["userId", "data"]);

    return this.executeQuery(
      async () =>
        this.prisma.notificationSettings.upsert({
          where: { userId },
          update: data,
          create: {
            userId,
            ...data,
          } as Prisma.NotificationSettingsCreateInput,
        }),
      this.buildErrorMessage("update", "notification settings", userId)
    );
  }

  async delete(userId: string): Promise<void> {
    this.validateRequiredParams({ userId }, ["userId"]);

    await this.executeQuery(
      async () =>
        this.prisma.notificationSettings.delete({
          where: { userId },
        }),
      this.buildErrorMessage("delete", "notification settings", userId)
    );
  }

  async getOrCreate(userId: string): Promise<NotificationSettings> {
    this.validateRequiredParams({ userId }, ["userId"]);

    return this.executeQuery(
      async () =>
        this.prisma.notificationSettings.upsert({
          where: { userId },
          update: {},
          create: {
            userId,
          },
        }),
      this.buildErrorMessage("get or create", "notification settings", userId)
    );
  }
}

