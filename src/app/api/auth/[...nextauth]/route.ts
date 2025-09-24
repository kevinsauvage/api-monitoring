import type { NextRequest } from "next/server";

import NextAuth from "next-auth";

import { authOptions } from "@/lib/infrastructure/auth";

const handler = NextAuth(authOptions) as (
  req: NextRequest
) => Promise<Response>;

export { handler as GET, handler as POST };
