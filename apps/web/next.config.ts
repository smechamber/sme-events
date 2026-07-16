import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@events/types",
    "@events/utils",
    "@events/ui",
    "@events/config",
  ],

  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "media.smebusinessforum.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
      },
    ],
  },
};

export default nextConfig;