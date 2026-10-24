import { defineConfig } from "astro/config";

// SITE_URL is set by the image build; it only affects canonical/OG URLs.
export default defineConfig({
  site: process.env.SITE_URL ?? "https://mumcord.app",
  trailingSlash: "never",
  build: { format: "file" },
  compressHTML: true,
});
