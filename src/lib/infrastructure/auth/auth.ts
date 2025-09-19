import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/infrastructure/database";
import { UserRepository } from "@/lib/core/repositories";
import { log } from "@/lib/shared/utils/logger";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials) {
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
        if (user && token && user.id) {
          token.id = user.id;
          token.subscription = user.subscription;
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
        if (token && session.user && token.id) {
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
