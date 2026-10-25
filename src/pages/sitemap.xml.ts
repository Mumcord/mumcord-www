import type { APIRoute } from "astro";
import { routes, type PageId } from "../i18n";

const priority: Record<PageId, string> = { home: "1.0", features: "0.8", changelog: "0.6", server: "0.6", imprint: "0.2", privacy: "0.2" };

// Hand-written so every URL carries its hreflang alternates.
export const GET: APIRoute = ({ site }) => {
  const lastmod = new Date().toISOString().slice(0, 10);
  const abs = (path: string) => new URL(path, site).href;
  const urls = (Object.keys(routes) as PageId[]).flatMap((page) =>
    (["de", "en"] as const).map((lang) => {
      const alts = (["de", "en"] as const)
        .map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${abs(routes[page][l])}"/>`)
        .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(routes[page].de)}"/>`)
        .join("\n");
      return `  <url>\n    <loc>${abs(routes[page][lang])}</loc>\n${alts}\n    <lastmod>${lastmod}</lastmod>\n    <priority>${priority[page]}</priority>\n  </url>`;
    }),
  );
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml" } });
};
