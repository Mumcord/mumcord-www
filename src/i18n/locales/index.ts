// Collects every translation file in this folder. A language without a file is served in English
// until its file exists.
import type { LocaleBundle } from "../bundle";
import type { ExtraLang } from "../langs";

const files = import.meta.glob<{ default: LocaleBundle }>("./*.json", { eager: true });

export const bundles: Partial<Record<ExtraLang, LocaleBundle>> = Object.fromEntries(
  Object.entries(files).map(([path, mod]) => [path.slice(2, -5), mod.default]),
);
