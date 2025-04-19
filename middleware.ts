import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Log all requests to the Discord callback route
  if (pathname.startsWith("/api/auth/callback/discord")) {
    console.log("Middleware: Discord callback route accessed", pathname)

    // If you're having issues with the App Router route, you could redirect to the Pages Router route
    // Uncomment this if needed:
    /*
    if (pathname === '/api/auth/callback/discord') {
      // Preserve query parameters
      const url = new URL('/api/auth/callback/discord', request.url)
      url.search = request.nextUrl.search
      return NextResponse.rewrite(url)
    }
    */
  }

  return NextResponse.next()
}

// Configure the middleware to run for specific paths
export const config = {
  matcher: ["/api/auth/callback/discord"],
}
