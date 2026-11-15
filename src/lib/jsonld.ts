import { dicts, routes, LANGS, type Lang, type PageId } from "../i18n";
import { OWNER } from "./site";
import { REPO_URL, RELEASES_URL, type Release } from "./release";
import { libsPage, libLinks, LIB_META, LIB_PAGE, type LibId } from "./libs";

const person = (site: URL) => ({
  "@type": "Person",
  "@id": `${site.origin}/#owner`,
  name: OWNER.name,
  url: OWNER.url,
  sameAs: [OWNER.github],
});

export function homeJsonLd(lang: Lang, site: URL, release: Release | null, screenshot: string) {
  const t = dicts[lang];
  const url = new URL(routes.home[lang], site).href;
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${site.origin}/#website`,
      url: site.origin,
      name: "Mumcord",
      inLanguage: [...LANGS],
      publisher: { "@id": `${site.origin}/#owner` },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "@id": `${site.origin}/#app`,
      name: "Mumcord",
      alternateName: ["Mumcord Mumble Client"],
      url,
      description: t.meta.description,
      keywords: [...new Set(["Mumble client", t.meta.altClient, "alternative Mumble client", "Mumble", "voice chat", "VoIP"])].join(", "),
      applicationCategory: "CommunicationApplication",
      applicationSubCategory: "Voice chat",
      operatingSystem: "Windows 10, Windows 11, macOS, Linux, FreeBSD",
      inLanguage: [...LANGS],
      image: new URL("/og.jpg", site).href,
      screenshot: new URL(screenshot, site).href,
      license: `${REPO_URL}/blob/main/LICENSE`,
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      downloadUrl: release?.url ?? RELEASES_URL,
      ...(release && { softwareVersion: release.version, datePublished: release.publishedAt }),
      featureList: t.features.items.map((f) => f.title),
      author: { "@id": `${site.origin}/#owner` },
      sameAs: [REPO_URL],
    },
    { "@context": "https://schema.org", ...person(site) },
  ];
}

export function pageJsonLd(lang: Lang, site: URL, page: PageId, title: string) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      url: new URL(routes[page][lang], site).href,
      name: title,
      inLanguage: lang,
      isPartOf: { "@id": `${site.origin}/#website` },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Mumcord", item: new URL(routes.home[lang], site).href },
          { "@type": "ListItem", position: 2, name: title, item: new URL(routes[page][lang], site).href },
        ],
      },
    },
  ];
}

/** A roadmap epic's own page: a WebPage with the trail Mumcord > Roadmap > Epic. */
export function epicJsonLd(lang: Lang, site: URL, epicId: string, epicTitle: string, roadmapTitle: string) {
  const roadmap = new URL(routes.roadmap[lang], site).href;
  const url = `${roadmap}/${epicId}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      url,
      name: epicTitle,
      inLanguage: lang,
      isPartOf: { "@id": `${site.origin}/#website` },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Mumcord", item: new URL(routes.home[lang], site).href },
          { "@type": "ListItem", position: 2, name: roadmapTitle, item: roadmap },
          { "@type": "ListItem", position: 3, name: epicTitle, item: url },
        ],
      },
    },
  ];
}

/** A library's documentation page: the WebPage plus the crate as SoftwareSourceCode. */
export function libJsonLd(lang: "de" | "en", site: URL, lib: LibId) {
  const p = libsPage[lang].pages[lib];
  const meta = LIB_META[lib];
  const links = libLinks(lib);
  return [
    ...pageJsonLd(lang, site, LIB_PAGE[lib], p.title),
    {
      "@context": "https://schema.org",
      "@type": "SoftwareSourceCode",
      name: meta.crate,
      description: p.description,
      codeRepository: links.repo,
      programmingLanguage: "Rust",
      license: meta.license.split(" OR ").map((l) => `https://spdx.org/licenses/${l}.html`),
      url: new URL(routes[LIB_PAGE[lib]][lang], site).href,
      sameAs: [links.crates, links.docs],
      author: { "@id": `${site.origin}/#owner` },
    },
  ];
}
