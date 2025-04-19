/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["cdn.discordapp.com"],
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/auth/callback/discord",
        destination: "/api/auth/callback/discord",
      },
    ]
  },
}

module.exports = nextConfig
