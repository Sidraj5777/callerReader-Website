import type { NextConfig } from "next";

/*
 * Static export: `npm run build:uat` / `npm run build:prod` produce a plain
 * folder of HTML/CSS/JS in ./out. Nginx serves it directly; no Node.js
 * process runs on the server for the website.
 *
 * NEXT_PUBLIC_* values (API URL, site URL) are baked in at build time, so
 * always build with the target environment's script.
 */
const nextConfig: NextConfig = {
  output: "export",
  // No image optimisation server in a static export; images are served as-is
  // (they are already sized for the web).
  images: { unoptimized: true },
  // Pin the project root so Next doesn't pick up a stray lockfile elsewhere.
  turbopack: { root: __dirname },
};

export default nextConfig;
