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
  // Remove rewrites as they might be causing issues
  // We'll rely on Next.js's default routing instead
}

module.exports = nextConfig
