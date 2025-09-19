import { prisma } from "@/lib/infrastructure/database";
import type { User, Subscription } from "@prisma/client";
import { DatabaseError } from "@/lib/shared/errors";

export class UserRepository {
  public prisma = prisma;

  async findById(id: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new DatabaseError("Failed to find user by ID", error as Error);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findByIdWithSubscription(id: string): Promise<{
    id: string;
    name: string | null;
    email: string;
    subscription: Subscription;
  } | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        subscription: true,
      },
    });
  }
}
