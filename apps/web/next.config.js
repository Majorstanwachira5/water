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

  // API proxy rewrites:
  // If NEXT_PUBLIC_API_URL is explicitly configured (e.g. external API gateway), proxy /api/* and /uploads/*.
  // Otherwise, Next.js serves /api/v1/* directly via its built-in Supabase Route Handler (app/api/v1/[...path]/route.ts)
  // so Vercel and standalone deployments work out-of-the-box against Supabase.
  async rewrites() {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
        },
        {
          source: '/uploads/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL}/uploads/:path*`,
        },
      ];
    }
    return [
      {
        source: '/uploads/:path*',
        destination: '/images/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
