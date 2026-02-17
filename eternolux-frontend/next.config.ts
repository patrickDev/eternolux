// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // ── Cloudflare R2 image bucket ────────────────────────
      {
        protocol: "https",
        hostname: "images.eternolux.com",
        pathname: "/**",
      },
      // ── API servers ───────────────────────────────────────
      {
        protocol: "https",
        hostname: "api-wwd.eternolux.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.eternolux.com",
        pathname: "/**",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${
          process.env.NEXT_PUBLIC_API_URL || "https://api-wwd.eternolux.com"
        }/api/:path*`,
      },
    ];
  },
};

export default nextConfig;