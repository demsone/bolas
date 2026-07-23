import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const isLocalDevelopment = process.env.NODE_ENV !== "production"
    && (request.nextUrl.hostname === "localhost" || request.nextUrl.hostname === "127.0.0.1");

  if (request.nextUrl.pathname.startsWith("/admin") && !request.cookies.get("bolas_session")?.value && !isLocalDevelopment) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
