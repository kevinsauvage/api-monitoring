import type { User, Subscription } from "@prisma/client";
import { BaseRepository } from "./base.repository";

/**
 * Repository for managing User entities
 * Provides data access methods for user operations with standardized error handling
 */
export class UserRepository extends BaseRepository {
  /**
   * Find a user by their unique ID
   *
   * @param id - The user's unique identifier
   * @returns Promise resolving to the user or null if not found
   */
  async findById(id: string): Promise<User | null> {
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
      "count users"
    );
  }
}
