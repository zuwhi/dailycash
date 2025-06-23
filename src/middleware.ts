import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that don't require authentication
const publicPaths = ["/auth/login", "/auth/register", "/"];

// Paths that require authentication
const protectedPaths = ["/dashboard"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get Appwrite session cookie
  const sessionCookie = request.cookies.get(
    `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`,
  );
  const hasSession = !!sessionCookie?.value;

  // Only handle redirects for login page
  if (pathname === "/auth/login" && hasSession) {
    // If user is already logged in and trying to access login, redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // For all other routes, let them pass through
  // Dashboard protection will be handled by client-side auth check
  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/login"],
};
