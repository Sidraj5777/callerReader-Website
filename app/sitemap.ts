import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Generated once at build time (required for the static export).
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = ["", "/approach", "/about", "/support", "/subscribe", "/privacy", "/terms"].map((p) => ({
    url: `${SITE.url}${p}`,
    changeFrequency: "monthly" as const,
    priority: p === "" ? 1 : 0.6,
  }));
  return pages;
}
