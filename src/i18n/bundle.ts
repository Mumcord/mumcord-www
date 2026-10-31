// The text of one extra language (see langs.ts), in one file under ./locales/<code>.json.
// It holds words only: screenshots, versions, statuses, links and code come from the English
// content and are merged in by id or position, so a translation cannot break them. Anything a
// translation leaves out falls back to English.
import type { Dict } from "./de";
import type { FeaturesPage } from "../lib/features";
import type { ChangelogEntry } from "../lib/changelog";
import type { RoadmapPage } from "../lib/roadmap";
import type { GamesPage } from "../lib/games";
import type { Guide, Configurator } from "../lib/server-guide";
import type { ThemesPage } from "../lib/themes";
import type { MumbotText } from "../lib/mumbot";
import type { ToolPage, ToolsPage } from "../lib/tools";

export interface FeaturesText extends Omit<FeaturesPage, "groups"> {
  groups: {
    id: string;
    title: string;
    features: { id: string; title: string; body: string; alt?: string }[];
  }[];
}

export interface RoadmapText extends Omit<RoadmapPage, "epics"> {
  epics: {
    id: string;
    title: string;
    summary: string;
    items?: string[];
    /** Mockup captions in the English order. */
    groups?: { title: string; items: string[]; mockups?: string[] }[];
  }[];
}

export interface GamesText extends Omit<GamesPage, "plugins"> {
  /** Notes for the plugin list, keyed by the (untranslated) game name. */
  pluginNotes: Record<string, string>;
}

/** The blocked games in the English order; anti-cheat names and sources stay as they are. */
export interface BlockedText {
  name: string;
  reason: string;
}

export interface GuideText extends Omit<Guide, "steps" | "configurator"> {
  configurator?: Partial<Omit<Configurator, "options" | "quality" | "notes">> & {
    options?: Partial<Configurator["options"]>;
    quality?: Partial<Configurator["quality"]>;
    notes?: Partial<Configurator["notes"]>;
  };
  steps: { id: string; title: string; body: string[]; after?: string[] }[];
}

export interface LocaleBundle {
  dict: Dict;
  features: FeaturesText;
  changelog: Omit<ChangelogEntry, never>[];
  roadmap: RoadmapText;
  games: GamesText;
  blocked: BlockedText[];
  server: GuideText;
  /** Missing in translations made before the themes page; English fills in. */
  themes?: ThemesText;
  /** Missing in translations made before the Mumbot page; English fills in. */
  mumbot?: MumbotText;
  /** Missing in translations made before the mumpeer and mumquiz pages; English fills in. */
  tools?: ToolsText;
}

export interface ToolsText extends Partial<Omit<ToolsPage, "pages">> {
  pages?: { mumpeer?: Partial<ToolPage>; mumquiz?: Partial<ToolPage> };
}

export interface ThemesText extends Omit<ThemesPage, "groups"> {
  /** Gallery words by group and theme id; the themes themselves come from English. */
  gallery?: { groups: Record<string, { title: string; intro: string }>; descriptions: Record<string, string> };
}
