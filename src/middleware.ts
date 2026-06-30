import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let token = request.cookies.get("accessToken")?.value;

  // Handle case where cookie was literally saved as the string "undefined"
  if (token === "undefined" || token === "null" || token === "") {
    token = undefined;
  }

  console.log("Middleware - Pathname:", pathname);
  console.log("Middleware - Token exists:", !!token);

  // Root → redirect to login (middleware runs first, before React renders)
  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Protected routes → must have token
  const isProtected = pathname.startsWith("/dashboard");
  if (isProtected) {
    if (!token) {
      console.log("Middleware - No token found, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }
    console.log("Middleware - Token found, allowing access to dashboard");
  }

  // Auth routes → allow access regardless of token status
  // Users can choose to login again or logout from login page
  const isAuthRoute = pathname.startsWith("/login");
  if (isAuthRoute) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.jpeg).*)",
  ],
};