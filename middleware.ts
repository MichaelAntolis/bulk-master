import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

// Initialize NextAuth with the edge-compatible config
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Routes that don't require auth
  const isPublicRoute =
    nextUrl.pathname === "/" ||
    nextUrl.pathname === "/login" ||
    nextUrl.pathname === "/register" ||
    nextUrl.pathname.startsWith("/api/auth") ||
    nextUrl.pathname.startsWith("/api/food-search") ||
    nextUrl.pathname.startsWith("/_next") ||
    nextUrl.pathname.startsWith("/images") ||
    nextUrl.pathname.startsWith("/favicon");

  const isAuthRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/register";

  // Already logged in → redirect away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Not logged in → redirect to login
  if (!isPublicRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|public).*)",
  ],
};
