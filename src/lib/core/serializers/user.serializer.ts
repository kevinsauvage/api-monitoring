import type { User, Subscription } from "@prisma/client";

export interface SerializedUser {
  id: string;
  name: string | null;
  email: string;
  subscription: Subscription;
  createdAt: string;
  updatedAt: string;
}

export function serializeUser(user: User): SerializedUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    subscription: user.subscription,
    createdAt:
      user.createdAt instanceof Date
        ? user.createdAt.toISOString()
        : user.createdAt,
    updatedAt:
      user.updatedAt instanceof Date
        ? user.updatedAt.toISOString()
        : user.updatedAt,
  };
}

export function serializeUsers(users: User[]): SerializedUser[] {
  return users.map(serializeUser);
}

export interface SerializedUserWithSubscription {
  id: string;
  name: string | null;
  email: string;
  subscription: Subscription;
}

export function serializeUserWithSubscription(user: {
  id: string;
  name: string | null;
  email: string;
  subscription: Subscription;
}): SerializedUserWithSubscription {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    subscription: user.subscription,
  };
}
