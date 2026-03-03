import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route protection middleware
 * - Most of the site is PUBLIC so visitors can browse freely
 * - Only action/personal routes require authentication
 * - Admin routes require admin role
 */

// Routes that REQUIRE authentication (everything else is public)
const protectedRoutes = [
  "/dashboard",
  "/orders",
  "/quotations/request",
  "/profile",
];

// Routes that require admin role
const adminRoutes = ["/admin"];

// Auth pages — redirect if already logged in
const authPages = ["/login", "/register", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the auth token from cookies
  const token = request.cookies.get("alumate_token")?.value;

  // Static files and API routes — skip middleware
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Check if this is an admin route
  const isAdminRoute = adminRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Check if this is an auth page
  const isAuthPage = authPages.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Protected or admin routes — require token
  if ((isProtectedRoute || isAdminRoute) && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Auth pages — redirect to dashboard if already logged in
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Everything else is public — allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
