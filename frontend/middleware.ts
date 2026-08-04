import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // If no token in authorization header or cookies when server rendered
    // Client side auth state fallback will also verify local storage
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
