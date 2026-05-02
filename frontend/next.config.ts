import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Generate static HTML/JS/CSS
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Required for static export
  }
};

export default nextConfig;
