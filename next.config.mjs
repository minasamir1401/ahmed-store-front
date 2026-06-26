const BACKEND_URL = process.env.BACKEND_URL || 'https://api.the-vitahub.com';

const nextConfig = {
  output: 'standalone',
  experimental: {
    proxyTimeout: 120000,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.the-vitahub.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'logo.clearbit.com' },
      { protocol: 'https', hostname: 'www.google.com' },
      { protocol: 'https', hostname: 't1.gstatic.com' },
      { protocol: 'https', hostname: 'logos.hunter.io' },
      { protocol: 'https', hostname: 'icons.duckduckgo.com' },
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

  // ─── Security Headers ──────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // منع الـ Clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // منع MIME type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // تقليل معلومات الـ Referrer
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // تقييد الـ Permissions
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          // HSTS — فقط في الإنتاج
          ...(process.env.NODE_ENV === 'production'
            ? [{
                key: 'Strict-Transport-Security',
                value: 'max-age=63072000; includeSubDomains; preload'
              }]
            : []),
          // XSS Protection
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
