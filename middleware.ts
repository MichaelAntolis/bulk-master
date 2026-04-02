import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export default auth(function middleware(req) {
  const session = (req as NextRequest & { auth: { user?: { id: string } } | null }).auth;
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!session?.user;

  // Routes that don't require auth
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/food-search") || // public food proxy
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon");

  // Already logged in → redirect away from auth pages
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Not logged in → redirect to login
  if (!isPublicRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|public).*)",
  ],
};
