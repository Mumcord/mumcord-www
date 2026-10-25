// The site speaks the same 24 official EU languages as the app (FR-1.36). German lives at the
// root and English under /en, as before; the other languages get a /<code> prefix with the
// English page slugs.

export const LANGS = [
  "de",
  "en",
  "bg",
  "cs",
  "da",
  "el",
  "es",
  "et",
  "fi",
  "fr",
  "ga",
  "hr",
  "hu",
  "it",
  "lt",
  "lv",
  "mt",
  "nl",
  "pl",
  "pt",
  "ro",
  "sk",
  "sl",
  "sv",
] as const;

export type Lang = (typeof LANGS)[number];

/** Languages besides German and English, served under /<code> from one dynamic route each. */
export const EXTRA_LANGS = LANGS.filter((l): l is Exclude<Lang, "de" | "en"> => l !== "de" && l !== "en");
export type ExtraLang = (typeof EXTRA_LANGS)[number];

interface LangInfo {
  /** The language in its own name, for the language picker. */
  name: string;
  /** BCP 47 tag for dates and numbers. */
  intl: string;
  /** Open Graph locale. */
  og: string;
}

export const LANG_INFO: Record<Lang, LangInfo> = {
  de: { name: "Deutsch", intl: "de-DE", og: "de_DE" },
  en: { name: "English", intl: "en-GB", og: "en_GB" },
  bg: { name: "Български", intl: "bg-BG", og: "bg_BG" },
  cs: { name: "Čeština", intl: "cs-CZ", og: "cs_CZ" },
  da: { name: "Dansk", intl: "da-DK", og: "da_DK" },
  el: { name: "Ελληνικά", intl: "el-GR", og: "el_GR" },
  es: { name: "Español", intl: "es-ES", og: "es_ES" },
  et: { name: "Eesti", intl: "et-EE", og: "et_EE" },
  fi: { name: "Suomi", intl: "fi-FI", og: "fi_FI" },
  fr: { name: "Français", intl: "fr-FR", og: "fr_FR" },
  ga: { name: "Gaeilge", intl: "ga-IE", og: "ga_IE" },
  hr: { name: "Hrvatski", intl: "hr-HR", og: "hr_HR" },
  hu: { name: "Magyar", intl: "hu-HU", og: "hu_HU" },
  it: { name: "Italiano", intl: "it-IT", og: "it_IT" },
  lt: { name: "Lietuvių", intl: "lt-LT", og: "lt_LT" },
  lv: { name: "Latviešu", intl: "lv-LV", og: "lv_LV" },
  mt: { name: "Malti", intl: "mt-MT", og: "mt_MT" },
  nl: { name: "Nederlands", intl: "nl-NL", og: "nl_NL" },
  pl: { name: "Polski", intl: "pl-PL", og: "pl_PL" },
  pt: { name: "Português", intl: "pt-PT", og: "pt_PT" },
  ro: { name: "Română", intl: "ro-RO", og: "ro_RO" },
  sk: { name: "Slovenčina", intl: "sk-SK", og: "sk_SK" },
  sl: { name: "Slovenščina", intl: "sl-SI", og: "sl_SI" },
  sv: { name: "Svenska", intl: "sv-SE", og: "sv_SE" },
};
