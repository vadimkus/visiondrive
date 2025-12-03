/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Turbopack is now the default bundler in Next.js 16
  // Use --turbo flag in dev script to enable it
}

module.exports = nextConfig

