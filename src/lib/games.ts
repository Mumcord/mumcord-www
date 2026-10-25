// Content of the games page: what the overlay does per platform, the games where the in-game
// overlay stays off by default, and which games deliver positions for positional audio.
// Sources: the app spec (FR-1.42, FR-1.46b, QA.54–QA.74), the app's overlay blocklist
// (crates/engine/src/ingame_overlay/blocklist.json) and Mumble's plugin folder at the server
// version the guide uses (plugins/CMakeLists.txt, retracted plugins left out).
import { localized } from "../i18n";
import { bundles } from "../i18n/locales";
import type { BlockedText, GamesText } from "../i18n/bundle";

export type Support = "yes" | "later" | "no";

export interface OverlayRow {
  title: string;
  linux: Support;
  windows: Support;
  macos: Support;
  note?: string;
}

export interface BlockedGame {
  name: string;
  antiCheat: string;
  reason: string;
  source: string;
}

export interface PluginGame {
  name: string;
  note?: string;
}

export interface GamesPage {
  title: string;
  description: string;
  label: string;
  intro: string;
  toc: { overlay: string; blocked: string; tested: string; positional: string };
  support: Record<Support, string>;
  overlayTitle: string;
  overlayBody: string;
  feature: string;
  overlayRows: OverlayRow[];
  overlayWarning: string;
  testedTitle: string;
  testedBody: string;
  tested: string[];
  notWorkingTitle: string;
  notWorking: string[];
  testedAsk: string;
  blockedTitle: string;
  blockedBody: string;
  antiCheat: string;
  sourceLabel: string;
  positionalTitle: string;
  positionalBody: string;
  linkTitle: string;
  linkBody: string;
  pluginsTitle: string;
  pluginsBody: string;
  pluginsNote: string;
  pluginsSource: string;
  plugins: PluginGame[];
  askTitle: string;
  askBody: string;
  ask: string;
  bug: string;
}

export const PLUGINS_URL = "https://github.com/mumble-voip/mumble/tree/v1.5.735/plugins";

const blockedSources = {
  valorant: "https://support.riotgames.com/valorant/performance/what-is-vanguard",
  lol: "https://support-leagueoflegends.riotgames.com/hc/articles/24169857932435",
  cod: "https://www.pcgamer.com/au/call-of-duty-is-getting-kernel-level-anti-cheat/",
  cs2: "https://support.faceit.com/hc/en-us/articles/9394666828188",
  pubg: "https://massivelyop.com/?p=152613",
  apex: "https://forums.ea.com/discussions/apex-legends-technical-issues-en/untrusted-file-system/5344185",
};

// Game names are the same in both languages; only the notes differ.
const pluginNames = [
  "Age of Chivalry",
  "Among Us",
  "ArmA 2",
  "Battlefield 1",
  "Battlefield 1942",
  "Battlefield 2",
  "Battlefield 2142",
  "Battlefield 3",
  "Battlefield 4",
  "Battlefield: Bad Company 2",
  "Battlefield Heroes",
  "Blacklight: Retribution",
  "Borderlands",
  "Borderlands 2",
  "Breach",
  "Call of Duty 2",
  "Call of Duty 4",
  "Call of Duty: World at War",
  "Call of Duty: Modern Warfare 2 (2009)",
  "Counter-Strike 1.6",
  "Dystopia",
  "Enemy Territory: Quake Wars",
  "Final Fantasy XIV",
  "Garry's Mod",
  "Grand Theft Auto IV",
  "Grand Theft Auto: San Andreas",
  "Grand Theft Auto V",
  "Guild Wars",
  "Insurgency: Modern Infantry Combat",
  "Just Cause 2",
  "League of Legends",
  "Lord of the Rings Online",
  "Quake Live",
  "Rocket League",
  "Source Engine",
  "Sub Rosa",
  "Unreal Tournament",
  "Unreal Tournament 2004",
  "Unreal Tournament 3",
  "Wolfenstein: Enemy Territory",
  "World of Warcraft",
];

