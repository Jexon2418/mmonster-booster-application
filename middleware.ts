import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Log all requests to help debug which route is actually handling the Discord callback
  console.log(`Middleware: Route accessed: ${pathname}`)

  // Log all requests to the Discord callback routes
  if (pathname.startsWith("/api/auth/callback/discord") || pathname.startsWith("/auth/callback/discord")) {
    console.log(`Middleware: Discord callback route accessed: ${pathname}`)
  }

  return NextResponse.next()
}

// Configure the middleware to run for specific paths
export const config = {
  matcher: [
    "/api/auth/callback/discord",
    "/auth/callback/discord",
    "/api/auth/callback/discord/:path*",
    "/auth/callback/discord/:path*",
  ],
}
