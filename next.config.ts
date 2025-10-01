import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: Cron jobs are not yet available in Next.js 15 TypeScript definitions
  // The cron functionality is implemented via external scheduling
  // experimental: {
  //   cron: {
  //     "*/1 * * * *": "/api/cron/health-checks",
  //   },
  // },
  // eslint-disable-next-line @typescript-eslint/require-await
  async headers() {
    const isDev = process.env.NODE_ENV !== "production";

    // A conservative CSP by default. In development, allow 'unsafe-eval' for React tooling.
    // If you add external analytics, fonts, or CDNs, explicitly list them here.
    const csp = [
      "default-src 'self'",
      `script-src 'self'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ]
      .join("; ")
      .concat(";");

    const commonSecurityHeaders = [
      { key: "Content-Security-Policy", value: csp },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-DNS-Prefetch-Control", value: "off" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
    ];

    // Apply HSTS only when not running locally. Browsers ignore HSTS on http anyway,
    // but this prevents accidentally caching HSTS for localhost via custom domains.
    const hstsHeader = {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    } as const;

    return [
      {
        source: "/:path*",
        headers: isDev
          ? commonSecurityHeaders
          : [...commonSecurityHeaders, hstsHeader],
      },
    ];
  },
};

export default nextConfig;
