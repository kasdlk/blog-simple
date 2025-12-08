import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for production
  compress: true,
  // Ensure proper error handling and chunk loading
  experimental: {
    optimizePackageImports: ['react-markdown', 'rehype-highlight'],
  },
};

export default nextConfig;
