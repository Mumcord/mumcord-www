// Themes to copy into Mumcord. A theme is seven key colours for a dark and a light version
// (the app's ui/src/theme/themeModel.ts); presets carry the app's own values. The share code is
// built exactly like the app's shareCodec.ts: "mct1." + base64url of the JSON {v, n, dark, light}.
import { localized } from "../i18n";
import { bundles } from "../i18n/locales";
import type { ThemesText } from "../i18n/bundle";
// The community gallery, read from the app repo's docs/themes/gallery.md: names, descriptions,
// screenshots and the verified import codes; colours decoded from those codes.
import gallery from "./theme-gallery.json";

export const THEME_COLOR_KEYS = ["background", "surface", "text", "accent", "talking", "warning", "error"] as const;
export type ThemeColorKey = (typeof THEME_COLOR_KEYS)[number];
export type ThemeColors = Record<ThemeColorKey, string>;

/** The Mumcord version the codes name as their creator; themes need at least this version. */
export const THEMES_SINCE = "0.4.0";

export interface Theme {
  id: string;
  name: string;
  kind: "preset" | "community";
  dark: ThemeColors;
  light: ThemeColors;
  /** Screenshots of the app in this theme, by version (paths in src/assets/shots, no .png). */
  shots: Partial<Record<"dark" | "light", string>>;
  /** Gallery themes keep the app's verified code as it is. */
  code?: string;
}

export interface GalleryGroup {
  id: string;
  title: string;
  intro: string;
  themes: (Theme & { description: string })[];
}

/** The gallery groups in English; translations replace titles, intros and descriptions. */
const galleryGroups: GalleryGroup[] = gallery.categories.map((c) => ({
  id: c.id,
  title: c.title,
  intro: c.intro,
  themes: c.themes.map((t) => ({ ...t, kind: "community" as const, dark: t.dark as ThemeColors, light: t.light as ThemeColors })),
}));

export const themes: Theme[] = [
  {
    id: "mumcord",
    name: "Mumcord",
    kind: "preset",
    dark: { background: "#1a1342", surface: "#231b55", text: "#f6f0e8", accent: "#a78bff", talking: "#3ee39e", warning: "#fbbf24", error: "#ff8f8f" },
    light: { background: "#ffffff", surface: "#eee9f8", text: "#17113a", accent: "#6a40e0", talking: "#15803d", warning: "#7f4d00", error: "#b01c1c" },
    shots: { dark: "theme-mumcord-dark", light: "theme-mumcord-light" },
  },
  {
    id: "deep-ocean",
    name: "Deep Ocean",
    kind: "preset",
    dark: { background: "#0b1d2e", surface: "#12293f", text: "#e6f1fa", accent: "#4cc3e6", talking: "#4ade80", warning: "#facc15", error: "#fb8c8c" },
    light: { background: "#f8fbfd", surface: "#e6eff8", text: "#12202b", accent: "#1990b3", talking: "#1c9b4b", warning: "#7e6503", error: "#d20707" },
    shots: { dark: "theme-deep-ocean-dark", light: "theme-deep-ocean-light" },
  },
  {
    id: "forest",
    name: "Forest",
    kind: "preset",
    dark: { background: "#132018", surface: "#1c2d22", text: "#eef3e6", accent: "#9bd46a", talking: "#5eead4", warning: "#fcd34d", error: "#fca5a5" },
    light: { background: "#fafcfb", surface: "#edf4ef", text: "#202518", accent: "#5e982c", talking: "#149b86", warning: "#856602", error: "#d80707" },
    shots: { dark: "theme-forest-dark", light: "theme-forest-light" },
  },
  {
    id: "paper",
    name: "Paper",
    kind: "preset",
    dark: { background: "#221a09", surface: "#352a14", text: "#f0edea", accent: "#c55822", talking: "#218a42", warning: "#d68300", error: "#e7726c" },
    light: { background: "#fbf7ef", surface: "#f1e9da", text: "#2b2118", accent: "#b4501f", talking: "#1d7a3a", warning: "#7a4b00", error: "#a8231c" },
    shots: { dark: "theme-paper-dark", light: "theme-paper-light" },
  },
];

/** Every theme on the page: the presets, then the gallery. */
export const allThemes: Theme[] = [...themes, ...galleryGroups.flatMap((g) => g.themes)];

/** The theme tour on the home page: screenshots stacked and flipped through while scrolling. */
export const tour: { name: string; shot: string; theme?: string; mode: "dark" | "light" }[] = [
  { name: "Mumcord", shot: "theme-mumcord-dark", theme: "mumcord", mode: "dark" },
  { name: "Deep Ocean", shot: "theme-deep-ocean-dark", theme: "deep-ocean", mode: "dark" },
  { name: "Synthwave", shot: "theme-custom-synthwave", theme: "synthwave", mode: "dark" },
  { name: "Forest", shot: "theme-forest-light", theme: "forest", mode: "light" },
  { name: "Lava", shot: "theme-custom-lava", theme: "lava", mode: "dark" },
  { name: "Candy", shot: "theme-custom-candy", theme: "candy", mode: "light" },
  { name: "Toxic", shot: "theme-custom-toxic", theme: "toxic", mode: "dark" },
  { name: "Paper", shot: "theme-paper-light", theme: "paper", mode: "light" },
];

const base64url = (text: string) => Buffer.from(text, "utf8").toString("base64url");

