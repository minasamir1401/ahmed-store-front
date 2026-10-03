"use client"

import React, { useEffect, Suspense, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { trackPageView, trackSearch } from '@/lib/tracking'

function TrackingPixelsContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const googleId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
  const tiktokId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID
  const snapchatId = process.env.NEXT_PUBLIC_SNAPCHAT_PIXEL_ID
  // By default, marketing pixels are active so Meta Advantage+ and Catalog events run reliably.
  // Pixels are only suppressed if the user explicitly opted out with 'essential' only.
  const [isOptedOut, setIsOptedOut] = React.useState(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    const checkConsent = () => {
      try {
        const consent = localStorage.getItem('vitahub_cookie_consent')
        setIsOptedOut(consent === 'essential')
      } catch {
        setIsOptedOut(false)
      }
    }

    checkConsent()
    window.addEventListener('cookie_consent_updated', checkConsent)
    return () => window.removeEventListener('cookie_consent_updated', checkConsent)
  }, [])

  // Track page view and search on route/path changes
  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin') || isOptedOut) return

    const searchQuery = searchParams?.get('search') || searchParams?.get('q')
    if (searchQuery && searchQuery.trim()) {
      trackSearch(searchQuery.trim())
    }

    // On initial page load, Meta PageView has already fired from the <head> script.
    // Skip duplicate Meta PageView on first mount, but still log to backend and other analytics.
    if (isFirstRender.current) {
      isFirstRender.current = false
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
      trackPageView(url, true)
      return
    }

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    trackPageView(url, false)
  }, [pathname, searchParams, isOptedOut])

  if (isOptedOut || pathname?.startsWith('/admin')) return null

  return (
    <>

      {/* ─── Google Analytics (GA4) ─── */}
      {googleId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleId}`}
            strategy="afterInteractive"
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${googleId}', { send_page_view: false });
              `,
            }}
          />
        </>
      )}

      {/* ─── TikTok Pixel ─── */}
      {tiktokId && (
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var tt=w[t]=w[t]||[];tt.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],tt.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<tt.methods.length;i++)tt.setAndDefer(tt,tt.methods[i]);tt.instance=function(t){for(var e=tt._i[t]||[],n=0;n<tt.methods.length;n++)tt.setAndDefer(e,tt.methods[n]);return e},tt.load=function(e,n){var t="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.mixpool;w[t]=e,w[t+"_custom"]=o;var r=d.createElement("script");r.type="text/javascript",r.async=!0,r.src=t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(r,a)};
                tt.load("${tiktokId}");
              }(window, document, 'ttq');
            `,
          }}
        />
      )}

      {/* ─── Snapchat Pixel ─── */}
      {snapchatId && (
        <>
          <Script
            id="snapchat-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(win, doc, sdk_url){
                  if(win.snaptr) return;
                  var tr=win.snaptr=function(){
                    tr.handleRequest? tr.handleRequest.apply(tr, arguments):tr.queue.push(arguments);
                  };
                  tr.queue=[];
                  var s=doc.createElement('script'); s.async=!0; s.src=sdk_url;
                  var a=doc.getElementsByTagName('script')[0];
                  a.parentNode.insertBefore(s,a);
                })(window, document, 'https://sc-static.net/scevent.min.js');
                snaptr('init', '${snapchatId}');
              `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://tr.snapchat.com/tb/p?id=${snapchatId}&ev=PAGE_VIEW&noscript=1`}
              alt="Snapchat Tracking Pixel Fallback"
            />
          </noscript>
        </>
      )}
    </>
  )
}

export default function TrackingPixels() {
  return (
    <Suspense fallback={null}>
      <TrackingPixelsContent />
    </Suspense>
  )
}
