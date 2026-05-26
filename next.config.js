@"
// next.config.js
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'react-icons'],
  },
  serverExternalPackages: ['mongoose'],
  reactStrictMode: true,
  poweredByHeader: false,
};

export default withNextIntl(nextConfig);
"@ | Out-File -FilePath next.config.js -Encoding utf8