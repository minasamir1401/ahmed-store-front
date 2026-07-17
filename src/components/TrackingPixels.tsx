"use client"

import React, { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { trackPageView, trackSearch } from '@/lib/tracking'

function TrackingPixelsContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const facebookId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || "2785073648526058"
  const googleId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
  const tiktokId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID
  const snapchatId = process.env.NEXT_PUBLIC_SNAPCHAT_PIXEL_ID

  // Track page view and search on route/path changes
  useEffect(() => {
    if (!pathname) return
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    trackPageView(url)

    const searchQuery = searchParams?.get('search') || searchParams?.get('q')
    if (searchQuery && searchQuery.trim()) {
      trackSearch(searchQuery.trim())
    }
  }, [pathname, searchParams])

  return (
    <>
      {/* ─── Facebook / Instagram Pixel ─── */}
      {facebookId && (
        <>
          <Script
            id="facebook-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${facebookId}');
              `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${facebookId}&ev=PageView&noscript=1`}
              alt="Facebook Tracking Pixel Fallback"
            />
          </noscript>
        </>
      )}

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
