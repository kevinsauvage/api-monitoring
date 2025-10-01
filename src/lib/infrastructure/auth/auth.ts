import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

import { prisma } from "@/lib/infrastructure/database";
import serverEnv from "@/lib/shared/env/server";
import { log } from "@/lib/shared/utils/logger";

import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  debug: process.env.NODE_ENV === "development",
  secret: serverEnv.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: serverEnv.GOOGLE_CLIENT_ID as string,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET as string,
    }),
    GitHubProvider({
      clientId: serverEnv.GITHUB_CLIENT_ID as string,
      clientSecret: serverEnv.GITHUB_CLIENT_SECRET as string,
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
