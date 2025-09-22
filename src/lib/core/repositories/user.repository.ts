import type { User, Subscription } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export class UserRepository extends BaseRepository {
  /**
   * Find a user by their unique ID
   *
   * @param id - The user's unique identifier
   * @returns Promise resolving to the user or null if not found
   */
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

  /**
   * Find a user by their email address
   *
   * @param email - The user's email address
   * @returns Promise resolving to the user or null if not found
   */
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

  /**
   * Create a new user with the provided data
   *
   * @param data - User creation data
   * @returns Promise resolving to the created user
   */
  async create(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    this.validateRequiredParams(data, ["name", "email", "password"]);

    return this.executeQuery(
      async () =>
        this.prisma.user.create({
          data,
        }),
      this.buildErrorMessage("create", "user")
    );
  }

  /**
   * Find a user by ID with their subscription information
   *
   * @param id - The user's unique identifier
   * @returns Promise resolving to user with subscription or null if not found
   */
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

  /**
   * Update a user's information
   *
   * @param id - The user's unique identifier
   * @param data - Partial user data to update
   * @returns Promise resolving to the updated user
   */
  async update(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      subscription: Subscription;
    }>
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

  /**
   * Delete a user by their ID
   *
   * @param id - The user's unique identifier
   * @returns Promise resolving when deletion is complete
   */
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

  /**
   * Check if a user exists by email
   *
   * @param email - The email address to check
   * @returns Promise resolving to true if user exists, false otherwise
   */
  async existsByEmail(email: string): Promise<boolean> {
    this.validateRequiredParams({ email }, ["email"]);

    const user = await this.findByEmail(email);
    return user !== null;
  }

  /**
   * Get user count for analytics
   *
   * @returns Promise resolving to the total number of users
   */
  async count(): Promise<number> {
    return this.executeQuery(
      async () => this.prisma.user.count(),
      this.buildErrorMessage("count", "users")
    );
  }

  /**
   * Find all users with pagination
   *
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Promise resolving to paginated users
   */
  async findAllPaginated(
    page: number = 1,
    limit: number = 50
  ): Promise<{
    data: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    this.validateRequiredParams({ page, limit }, ["page", "limit"]);

    return this.executePaginated(
      async () => this.prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
      page,
      limit,
      this.buildErrorMessage("find", "users")
    );
  }

  /**
   * Find users by subscription type
   *
   * @param subscription - The subscription type to filter by
   * @returns Promise resolving to array of users with the specified subscription
   */
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

  /**
   * Update user subscription
   *
   * @param id - The user's unique identifier
   * @param subscription - The new subscription type
   * @returns Promise resolving to the updated user
   */
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
