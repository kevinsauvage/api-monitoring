import { envPublic } from "@/lib/shared/utils/env";

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = envPublic().NEXT_PUBLIC_APP_URL;
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${base}/sitemap.xml`,
  };
}
