import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = new URL(request.url)
  
  // Detect language from search params (?lang=en) or default to 'ar'
  const lang = url.searchParams.get('lang') || 'ar'
  
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-lang', lang)
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    // Apply to all pages, but exclude API routes, static files, uploads, images etc.
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|frame.png|uploads).*)',
  ],
}
