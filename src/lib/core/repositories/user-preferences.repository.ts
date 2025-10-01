import { BaseRepository } from "./base.repository";

import type { UserPreferences, Prisma } from "@prisma/client";

export class UserPreferencesRepository extends BaseRepository {
  async findByUserId(userId: string): Promise<UserPreferences | null> {
    this.validateRequiredParams({ userId }, ["userId"]);

    return this.executeQuery(
      async () =>
        this.prisma.userPreferences.findUnique({
          where: { userId },
        }),
      this.buildErrorMessage("find", "user preferences", userId)
    );
  }

  async create(
    data: Prisma.UserPreferencesCreateInput
  ): Promise<UserPreferences> {
    this.validateRequiredParams(data, ["userId"]);

    return this.executeQuery(
      async () =>
        this.prisma.userPreferences.create({
          data,
        }),
      this.buildErrorMessage("create", "user preferences")
    );
  }

  async update(
    userId: string,
    data: Partial<Prisma.UserPreferencesUpdateInput>
  ): Promise<UserPreferences> {
    this.validateRequiredParams({ userId, data }, ["userId", "data"]);

    return this.executeQuery(
      async () =>
        this.prisma.userPreferences.upsert({
          where: { userId },
          update: data,
          create: {
            userId,
            ...data,
          } as Prisma.UserPreferencesCreateInput,
        }),
      this.buildErrorMessage("update", "user preferences", userId)
    );
  }

  async delete(userId: string): Promise<void> {
    this.validateRequiredParams({ userId }, ["userId"]);

    await this.executeQuery(
      async () =>
        this.prisma.userPreferences.delete({
          where: { userId },
        }),
      this.buildErrorMessage("delete", "user preferences", userId)
    );
  }

  async getOrCreate(userId: string): Promise<UserPreferences> {
    this.validateRequiredParams({ userId }, ["userId"]);

    return this.executeQuery(
      async () =>
        this.prisma.userPreferences.upsert({
          where: { userId },
          update: {},
          create: {
            userId,
          },
        }),
      this.buildErrorMessage("get or create", "user preferences", userId)
    );
  }
}
