/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // serverActions is enabled by default in Next.js 15
  },
  images: {
    domains: ['images.unsplash.com', 'avatars.githubusercontent.com'],
  },
}

module.exports = nextConfig