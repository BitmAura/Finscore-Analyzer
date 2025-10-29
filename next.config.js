/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Ignore test files during build
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'].filter(ext => !ext.includes('test')),
  // Don't fail build on missing files
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src * 'self' data:; media-src 'self'; frame-src 'self'; font-src 'self'; connect-src * 'self';",
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
  experimental: {
    // serverActions is enabled by default in Next.js 15
  },
  images: {
    domains: ['images.unsplash.com', 'avatars.githubusercontent.com'],
  },
  webpack: (config, { isServer, dev }) => {
    // Handle missing module errors gracefully
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    // Ignore missing test files
    config.module = {
      ...config.module,
      exprContextCritical: false,
    };

    // Fix webpack cache issues in development
    if (dev) {
      config.cache = {
        type: 'filesystem',
        compression: false, // Disable compression to avoid pack.gz errors
        buildDependencies: {
          config: [__filename],
        },
      };
    }

    // Optimize chunk loading
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            chunks: 'all',
            enforce: true,
          },
        },
      }
    }
    return config
  },
  // Increase timeout for chunk loading
  devIndicators: {
    position: 'bottom-right',
  },
}

module.exports = nextConfig