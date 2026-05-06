import { NextRequest, NextResponse } from 'next/server'

const REQUEST_TIMEOUT_MS = 12000

function getBackendBaseUrls() {
  const raw = [
    process.env.BACKEND_URL,
    'https://ahmed-api.red-gate.tech',
    process.env.NEXT_PUBLIC_API_URL,
    'http://ahmed-backand-rs5rcx:5000',
    'http://backend:5000',
  ]

  const cleaned = raw
    .filter((value): value is string => Boolean(value && value.trim()))
    .map((value) => value.replace(/\/+$/, ''))

  return Array.from(new Set(cleaned))
}

async function proxyRequest(request: NextRequest, path: string[]) {
  const backendBaseUrls = getBackendBaseUrls()
  const query = request.nextUrl.search

  if (backendBaseUrls.length === 0) {
    return NextResponse.json(
      { error: 'Backend URL is not configured' },
      { status: 500 }
    )
  }

  // Clone headers and remove host to avoid proxy issues
  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.delete('connection')

  // Buffer the body once to allow retries if the first backend fails
  let body: any = null
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.arrayBuffer()
  }

  let lastError: any

  for (const baseUrl of backendBaseUrls) {
    const targetUrl = `${baseUrl}/api/${path.join('/')}${query}`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: headers,
        body: body,
        signal: controller.signal,
        redirect: 'manual' // Don't follow redirects automatically to avoid issues
      })

      clearTimeout(timeout)
      
      // If it's a redirect, we might want to follow or return as is
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location')
        return NextResponse.json({ error: 'Backend redirected', location }, { status: 502 })
      }

      const responseBody = await response.arrayBuffer()

      return new NextResponse(responseBody, {
        status: response.status,
        headers: {
          'content-type': response.headers.get('content-type') || 'application/json; charset=utf-8',
          'cache-control': response.headers.get('cache-control') || 'no-store'
        }
      })
    } catch (error: any) {
      clearTimeout(timeout)
      lastError = error
      console.error(`Proxy failed for ${targetUrl}:`, error.message)
      // Continue to next URL
    }
  }

  const message = lastError?.message || 'Failed to reach backend'
  return NextResponse.json(
    { error: `API proxy failed: ${message}` },
    { status: 502 }
  )
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path)
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path)
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path)
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path)
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path)
}
