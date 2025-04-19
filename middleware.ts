import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Just pass through all requests
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
