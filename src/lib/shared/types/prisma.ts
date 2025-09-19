import type { User as PrismaUser, Prisma } from "@prisma/client";

// Use Prisma's generated types instead of custom interfaces
export type UserWithPassword = PrismaUser;

export type UserCreateInput = Prisma.UserCreateInput;
