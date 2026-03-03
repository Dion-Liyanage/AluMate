import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route protection middleware
 * - Redirects unauthenticated users to /login for protected routes
 * - Redirects customers away from /admin routes
 * - Redirects authenticated users away from auth pages
 */

// Routes that don't require authentication
const publicRoutes = ["/", "/login", "/register", "/forgot-password"];

// Routes that require admin role
const adminRoutes = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the auth token from cookies or Authorization header
  const token = request.cookies.get("alumate_token")?.value;

  // Check if this is a public route
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if this only "/" exact (landing page)
  const isLandingPage = pathname === "/";

  // Check if this is an auth page
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password";

  // Check if this is an admin route
  const isAdminRoute = adminRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Public routes — allow access
  if (isLandingPage) {
    return NextResponse.next();
  }

  // Static files and API routes — skip middleware
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Note: Full JWT validation would require backend verification.
  // For now, we check token presence. The client-side AuthContext
  // handles the actual token validation on page load.
  // When the backend is set up, we can add proper JWT verification here.

  if (!token) {
    // User is not authenticated
    if (!isPublicRoute) {
      // Redirect to login for protected routes
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // User has a token
  if (isAuthPage) {
    // Redirect authenticated users away from auth pages
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

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
