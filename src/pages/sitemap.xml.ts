import type { APIRoute } from "astro";
import { routes, pageLangs, LANGS, type PageId } from "../i18n";
import { roadmapPage } from "../lib/roadmap";
import { getLatestRelease } from "../lib/release";

// Pages a new release changes; the others carry no lastmod, since a made-up date is worse than none.
const RELEASE_PAGES: PageId[] = ["home", "features", "changelog", "download", "roadmap"];

const priority: Record<PageId, string> = { home: "1.0", features: "0.8", games: "0.7", themes: "0.7", roadmap: "0.6", changelog: "0.6", download: "0.9", server: "0.6", mumbot: "0.6", plugins: "0.7", mumpeer: "0.5", mumquiz: "0.5", imprint: "0.2", privacy: "0.2" };

// Hand-written so every URL carries its hreflang alternates.
export const GET: APIRoute = async ({ site }) => {
  const released = (await getLatestRelease())?.publishedAt.slice(0, 10);
  const mod = (on: boolean) => (on && released ? `    <lastmod>${released}</lastmod>\n` : "");
  const abs = (path: string) => new URL(path, site).href;
  const urls = (Object.keys(routes) as PageId[]).flatMap((page) =>
    pageLangs(page).map((lang) => {
      const alts = pageLangs(page)
        .map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${abs(routes[page][l])}"/>`)
        .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(routes[page].de)}"/>`)
        .join("\n");
      return `  <url>\n    <loc>${abs(routes[page][lang])}</loc>\n${alts}\n${mod(RELEASE_PAGES.includes(page))}    <priority>${priority[page]}</priority>\n  </url>`;
    }),
  );
  // Every epic has its own page under the roadmap, in every language.
  for (const e of roadmapPage.de.epics) {
    const path = (l: (typeof LANGS)[number]) => `${routes.roadmap[l]}/${e.id}`;
    const alts = LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${abs(path(l))}"/>`)
      .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(path("de"))}"/>`)
      .join("\n");
    for (const l of LANGS) urls.push(`  <url>\n    <loc>${abs(path(l))}</loc>\n${alts}\n${mod(true)}    <priority>0.5</priority>\n  </url>`);
  }
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml" } });
};
