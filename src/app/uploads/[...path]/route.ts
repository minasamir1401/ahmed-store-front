import { NextRequest, NextResponse } from 'next/server'

const REQUEST_TIMEOUT_MS = 12000

function getBackendBaseUrls() {
  const raw = [process.env.BACKEND_URL, process.env.NEXT_PUBLIC_API_URL]

  const cleaned = raw
    .filter((value): value is string => Boolean(value && value.trim()))
    .map((value) => value.replace(/\/+$/, ''))

  return Array.from(new Set(cleaned))
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params
  const backendBaseUrls = getBackendBaseUrls()
  const query = request.nextUrl.search

  if (backendBaseUrls.length === 0) {
    return NextResponse.json({ error: 'Backend URL is not configured' }, { status: 500 })
  }

  // Create clean headers to avoid forwarding cookies, host, and proxy headers (like X-Forwarded-Host)
  // which can cause the backend server/CDN to reject the request with a 400 Bad Request.
  const headers = new Headers()
  const userAgent = request.headers.get('user-agent')
  if (userAgent) {
    headers.set('user-agent', userAgent)
  }
  const accept = request.headers.get('accept')
  if (accept) {
    headers.set('accept', accept)
  }

  let lastError: any

  for (const baseUrl of backendBaseUrls) {
    const encodedPath = params.path.map((segment) => encodeURIComponent(segment)).join('/')
    const targetUrl = `${baseUrl}/uploads/${encodedPath}${query}`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: headers,
        signal: controller.signal
      })

      clearTimeout(timeout)

      if (response.status === 404) {
        // If 404, we might want to try other base URLs or just return 404
        // For static files, if one backend doesn't have it, others likely won't either
        // unless they are using different storage. Let's continue to be safe.
        continue
      }

      if (!response.ok) {
        throw new Error(`Status ${response.status}`)
      }

      const body = await response.arrayBuffer()

      return new NextResponse(body, {
        status: response.status,
        headers: {
          'content-type': response.headers.get('content-type') || 'application/octet-stream',
          'cache-control': 'public, max-age=31536000, immutable'
        }
      })
    } catch (error: any) {
      clearTimeout(timeout)
      lastError = error
      console.error(`Uploads proxy failed for ${targetUrl}:`, error.message)
    }
  }

  // If we reach here, it's either 404 or all backends failed
  if (lastError) {
    return NextResponse.json({ error: `Uploads proxy failed: ${lastError.message}` }, { status: 502 })
  }
  
  return NextResponse.json({ error: 'Not Found' }, { status: 404 })
}
