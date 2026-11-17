import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Generated once at build time (required for the static export).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/form", "/auth", "/thank-you", "/account", "/subscribe/success", "/subscribe/cancel"] },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
