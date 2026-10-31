import { de, type Dict } from "./de";
import { en } from "./en";
import { bundles } from "./locales";
import { EXTRA_LANGS, LANGS, LANG_INFO, type Lang } from "./langs";

export { LANGS, EXTRA_LANGS, LANG_INFO };
export type { Lang };
export type { ExtraLang } from "./langs";
export type PageId = "home" | "features" | "games" | "themes" | "roadmap" | "changelog" | "server" | "mumbot" | "mumpeer" | "mumquiz" | "imprint" | "privacy";

/** Builds a per-language record: German and English as given, the others from their translation file. */
export function localized<T>(base: { de: T; en: T }, extra: (lang: (typeof EXTRA_LANGS)[number]) => T): Record<Lang, T> {
  return Object.fromEntries(LANGS.map((l) => [l, l === "de" || l === "en" ? base[l] : extra(l)])) as Record<Lang, T>;
}

// Missing keys in a translation fall back to English, one level deep is enough for the dicts.
const mergeDict = (lang: string, tr: Partial<Dict> | undefined): Dict => {
  if (!tr) return { ...en, lang, locale: LANG_INFO[lang as Lang].og };
  const out: Record<string, unknown> = { ...en };
  for (const [k, v] of Object.entries(tr)) {
    const base = (en as Record<string, unknown>)[k];
    out[k] = base && typeof base === "object" && !Array.isArray(base) && v && typeof v === "object" && !Array.isArray(v) ? { ...base, ...v } : v;
  }
  return { ...(out as Dict), lang, locale: LANG_INFO[lang as Lang].og };
};

export const dicts: Record<Lang, Dict> = localized({ de, en }, (l) => mergeDict(l, bundles[l]?.dict));

const base: Record<PageId, { de: string; en: string }> = {
  home: { de: "/", en: "/en" },
  features: { de: "/funktionen", en: "/en/features" },
  games: { de: "/spiele", en: "/en/games" },
  themes: { de: "/themes", en: "/en/themes" },
  roadmap: { de: "/roadmap", en: "/en/roadmap" },
  changelog: { de: "/changelog", en: "/en/changelog" },
  server: { de: "/server", en: "/en/server" },
  mumbot: { de: "/mumbot", en: "/en/mumbot" },
  mumpeer: { de: "/mumpeer", en: "/en/mumpeer" },
  mumquiz: { de: "/mumquiz", en: "/en/mumquiz" },
  imprint: { de: "/impressum", en: "/en/legal-notice" },
  privacy: { de: "/datenschutz", en: "/en/privacy" },
};

/** Legal pages stay binding in German and English; the other languages link to the English ones. */
const legal = new Set<PageId>(["imprint", "privacy"]);

export const routes = Object.fromEntries(
  (Object.keys(base) as PageId[]).map((page) => [
    page,
    localized(base[page], (l) => (legal.has(page) ? base[page].en : base[page].en.replace(/^\/en/, `/${l}`))),
  ]),
) as Record<PageId, Record<Lang, string>>;

/** The languages a page really exists in (legal pages only in German and English). */
export const pageLangs = (page: PageId): readonly Lang[] => (legal.has(page) ? (["de", "en"] as const) : LANGS);
