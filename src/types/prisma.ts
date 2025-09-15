import { User as PrismaUser } from "@prisma/client";

export interface UserWithPassword extends PrismaUser {
  password: string | null;
}

export interface UserCreateInput {
  name: string;
  email: string;
  password: string;
  subscription?: "HOBBY" | "STARTUP" | "BUSINESS";
}
