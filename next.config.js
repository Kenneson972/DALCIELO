/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react', 'recharts'],
  },
  // Perf (kb-performance) : supprimer console en prod, formats image modernes
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    const isProd = process.env.NODE_ENV === 'production'
    const headers = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          isProd
            ? "script-src 'self' 'unsafe-inline'"
            : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https: blob:",
          "font-src 'self' data:",
          "connect-src 'self' https://*.supabase.co https://api.stripe.com https://*.google.com https://*.googleapis.com wss:",
          "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.google.com https://maps.google.com https://maps.googleapis.com",
          "frame-ancestors 'self'",
        ].join('; '),
      },
    ]
    if (isProd) {
      headers.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      })
    }
    return [
      {
        source: '/:path*',
        headers: [
          ...headers,
          // Empêche Cloudflare de cacher les pages HTML (données Supabase temps réel)
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_APP_URL || 'https://pizzadalcielo.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, x-csrf-token, x-admin-pin' },
        ],
      },
    ]
  },
};

module.exports = nextConfig;
