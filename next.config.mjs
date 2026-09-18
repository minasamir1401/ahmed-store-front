const BACKEND_URL = process.env.BACKEND_URL || 'https://api.the-vitahub.com';

const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  experimental: {
    proxyTimeout: 120000,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
    localPatterns: [
      {
        pathname: '/uploads/**',
      },
      {
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Security Headers
  async headers() {
    return [
      {
        source: '/(frame.png|frame.webp|logo-header.jpg|favicon.ico)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://www.googletagmanager.com https://analytics.tiktok.com https://sc-static.net https://accounts.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http:",
              "connect-src 'self' https://the-vitahub.com https://api.the-vitahub.com http://localhost:5000 https://www.google-analytics.com https://analytics.google.com https://connect.facebook.net https://analytics.tiktok.com https://tr.snapchat.com https://accounts.google.com",
              "frame-src 'self' https://accounts.google.com https://www.facebook.com",
              "upgrade-insecure-requests",
            ].join('; ')
          },
          ...(process.env.NODE_ENV === 'production'
            ? [{
                key: 'Strict-Transport-Security',
                value: 'max-age=63072000; includeSubDomains; preload'
              }]
            : []),
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },

  // ─── 301 Redirects (Canonicalization) ──────────────────────────────────────
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.the-vitahub.com',
          },
        ],
        destination: 'https://the-vitahub.com/:path*',
        permanent: true, // 301 Redirect
      },
      // Redirect old /track URL to /order-status (avoids ad blocker blocking)
      {
        source: '/track',
        destination: '/order-status',
        permanent: true,
      },
    ];
  },

  // ─── API Rewrites ──────────────────────────────────────────────────────────
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${BACKEND_URL}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
