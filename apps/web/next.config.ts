import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/shared"],
  // Railway injects PORT; Next.js reads it automatically via `next start -p $PORT`
  // No extra config needed — handled in package.json start script
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        // Allow Railway internal domain — update with your real subdomain after deploy
        process.env.RAILWAY_PUBLIC_DOMAIN ?? "",
      ].filter(Boolean),
    },
  },
};

export default nextConfig;

