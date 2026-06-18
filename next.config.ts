import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  // Partial Prerendering: routes opt in by exporting `cacheComponents = true`
  cacheComponents: true,
  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },

  // Security headers on every response
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // Reduce noisy fetch logs in production
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },
};

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withAnalyzer(nextConfig);
