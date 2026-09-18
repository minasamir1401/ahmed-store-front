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
    const encodedPath = params.path.map((segment) => {
      let decoded = segment
      try {
        decoded = decodeURIComponent(segment)
      } catch {
        decoded = segment
      }
      return encodeURIComponent(decoded)
    }).join('/')
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

  if (lastError) {
    return new NextResponse(null, { status: 502 })
  }
  
  return new NextResponse(null, { status: 404 })
}
