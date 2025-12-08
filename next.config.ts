import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for production
  compress: true,
  // Ensure proper error handling and chunk loading
  experimental: {
    optimizePackageImports: ['react-markdown', 'rehype-highlight'],
  },
  // Turbopack configuration (empty for now, can be extended later)
  turbopack: {},
  // Add asset prefix if needed (uncomment if using CDN)
  // assetPrefix: process.env.NODE_ENV === 'production' ? 'https://your-cdn.com' : '',
};

export default nextConfig;
