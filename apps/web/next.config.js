/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },

  // Tells Next.js/webpack to transpile these local TS packages directly from source.
  // This is necessary because dist/ is gitignored — we point webpack to src/ via alias below.
  transpilePackages: ['@michaforge/shared-contracts', '@michaforge/shared-validation'],

  webpack: (config) => {
    // Alias shared packages to their TypeScript source files.
    // This bypasses the need for pre-built dist/ output on Vercel / CI.
    config.resolve.alias = {
      ...config.resolve.alias,
      '@michaforge/shared-contracts': path.resolve(
        __dirname,
        '../../packages/shared-contracts/src/index.ts'
      ),
      '@michaforge/shared-validation': path.resolve(
        __dirname,
        '../../packages/shared-validation/src/index.ts'
      ),
    };
    return config;
  },

  // API proxy rewrites — active in dev (Next.js server) and SSR deployment.
  // In Vercel production, set NEXT_PUBLIC_API_URL env var for direct API calls.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/uploads/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
