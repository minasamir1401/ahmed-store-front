import { NextRequest, NextResponse } from 'next/server'
import { publishGoogleIndexingNotification } from '@/lib/google-indexing'
import { getProductUrlParam } from '@/lib/slug'

export const runtime = 'nodejs'

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, '')

const getBackendUrl = () => {
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL
  return backendUrl ? stripTrailingSlash(backendUrl) : ''
}

const isAuthorized = async (request: NextRequest) => {
  const configuredSecret = process.env.GOOGLE_INDEXING_WEBHOOK_SECRET
  const headerSecret = request.headers.get('x-indexing-secret')
  if (configuredSecret && headerSecret === configuredSecret) return true

  const authorization = request.headers.get('authorization')
  const backendUrl = getBackendUrl()
  if (!authorization || !backendUrl) return false

  try {
    const res = await fetch(`${backendUrl}/api/admin/profile`, {
      headers: { authorization },
      cache: 'no-store',
    })
    return res.ok
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const productId = typeof body.productId === 'string' ? body.productId.trim() : ''
    const rawUrl = typeof body.url === 'string' ? body.url.trim() : ''
    const type = body.type === 'URL_DELETED' ? 'URL_DELETED' : 'URL_UPDATED'

    let urlsToNotify: string[] = []
    if (rawUrl) {
      urlsToNotify.push(rawUrl)
    } else if (productId) {
      const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL
      if (!siteUrl) throw new Error('SITE_URL or NEXT_PUBLIC_SITE_URL is not configured')
      const cleanSiteUrl = stripTrailingSlash(siteUrl)
      
      // 1. Old URL (ID-only)
      const oldUrl = `${cleanSiteUrl}/product/${productId}`
      urlsToNotify.push(oldUrl)
      
      // 2. Fetch product to construct new slugged URL
      const backendUrl = getBackendUrl()
      if (backendUrl) {
        try {
          const res = await fetch(`${backendUrl}/api/products/${productId}`, { cache: 'no-store' })
          if (res.ok) {
            const product = await res.json()
            if (product) {
              const newUrlParam = getProductUrlParam(product)
              const newUrl = `${cleanSiteUrl}/product/${newUrlParam}`
              if (newUrl !== oldUrl) {
                urlsToNotify.push(newUrl)
              }
            }
          }
        } catch (e) {
          console.error(`Failed to fetch product for google indexing URL slugification:`, e)
        }
      }
    }

    if (urlsToNotify.length === 0) {
      return NextResponse.json({ error: 'Missing productId or url' }, { status: 400 })
    }

    const results = []
    for (const url of urlsToNotify) {
      const res = await publishGoogleIndexingNotification(url, type)
      results.push({ url, result: res })
    }

    return NextResponse.json({ ok: true, results, type })
  } catch (error: unknown) {
    console.error('Google Indexing API error:', error)
    const message = error instanceof Error ? error.message : 'Google Indexing API failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
