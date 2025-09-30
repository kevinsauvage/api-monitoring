import clientEnv from "@/lib/shared/env/client";

import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = clientEnv.NEXT_PUBLIC_APP_URL;
  return Promise.resolve([
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/dashboard`, changeFrequency: "daily", priority: 0.8 },
  ]);
}
