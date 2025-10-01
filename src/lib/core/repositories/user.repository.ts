import type { PaginationInfo } from "@/lib/core/types";

import { BaseRepository } from "./base.repository";

import type { User, Subscription, Prisma } from "@prisma/client";

export class UserRepository extends BaseRepository {
  async findById(id: string): Promise<User | null> {
    this.validateRequiredParams({ id }, ["id"]);

    return this.executeQuery(
      async () =>
        this.prisma.user.findUnique({
          where: { id },
        }),
      this.buildErrorMessage("find", "user", id)
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    this.validateRequiredParams({ email }, ["email"]);

    return this.executeQuery(
      async () =>
        this.prisma.user.findUnique({
          where: { email },
        }),
      this.buildErrorMessage("find", "user", `email: ${email}`)
    );
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    this.validateRequiredParams(data, ["name", "email"]);

    return this.executeQuery(
      async () =>
        this.prisma.user.create({
          data,
        }),
      this.buildErrorMessage("create", "user")
    );
  }

  async findByIdWithSubscription(id: string): Promise<{
    id: string;
    name: string | null;
    email: string;
    subscription: Subscription;
  } | null> {
    this.validateRequiredParams({ id }, ["id"]);

    return this.executeQuery(
      async () =>
        this.prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            email: true,
            subscription: true,
          },
        }),
      this.buildErrorMessage("find", "user with subscription", id)
    );
  }

  async update(
    id: string,
    data: Partial<Prisma.UserUpdateInput>
  ): Promise<User> {
    this.validateRequiredParams({ id, data }, ["id", "data"]);

    return this.executeQuery(
      async () =>
        this.prisma.user.update({
          where: { id },
          data,
        }),
      this.buildErrorMessage("update", "user", id)
    );
  }

  async delete(id: string): Promise<void> {
    this.validateRequiredParams({ id }, ["id"]);

    await this.executeQuery(
      async () =>
        this.prisma.user.delete({
          where: { id },
        }),
      this.buildErrorMessage("delete", "user", id)
    );
  }

  async existsByEmail(email: string): Promise<boolean> {
    this.validateRequiredParams({ email }, ["email"]);

    const user = await this.findByEmail(email);
    return user !== null;
  }

  async count(): Promise<number> {
    return this.executeQuery(
      async () => this.prisma.user.count(),
      this.buildErrorMessage("count", "users")
    );
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 50
  ): Promise<{
    data: User[];
    pagination: PaginationInfo;
  }> {
    this.validateRequiredParams({ page, limit }, ["page", "limit"]);

    return this.executePaginated(
      async () => this.prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
      page,
      limit,
      this.buildErrorMessage("find", "users")
    );
  }

  async findBySubscription(subscription: Subscription): Promise<User[]> {
    this.validateRequiredParams({ subscription }, ["subscription"]);

    return this.executeQuery(
      async () =>
        this.prisma.user.findMany({
          where: { subscription },
          orderBy: { createdAt: "desc" },
        }),
      this.buildErrorMessage("find", "users by subscription", subscription)
    );
  }

  async updateSubscription(
    id: string,
    subscription: Subscription
  ): Promise<User> {
    this.validateRequiredParams({ id, subscription }, ["id", "subscription"]);

    return this.executeQuery(
      async () =>
        this.prisma.user.update({
          where: { id },
          data: { subscription },
        }),
      this.buildErrorMessage("update", "user subscription", id)
    );
  }
}
