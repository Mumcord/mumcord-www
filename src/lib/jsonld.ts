import { dicts, routes, type Lang, type PageId } from "../i18n";
import { OWNER } from "./site";
import { REPO_URL, RELEASES_URL, type Release } from "./release";

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
      inLanguage: ["de", "en"],
      publisher: { "@id": `${site.origin}/#owner` },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "@id": `${site.origin}/#app`,
      name: "Mumcord",
      url,
      description: t.meta.description,
      applicationCategory: "CommunicationApplication",
      applicationSubCategory: "Voice chat",
      operatingSystem: "Windows 10, Windows 11, macOS, Linux",
      inLanguage: ["en", "de", "es"],
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