const pluginNotes: Record<"de" | "en", Record<string, string>> = {
  de: {
    "Battlefield 4": "32 und 64 Bit",
    "Call of Duty: Modern Warfare 2 (2009)": "Mehrspieler und Special Ops",
    "League of Legends": "Vorsicht: läuft heute mit Riot Vanguard",
    "Source Engine": "Left 4 Dead 1 und 2, unter Linux weitere Source-Spiele",
    "World of Warcraft": "32 und 64 Bit",
  },
  en: {
    "Battlefield 4": "32 and 64 bit",
    "Call of Duty: Modern Warfare 2 (2009)": "multiplayer and Special Ops",
    "League of Legends": "careful: runs with Riot Vanguard today",
    "Source Engine": "Left 4 Dead 1 and 2, more Source games on Linux",
    "World of Warcraft": "32 and 64 bit",
  },
};

const plugins = (notes: Record<string, string>): PluginGame[] => pluginNames.map((name) => ({ name, note: notes[name] }));

const source: Record<"de" | "en", GamesPage> = {
  de: {
    title: "Spiele",
    description:
      "Mumcord beim Spielen: was das Overlay unter Linux, Windows und macOS kann, in welchen Spielen es aus bleibt und welche Spiele Positional Audio liefern.",
    label: "Im Spiel",
    intro:
      "Mit Version 0.3.0 kommt Mumcord ins Spiel: ein Overlay, das zeigt, wer spricht, und Positional Audio, bei dem Stimmen aus der Richtung der anderen kommen. Hier steht, was wo geht und was (noch) nicht.",
    toc: { overlay: "Overlay", blocked: "Overlay aus", tested: "Getestet", positional: "Positional Audio" },
    support: { yes: "ja", later: "später", no: "nein" },
    overlayTitle: "Overlay nach System",
    overlayBody:
      "Es gibt zwei Overlays: eins direkt im Spiel und ein schwebendes Fenster über allem. Beide zeigen nur Leute aus deinem Kanal. Ist das Overlay im Spiel aus oder geht es nicht, springt das Fenster ein.",
    feature: "Funktion",
    overlayRows: [
      {
        title: "Overlay im Spiel",
        linux: "yes",
        windows: "later",
        macos: "no",
        note: "Unter Linux als Vulkan-Layer wie MangoHud, mit OpenGL als Ausweichweg. Unter Windows kommt es nach Tests auf echter Hardware.",
      },
      {
        title: "Steam- und Proton-Spiele",
        linux: "yes",
        windows: "later",
        macos: "no",
        note: "Steam als Flatpak wird noch nicht unterstützt.",
      },
      {
        title: "Startet von selbst mit dem Spiel",
        linux: "yes",
        windows: "later",
        macos: "no",
        note: "Global „An“ oder „Aus“ mit Ausnahmen pro Spiel, im Wizard wählbar, standardmäßig aus.",
      },
      {
        title: "Pro Spiel einstellbar",
        linux: "yes",
        windows: "later",
        macos: "no",
        note: "An oder aus, Position, Größe, Deckkraft und Inhalt. Vor dem Einschalten gibt es einen Hinweis zu Anti-Cheat.",
      },
      {
        title: "Aus bei Spielen mit strengem Anti-Cheat",
        linux: "yes",
        windows: "later",
        macos: "no",
        note: "Die Liste steht weiter unten. Einschalten geht nur mit ausdrücklicher Bestätigung.",
      },
      {
        title: "HDR-Bildschirme",
        linux: "later",
        windows: "later",
        macos: "no",
        note: "Auf HDR-Ausgaben (HDR10/PQ) stimmen die Farben des Overlays im Spiel noch nicht.",
      },
      {
        title: "Overlay-Fenster",
        linux: "yes",
        windows: "yes",
        macos: "no",
        note: "Durchsichtig, durchklickbar und immer im Vordergrund, mit Ecke, Größe und Deckkraft. Unter X11 und Wayland; unter KDE Wayland legt Mumcord die Fensterregel mit einem Klick an. Mit 0.4.0 fällt das Overlay-Fenster weg, dann bleibt nur das Overlay im Spiel.",
      },
      {
        title: "Im Tray und in den Schnelleinstellungen schaltbar",
        linux: "yes",
        windows: "yes",
        macos: "no",
      },
    ],
    overlayWarning:
      "Bekanntes Problem: Schließt du Mumcord, während ein Spiel mit Overlay läuft, kann das Spiel abstürzen. Schließ zuerst das Spiel oder schalte das Overlay im Spiel aus. Behoben wird das mit 0.4.0.",
    testedTitle: "Getestete Spiele",
    testedBody: "Mit diesen Spielen ist das Overlay im Spiel unter Linux ausprobiert:",
    tested: ["Tyr", "Supermarket Simulator", "Die Gilde 1 Remake: Europa 1410", "Stronghold 4 (Demo)", "Escape from Duckov", "Sid Meier's Civilization VII", "theHunter: Call of the Wild", "GG-Party", "Train Sim World 6", "Ready or Not", "Big Ambitions", "Grand Theft Auto V Enhanced", "No Man's Sky", "TCG Card Shop Simulator", "Tropico 6", "Workers & Resources: Soviet Republic", "ARC Raiders"],
    notWorkingTitle: "Geht noch nicht",
    notWorking: ["Project Hospital", "Euro Truck Simulator 2", "Hearts of Iron IV"],
    testedAsk: "Läuft es bei dir in einem anderen Spiel, oder klappt etwas nicht? Schreib es in ein Issue, dann kommt das Spiel auf die Liste.",
    blockedTitle: "Hier bleibt das Overlay im Spiel aus",
    blockedBody:
      "Diese Spiele sperren oder melden Programme, die ins Spiel zeichnen. Mumcord lässt das Overlay im Spiel dort standardmäßig aus, auch wenn es global an ist, und zeigt den Grund an. Das Overlay-Fenster geht trotzdem. Die Liste wird von Hand gepflegt und mit jedem Release aktualisiert.",
    antiCheat: "Anti-Cheat",
    sourceLabel: "Quelle",
    positionalTitle: "Positional Audio (Beta)",
    positionalBody:
      "Stimmen von Leuten im selben Spiel kommen aus ihrer Richtung und werden mit der Entfernung leiser. Die Positionen kommen auf zwei Wegen. In den Einstellungen unter Audio siehst du, woher sie gerade kommen.",
    linkTitle: "Mumble Link",
    linkBody:
      "Spiele und Mods, die Mumble Link unterstützen, liefern ihre Positionen selbst, ohne Plugin. Das geht unter Linux, Windows und macOS.",
    pluginsTitle: "Offizielle Spiel-Plugins von Mumble",
    pluginsBody:
      "Für diese Spiele gibt es offizielle Plugins von Mumble, für Windows und Linux. Mumcord nutzt die Plugins einer installierten Mumble-Version oder aus seinem eigenen Plugin-Ordner. Jedes Plugin lässt sich einzeln einschalten.",
    pluginsNote:
      "Viele Plugins sind für eine bestimmte, oft ältere Spielversion gebaut und lesen den Speicher des Spiels. Manche Anti-Cheat-Systeme können das melden, darauf weist Mumcord vor dem Einschalten hin. Sie bleiben vorerst Beta, auch mit Epic 2; mit echten Spielen geprüft werden sie später.",
    pluginsSource: "Plugins im Mumble-Repository",
    plugins: plugins(pluginNotes.de),
    askTitle: "Ein Spiel fehlt oder macht Probleme?",
    askBody: "Ob ein Spiel funktioniert, eins auf die Sperrliste gehört oder ein Plugin nicht mehr passt: Meld es auf GitHub.",
    ask: "Spiel vorschlagen",
    bug: "Problem melden",
  },
  en: {
    title: "Games",
    description:
      "Mumcord while gaming: what the overlay does on Linux, Windows and macOS, in which games it stays off and which games deliver positional audio.",
    label: "In game",
    intro:
      "With version 0.3.0 Mumcord comes into the game: an overlay that shows who is talking, and positional audio, where voices come from the direction of the others. This is what works where, and what doesn't (yet).",
    toc: { overlay: "Overlay", blocked: "Overlay off", tested: "Tested", positional: "Positional audio" },
    support: { yes: "yes", later: "later", no: "no" },
    overlayTitle: "Overlay by system",
    overlayBody:
      "There are two overlays: one right inside the game and a floating window on top of everything. Both only show people in your channel. If the in-game overlay is off or does not work, the window steps in.",
    feature: "Feature",
    overlayRows: [
      {
        title: "In-game overlay",
        linux: "yes",
        windows: "later",
        macos: "no",
        note: "On Linux a Vulkan layer like MangoHud, with OpenGL as a fallback. On Windows it comes after testing on real hardware.",
      },
      {
        title: "Steam and Proton games",
        linux: "yes",
        windows: "later",
        macos: "no",
        note: "Steam as a Flatpak is not supported yet.",
      },
      {
        title: "Starts with the game",
        linux: "yes",
        windows: "later",
        macos: "no",
        note: "Global “On” or “Off” with exceptions per game, offered in the wizard, off by default.",
      },
      {
        title: "Set per game",
        linux: "yes",
        windows: "later",
        macos: "no",
        note: "On or off, position, size, opacity and content. You get an anti-cheat note before turning it on.",
      },
      {
        title: "Off in games with strict anti-cheat",
        linux: "yes",
        windows: "later",
        macos: "no",
        note: "The list is further down. Turning it on needs an explicit confirmation.",
      },
      {
        title: "HDR screens",
        linux: "later",
        windows: "later",
        macos: "no",
        note: "On HDR outputs (HDR10/PQ) the colours of the in-game overlay are not right yet.",
      },
      {
        title: "Overlay window",
        linux: "yes",
        windows: "yes",
        macos: "no",
        note: "Transparent, click-through and always on top, with corner, size and opacity. On X11 and Wayland; on KDE Wayland Mumcord sets up the window rule in one click. With 0.4.0 the overlay window goes away and only the in-game overlay stays.",
      },
      {
        title: "Switch from the tray and quick settings",
        linux: "yes",
        windows: "yes",
        macos: "no",
      },
    ],
    overlayWarning:
      "Known issue: if you close Mumcord while a game with the overlay is running, the game can crash. Close the game first or turn the in-game overlay off. This gets fixed in 0.4.0.",
    testedTitle: "Tested games",
    testedBody: "The in-game overlay has been tried on Linux with these games:",
    tested: ["Tyr", "Supermarket Simulator", "Die Gilde 1 Remake: Europa 1410", "Stronghold 4 (Demo)", "Escape from Duckov", "Sid Meier's Civilization VII", "theHunter: Call of the Wild", "GG-Party", "Train Sim World 6", "Ready or Not", "Big Ambitions", "Grand Theft Auto V Enhanced", "No Man's Sky", "TCG Card Shop Simulator", "Tropico 6", "Workers & Resources: Soviet Republic", "ARC Raiders"],
    notWorkingTitle: "Doesn't work yet",
    notWorking: ["Project Hospital", "Euro Truck Simulator 2", "Hearts of Iron IV"],
    testedAsk: "Does it work for you in another game, or does something break? Open an issue and the game goes on the list.",
    blockedTitle: "Where the in-game overlay stays off",
    blockedBody:
      "These games block or report programs that draw into the game. Mumcord keeps the in-game overlay off there by default, even when it is globally on, and shows the reason. The overlay window still works. The list is curated by hand and updated with every release.",
    antiCheat: "Anti-cheat",
    sourceLabel: "Source",
    positionalTitle: "Positional audio (beta)",
    positionalBody:
      "Voices of people in the same game come from their direction and get quieter with distance. Positions come in two ways. Settings → Audio shows where they are coming from right now.",
    linkTitle: "Mumble Link",
    linkBody:
      "Games and mods that support Mumble Link deliver their positions themselves, no plugin needed. This works on Linux, Windows and macOS.",
    pluginsTitle: "Mumble's official game plugins",
    pluginsBody:
      "Mumble has official plugins for these games, for Windows and Linux. Mumcord uses the plugins of an installed Mumble or from its own plugin folder. Each plugin can be switched on by itself.",
    pluginsNote:
      "Many plugins are built for one specific, often older game version and read the game's memory. Some anti-cheat systems may flag that, and Mumcord tells you before you turn one on. They stay beta for now, Epic 2 included; checking them with real games comes later.",
    pluginsSource: "Plugins in the Mumble repository",
    plugins: plugins(pluginNotes.en),
    askTitle: "A game is missing or causes trouble?",
    askBody: "Whether a game works, one belongs on the block list or a plugin no longer fits: report it on GitHub.",
    ask: "Suggest a game",
    bug: "Report a problem",
  },
};

