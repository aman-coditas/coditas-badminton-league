import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that don't require authentication
const PUBLIC_PATHS = [
  "/login",
  "/api/auth",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname.includes(".") // files with extensions (images, etc.)
  ) {
    return NextResponse.next();
  }

  // Check for session cookie
  const isLoggedIn = request.cookies.get("cbl_logged_in")?.value === "true";

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
