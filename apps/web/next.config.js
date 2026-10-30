/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*', // Proxy to API Gateway
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:4000/uploads/:path*', // Proxy to Media Service
      },
    ];
  },
};

module.exports = nextConfig;