const blockedSource: Record<"de" | "en", BlockedGame[]> = {
  de: [
    {
      name: "VALORANT",
      antiCheat: "Riot Vanguard",
      reason: "Anti-Cheat im Kernel, das Software, die es für unsicher hält, nicht ins Spiel lässt und meldet.",
      source: blockedSources.valorant,
    },
    {
      name: "League of Legends",
      antiCheat: "Riot Vanguard",
      reason: "Seit 2024 mit Riot Vanguard, das Software, die es für unsicher hält, nicht ins Spiel lässt.",
      source: blockedSources.lol,
    },
    {
      name: "Call of Duty: Modern Warfare II/III, Warzone, Black Ops 6",
      antiCheat: "Ricochet",
      reason: "Der Treiber im Kernel überwacht Programme, die mit dem Spiel arbeiten. Unbekannte Programme, die ins Spiel zeichnen, können auffallen.",
      source: blockedSources.cod,
    },
    {
      name: "Counter-Strike 2 (FACEIT-Matches)",
      antiCheat: "FACEIT Anti-Cheat",
      reason: "Erkennt Overlays und erlaubt nur wenige bekannte wie Steam und NVIDIA. Das Matchmaking von Valve (VAC) verbietet Overlays nicht.",
      source: blockedSources.cs2,
    },
    {
      name: "PUBG: BATTLEGROUNDS",
      antiCheat: "BattlEye",
      reason: "Sperrt Programme, die sich ins Spiel einklinken oder das Bild verändern, zum Beispiel ReShade.",
      source: blockedSources.pubg,
    },
    {
      name: "Apex Legends",
      antiCheat: "Easy Anti-Cheat",
      reason: "Beendet das Spiel, wenn es Dateien oder Programme findet, die es nicht prüfen kann. Der EA-Support rät dann, Overlays zu schließen.",
      source: blockedSources.apex,
    },
  ],
  en: [
    {
      name: "VALORANT",
      antiCheat: "Riot Vanguard",
      reason: "Kernel-level anti-cheat that keeps software it considers unsafe out of the game and reports it.",
      source: blockedSources.valorant,
    },
    {
      name: "League of Legends",
      antiCheat: "Riot Vanguard",
      reason: "Uses Riot Vanguard since 2024, which keeps software it considers unsafe out of the game.",
      source: blockedSources.lol,
    },
    {
      name: "Call of Duty: Modern Warfare II/III, Warzone, Black Ops 6",
      antiCheat: "Ricochet",
      reason: "Its kernel driver watches programs that interact with the game; unknown programs drawing into it risk being flagged.",
      source: blockedSources.cod,
    },
    {
      name: "Counter-Strike 2 (FACEIT matches)",
      antiCheat: "FACEIT Anti-Cheat",
      reason: "Detects overlays and only allows a few known ones such as Steam and NVIDIA. Valve's own matchmaking (VAC) does not forbid overlays.",
      source: blockedSources.cs2,
    },
    {
      name: "PUBG: BATTLEGROUNDS",
      antiCheat: "BattlEye",
      reason: "Blocks programs that hook into the game or change its visuals, for example ReShade.",
      source: blockedSources.pubg,
    },
    {
      name: "Apex Legends",
      antiCheat: "Easy Anti-Cheat",
      reason: "Closes the game when it finds files or programs it cannot verify; EA support advises closing overlays then.",
      source: blockedSources.apex,
    },
  ],
};

const mergeGames = (en: GamesPage, tr: GamesText | undefined): GamesPage => {
  if (!tr) return en;
  const { pluginNotes: notes, ...words } = tr;
  // Game titles are not translated, so the tested list always comes from English.
  return { ...en, ...words, tested: en.tested, notWorking: en.notWorking, plugins: plugins({ ...pluginNotes.en, ...notes }) };
};

// Anti-cheat names and sources stay as in English; only the game name and the reason change.
const mergeBlocked = (en: BlockedGame[], tr: BlockedText[] | undefined): BlockedGame[] =>
  en.map((b, i) => (tr?.[i] ? { ...b, name: tr[i].name, reason: tr[i].reason } : b));

export const gamesPage = localized(source, (l) => mergeGames(source.en, bundles[l]?.games));
export const blockedGames = localized(blockedSource, (l) => mergeBlocked(blockedSource.en, bundles[l]?.blocked));
