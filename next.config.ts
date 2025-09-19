import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: Cron jobs are not yet available in Next.js 15 TypeScript definitions
  // The cron functionality is implemented via external scheduling
  // experimental: {
  //   cron: {
  //     "*/1 * * * *": "/api/cron/health-checks",
  //   },
  // },
};

export default nextConfig;
