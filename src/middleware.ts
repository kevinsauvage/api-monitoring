import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getToken } from "next-auth/jwt";

import serverEnv from "./lib/shared/env/server";

function unauthorizedResponse(): NextResponse {
  const res = new NextResponse("Authentication required", { status: 401 });
  res.headers.set("WWW-Authenticate", 'Basic realm="Protected"');
  return res;
}

const handleAuthenticatedRoutes = async (req: NextRequest) => {
  const token = await getToken({ req });
  const isAuthPage = req.nextUrl.pathname.startsWith("/dashboard");

  if (!token && isAuthPage) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  return false;
};

export async function middleware(
  req: NextRequest
): Promise<NextResponse | undefined> {
  await handleAuthenticatedRoutes(req);

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
