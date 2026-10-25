import { de, type Dict } from "./de";
import { en } from "./en";

export type Lang = "de" | "en";
export type PageId = "home" | "features" | "roadmap" | "changelog" | "server" | "imprint" | "privacy";

export const dicts: Record<Lang, Dict> = { de, en };

export const routes: Record<PageId, Record<Lang, string>> = {
  home: { de: "/", en: "/en" },
  features: { de: "/funktionen", en: "/en/features" },
  roadmap: { de: "/roadmap", en: "/en/roadmap" },
  changelog: { de: "/changelog", en: "/en/changelog" },
  server: { de: "/server", en: "/en/server" },
  imprint: { de: "/impressum", en: "/en/legal-notice" },
  privacy: { de: "/datenschutz", en: "/en/privacy" },
};

export const otherLang = (lang: Lang): Lang => (lang === "de" ? "en" : "de");
