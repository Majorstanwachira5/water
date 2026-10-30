/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',       // Static export — all routes are pre-rendered (○)
  reactStrictMode: true,
  images: {
    unoptimized: true,    // Required for static export
  },
  // API calls go directly to the deployed API gateway in production.
  // Use NEXT_PUBLIC_API_URL env variable to configure the endpoint.
  trailingSlash: true,   // Ensures correct routing on Cloudflare Pages
};

module.exports = nextConfig;
