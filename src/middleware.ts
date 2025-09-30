import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import serverEnv from "./lib/shared/env/server";

function isBasicAuthEnabled(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return serverEnv.BASIC_AUTH_ENABLED === "true";
}

function unauthorizedResponse(): NextResponse {
  const res = new NextResponse("Authentication required", { status: 401 });
  res.headers.set("WWW-Authenticate", 'Basic realm="Protected"');
  return res;
}

export function middleware(req: NextRequest): NextResponse | undefined {
  if (!isBasicAuthEnabled()) return;

  // Skip API routes and static assets
  const { pathname } = req.nextUrl;
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/assets") ||
    /\.[\w]+$/.test(pathname)
  ) {
    return;
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Basic ")) {
    return unauthorizedResponse();
  }

  try {
    const base64 = authHeader.replace("Basic ", "");
    const [username, password] = Buffer.from(base64, "base64")
      .toString()
      .split(":");

    const expectedUser = serverEnv.BASIC_AUTH_USERNAME;
    const expectedPass = serverEnv.BASIC_AUTH_PASSWORD;

    if (username !== expectedUser || password !== expectedPass) {
      return unauthorizedResponse();
    }
  } catch {
    return unauthorizedResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|assets|.*\\..*).*)"],
};
