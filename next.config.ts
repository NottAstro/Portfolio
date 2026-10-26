import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  // Pin the workspace root so a stray lockfile in a parent folder is ignored
  turbopack: {
    root: process.cwd(),
  },

  images: {
    formats: ["image/avif", "image/webp"],
  },

  experimental: {
    // Import only the icons/components actually used from these barrels
    optimizePackageImports: ["lucide-react", "react-icons", "framer-motion"],
  },

  async headers() {
    return [
      {
        // 3D model, lanyard texture and profile photo rarely change
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
