import { headers } from 'next/headers'

/**
 * Dynamically resolves the absolute site URL on the server.
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL environment variable (يجب ضبطها في الإنتاج دائماً)
 * 2. Request headers (x-forwarded-host or host) + protocol
 * 3. Default fallback for build-time/compilation environment
 */
export async function getServerSiteUrl(): Promise<string> {
  const configuredUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL
  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, '')
  }

  // تحذير صريح في بيئة الإنتاج
  if (process.env.NODE_ENV === 'production') {
    console.error(
      '[SEO WARNING] NEXT_PUBLIC_SITE_URL is not set! ' +
      'Canonical URLs and Sitemap may be incorrect. ' +
      'Set NEXT_PUBLIC_SITE_URL=https://yourdomain.com in production.'
    )
  }

  try {
    const requestHeaders = await headers()
    const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host')
    if (host) {
      const proto = requestHeaders.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https')
      return `${proto}://${host}`.replace(/\/+$/, '')
    }
  } catch (e: any) {
    // If it's Next.js dynamic rendering signaling, we must rethrow it
    // so Next.js knows to render this route dynamically on-demand.
    if (e && (e.digest === 'DYNAMIC_SERVER_USAGE' || e.message?.includes('Dynamic server usage'))) {
      throw e
    }
    console.warn('getServerSiteUrl: headers() not available in this context. Falling back to localhost.', e)
  }

  // Fallback for static compilation/build-time metadataBase check
  return 'http://localhost:3000'
}
