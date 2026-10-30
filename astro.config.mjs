import { defineConfig } from "astro/config";

// SITE_URL is set by the image build; it only affects canonical/OG URLs.
export default defineConfig({
  site: process.env.SITE_URL ?? "https://mumcord.app",
  trailingSlash: "never",
  build: { format: "file" },
  compressHTML: true,
  // Contributor avatars are fetched at build time and served from the site.
  image: { domains: ["avatars.githubusercontent.com"] },
});
