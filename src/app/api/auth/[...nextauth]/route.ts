import NextAuth from "next-auth";
import { authOptions } from "@/lib/infrastructure/auth";
import type { NextRequest } from "next/server";

const handler = NextAuth(authOptions) as (
  req: NextRequest
) => Promise<Response>;

export { handler as GET, handler as POST };
