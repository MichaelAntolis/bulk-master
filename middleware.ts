import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Use raw native cookies to prevent NextAuth v5 beta Edge Runtime crashes
  // Detects both v5 (authjs) and v4 (next-auth) cookie names in local and prod
  const isProd = process.env.NODE_ENV === "production" || req.url.startsWith("https://");
  
  const v5Cookie = isProd ? "__Secure-authjs.session-token" : "authjs.session-token";
  const v4Cookie = isProd ? "__Secure-next-auth.session-token" : "next-auth.session-token";
  
  const hasToken = req.cookies.has(v5Cookie) || req.cookies.has(v4Cookie);
  const isLoggedIn = hasToken;

  // Routes that don't require auth
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/food-search") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon");

  const isAuthRoute = pathname === "/login" || pathname === "/register";

  // Already logged in → redirect away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Not logged in → redirect to login
  if (!isPublicRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|public).*)",
  ],
};