/** The theme code, as Mumcord's "Share" copies it. */
export const themeCode = (t: Theme) => t.code ?? "mct1." + base64url(JSON.stringify({ v: THEMES_SINCE, n: t.name, dark: t.dark, light: t.light }));

/** The chat message Mumcord turns into a preview card; official clients see it as text. */
export const shareMessage = (t: Theme) => `🎨 Mumcord theme "${t.name}" – ${themeCode(t)}`;

export interface ThemesPage {
  title: string;
  description: string;
  label: string;
  headline: string;
  intro: string;
  since: string;
  dark: string;
  light: string;
  preset: string;
  community: string;
  copy: string;
  copied: string;
  copyFailed: string;
  codeLabel: string;
  presetNote: string;
  colors: Record<ThemeColorKey, string>;
  howTitle: string;
  steps: { title: string; body: string }[];
  shareTitle: string;
  shareBody: string;
  share: string;
  presetsTitle: string;
  presetsIntro: string;
  groups: GalleryGroup[];
}

const source: Record<"de" | "en", ThemesPage> = {
  de: {
    title: "Themes",
    description: "Themes für Mumcord zum Kopieren: die eingebauten Vorlagen und Themes aus der Community, jedes hell und dunkel.",
    label: "Themes",
    headline: "Such dir deinen Look aus.",
    intro: "Jedes Theme gibt es hell und dunkel. Kopier den Code, füg ihn in Mumcord ein, fertig.",
    since: "Themes gibt es ab Mumcord 0.4.0.",
    dark: "Dunkel",
    light: "Hell",
    preset: "Eingebaut",
    community: "Community",
    copy: "Code kopieren",
    copied: "Kopiert!",
    copyFailed: "Kopieren ging nicht. Markier den Code und kopier ihn von Hand.",
    codeLabel: "Theme-Code",
    presetNote: "Schon in Mumcord drin, unter Einstellungen → Darstellung.",
    colors: { background: "Hintergrund", surface: "Fläche", text: "Text", accent: "Akzent", talking: "Spricht", warning: "Warnung", error: "Fehler" },
    howTitle: "So kommt ein Theme in Mumcord",
    steps: [
      { title: "Kopieren", body: "Klick bei einem Theme auf „Code kopieren“." },
      {
        title: "Einfügen",
        body: "In Mumcord unter Einstellungen → Darstellung auf „Importieren …“ klicken und den Code einfügen. Oder schick ihn in einen Chat: Mumcord-Nutzer sehen dort eine Vorschau mit „Design anwenden“.",
      },
      { title: "Loslegen", body: "Das Theme gilt sofort für die ganze App oder, per Rechtsklick auf einen Server, nur für diesen einen." },
    ],
    shareTitle: "Dein Theme hier?",
    shareBody: "Bau dir in Mumcord dein eigenes Theme, klick auf „Teilen“ und schick uns den Code als Issue. Die schönsten kommen auf diese Seite.",
    share: "Theme einreichen",
    presetsTitle: "Eingebaut",
    presetsIntro: "Diese vier sind schon in Mumcord drin.",
    groups: galleryGroups,
  },
  en: {
    title: "Themes",
    description: "Themes to copy into Mumcord: the built-in presets and themes from the community, each in light and dark.",
    label: "Themes",
    headline: "Pick your look.",
    intro: "Every theme comes in light and dark. Copy the code, paste it into Mumcord, done.",
    since: "Themes need Mumcord 0.4.0 or newer.",
    dark: "Dark",
    light: "Light",
    preset: "Built in",
    community: "Community",
    copy: "Copy code",
    copied: "Copied!",
    copyFailed: "Copying didn't work. Select the code and copy it by hand.",
    codeLabel: "Theme code",
    presetNote: "Already in Mumcord, under Settings → Appearance.",
    colors: { background: "Background", surface: "Surface", text: "Text", accent: "Accent", talking: "Talking", warning: "Warning", error: "Error" },
    howTitle: "How a theme gets into Mumcord",
    steps: [
      { title: "Copy", body: "Click “Copy code” on a theme." },
      {
        title: "Paste",
        body: "In Mumcord, go to Settings → Appearance, click “Import…” and paste the code. Or send it in a chat: Mumcord users see a preview there with “Apply theme”.",
      },
      { title: "Enjoy", body: "The theme applies to the whole app right away or, with a right-click on a server, to just that one." },
    ],
    shareTitle: "Your theme here?",
    shareBody: "Build your own theme in Mumcord, click “Share” and send us the code as an issue. The nicest ones make it onto this page.",
    share: "Submit a theme",
    presetsTitle: "Built in",
    presetsIntro: "These four already come with Mumcord.",
    groups: galleryGroups,
  },
};

// Words come from the translation; themes, codes and screenshots always from English, by id.
const merge = (en: ThemesPage, tr: ThemesText | undefined): ThemesPage => {
  if (!tr) return en;
  const words = tr.gallery;
  return {
    ...en,
    ...tr,
    colors: { ...en.colors, ...tr.colors },
    steps: en.steps.map((s, i) => tr.steps?.[i] ?? s),
    groups: en.groups.map((g) => ({
      ...g,
      title: words?.groups[g.id]?.title ?? g.title,
      intro: words?.groups[g.id]?.intro ?? g.intro,
      themes: g.themes.map((t) => ({ ...t, description: words?.descriptions[t.id] ?? t.description })),
    })),
  };
};

export const themesPage = localized(source, (l) => merge(source.en, bundles[l]?.themes));
