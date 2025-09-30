import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

import { UserRepository } from "@/lib/core/repositories";
import { prisma } from "@/lib/infrastructure/database";
import { envPrivate } from "@/lib/shared/utils/env";
import { log } from "@/lib/shared/utils/logger";

import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  debug: process.env.NODE_ENV === "development",
  secret: envPrivate().NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: envPrivate().GOOGLE_CLIENT_ID,
      clientSecret: envPrivate().GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: envPrivate().GITHUB_CLIENT_ID,
      clientSecret: envPrivate().GITHUB_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const userRepository = new UserRepository();
        const user = await userRepository.findByEmail(credentials.email);

        if (!user) {
          return null;
        }

        // For OAuth users, they don't have a password
        if (!user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          subscription: user.subscription,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    jwt({ token, user }) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (user) {
          token.id = user.id;
          token.subscription = user.subscription ?? "HOBBY";
        }
        return token;
      } catch (error) {
        log.error("JWT callback error", {
          error: error instanceof Error ? error.message : String(error),
        });
        return token;
      }
    },
    session({ session, token }) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (token && session.user) {
          session.user.id = token.id;
          session.user.subscription = token.subscription as string;
        }
        return session;
      } catch (error) {
        log.error("Session callback error", {
          error: error instanceof Error ? error.message : String(error),
        });
        return session;
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
