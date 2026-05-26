@"
// next.config.js
import withNextIntl from 'next-intl/plugin';

const withNextIntlConfig = withNextIntl('./i18n/request.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['en', 'ur', 'zh', 'id', 'tr', 'ms'],
    defaultLocale: 'en',
    localeDetection: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    qualities: [75, 90],
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'react-icons'],
  },
  serverExternalPackages: ['mongoose'],
  compress: true,
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/en',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' }
        ]
      },
      {
        source: '/(.*).(jpg|jpeg|png|gif|ico|svg|webp|avif|woff|woff2|ttf|eot)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]
      },
      {
        source: '/(.*).(js|css)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]
      }
    ];
  },
};

export default withNextIntlConfig(nextConfig);
"@ | Out-File -FilePath next.config.js -Encoding utf8