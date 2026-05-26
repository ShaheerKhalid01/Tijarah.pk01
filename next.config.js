/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }
    ]
  },
  serverExternalPackages: ["mongoose"],
  reactStrictMode: true,
  productionBrowserSourceMaps: true
};

export default nextConfig;