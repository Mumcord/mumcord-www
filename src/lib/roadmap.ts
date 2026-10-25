// Content of the detailed roadmap page. It follows the Mumcord spec (specs/01-foundation-specification.md,
// section 2 and the epic table) and the wiki's Roadmap page; the short version lives in the i18n dicts.
import type { Lang } from "../i18n";

export type Status = "done" | "now" | "planned" | "later";

export interface Stage {
  id: string;
  tag: string;
  title: string;
  status: Status;
  version?: string;
  summary: string;
  items: string[];
}

export interface RoadmapPage {
  title: string;
  description: string;
  label: string;
  intro: string;
  status: Record<Status, string>;
  epic1: string;
  epic1Body: string;
  later: string;
  laterBody: string;
  never: string;
  neverItems: string[];
  ideaTitle: string;
  ideaBody: string;
  idea: string;
  changelog: string;
  stages: Stage[];
  epics: Stage[];
}

export const roadmapPage: Record<Lang, RoadmapPage> = {
  de: {
    title: "Roadmap",
    description:
      "Die Roadmap von Mumcord im Detail: was in welcher Stufe von Epic 1 kommt, was danach geplant ist und was es nie geben wird.",
    label: "Wohin es geht",
    intro:
      "Mumcord wird in Epics gebaut, Epic 1 in vier Stufen. 1c und 1d erscheinen zusammen als Version 0.3.0. Hier steht, was jede Stufe bringt. Die Roadmap ist ein Vorschlag: Reihenfolge und Umfang können sich noch ändern.",
    status: { done: "fertig", now: "in Arbeit", planned: "als Nächstes", later: "später" },
    epic1: "Epic 1: der Client für jeden Tag",
    epic1Body: "Alles, was eine Runde am Abend braucht, in vier Stufen. 1a und 1b sind erschienen, 1c und 1d kommen gemeinsam.",
    later: "Danach",
    laterBody: "Größere Bausteine nach Epic 1. Die Reihenfolge steht noch nicht fest.",
    never: "Was es nie geben wird",
    neverItems: [
      "Etwas auf dem Server: keine Begleitdienste, keine Server-Plugins, keine Serverkonfiguration. Mumcord läuft mit jedem normalen Mumble-Server.",
      "Mobile Apps und eine Web-Version.",
    ],
    ideaTitle: "Dir fehlt etwas?",
    ideaBody: "Wünsche landen in den Issues auf GitHub und fließen in die Planung ein.",
    idea: "Feature wünschen",
    changelog: "Was schon erschienen ist, steht im Changelog",
    stages: [
      {
        id: "epic-1a",
        tag: "Epic 1 · 1a",
        title: "Alltags-Client",
        status: "done",
        version: "0.1.0",
        summary: "Der Kern: verbinden, sprechen, schreiben, mitlesen.",
        items: [
          "Einrichtung in einer Minute: Identität, Mikrofon, Sprechmodus",
          "Server-Leiste, mumble://-Links und Zertifikatsprüfung beim ersten Kontakt",
          "Fenster im Discord-Stil mit Kanalliste, Chat und Mitgliederliste",
          "Push-to-Talk mit Tasten und Maustasten, auch unter Wayland, oder Sprachaktivierung",
          "Rauschunterdrückung, Echounterdrückung, Lautstärke pro Person",
          "Chat in Kanälen und privat, Markdown, Bilder, Verlauf auf deinem Rechner",
          "Kanälen folgen, ohne drin zu sein, mit Ungelesen-Zählern",
          "Registrieren, Avatare, Profile, Wiederverbinden mit allem",
          "Hell und dunkel, Deutsch, Englisch, Spanisch, Tray-Symbol, Diagnosedatei",
          "Musikqualität bis 510 kbit/s (nachgereicht in 0.1.1)",
        ],
      },
      {
        id: "epic-1b",
        tag: "Epic 1 · 1b",
        title: "Mehr Chat",
        status: "done",
        version: "0.2.0",
        summary: "Der Chat kann alles, was man von heute erwartet, und bleibt für offizielle Clients lesbar.",
        items: [
          "Link-Vorschauen, pro Nachricht wegklickbar, im Wizard und in den Einstellungen abschaltbar",
          "Karten für YouTube, Twitch und Spotify, die erst beim Klick laden",
          "Externe Bilder im Chat und ein Bildbetrachter mit Zoom",
          "GIF-Favoriten mit Quellenangabe für Giphy und Tenor",
          "@Erwähnungen mit Autovervollständigung, eigenem Ton und eigener Benachrichtigung",
          "Code mit Syntax-Hervorhebung, Formatierungsleiste und Kürzel",
          "Manuelle Schwelle für die Sprachaktivierung",
          "„Läuft gerade“: teilen, welche Musik du hörst (Linux und Windows)",
          "Automatisches Aufräumen von Vorschauen und alten Verläufen",
        ],
      },
      {
        id: "epic-1c",
        tag: "Epic 1 · 1c",
        title: "Im Spiel",
        status: "now",
        version: "0.3.0",
        summary: "Alles, was beim Zocken zählt.",
        items: [
          "Positional Audio über Mumble Link und die offiziellen Spiel-Plugins von Mumble",
          "Overlay direkt im Spiel, auch im exklusiven Vollbild: unter Linux als Vulkan-Layer (wie MangoHud), unter Windows über die Grafikschnittstelle des Spiels (wie bei Discord)",
          "Pro Spiel ein- und ausschaltbar, mit Position, Größe und Deckkraft. Vor dem Einschalten gibt es einen Hinweis zu Anti-Cheat",
          "Startet von selbst mit dem Spiel. Global „Aus“ oder „An“ mit Ausnahmen pro Spiel, im Wizard wählbar, standardmäßig aus",
          "Spiele, die Overlays bekanntermaßen sperren oder bannen, bleiben standardmäßig ausgenommen, mit Begründung",
          "Bei Spielen ohne Overlay im Spiel: ein schwebendes, durchklickbares Fenster, das zeigt, wer spricht. Unter macOS gibt es kein Overlay",
          "„Spielt gerade“, auf Wunsch: erkennt das Spiel über Mumble Link, bekannte Programme und Steam, mit Spiel beitreten über Steam",
          "@Erwähnungen zum Anklicken: Vorschau beim Drüberfahren, Profil per Klick, Menü per Rechtsklick",
          "Schnelleinstellungen per Klick aufs Zahnrad: Vorschauen, Design, Overlay, Teilen von Musik und Spiel, Profil bearbeiten und auf dem Server registrieren",
          "Einstellungen mit Suche: findet Bereiche und einzelne Einstellungen, springt hin und hebt sie hervor. Die Seitenleiste bleibt beim Scrollen stehen",
          "Neuer Bereich Barrierefreiheit: sichtbare Tastaturhinweise, Ansagen für Screenreader und Sprunglinks, einzeln schaltbar",
          "Unter KDE Wayland legt Mumcord die Fensterregel für das Overlay mit einem Klick an",
          "Feinschliff: weniger runde Ecken und gesendete Bilder so scharf, wie das Server-Limit erlaubt",
        ],
      },
      {
        id: "epic-1d",
        tag: "Epic 1 · 1d",
        title: "Mumcord unter sich",
        status: "now",
        version: "0.3.0",
        summary: "Was möglich wird, wenn mehrere Leute Mumcord nutzen, und alles rund um Leute.",
        items: [
          "Geteilter Chatverlauf: Mumcord-Clients reichen bis zu 7 Tage Kanalverlauf weiter, damit du nachlesen kannst, was vor deinem Beitreten geschrieben wurde. Nie private Nachrichten, als „aus dem Verlauf von …“ markiert, abschaltbar",
          "Nur was vor deinem Beitreten oder Folgen geschrieben wurde, ohne doppelte Nachrichten",
          "Knopf „Zu den neuesten“, wenn du weiter oben liest",
          "Abzeichen für Leute, die Mumcord nutzen",
          "Doppelklick auf eine Person öffnet den privaten Chat, Klick heftet ihre Karte an",
          "Neu gestaltetes Profil mit allem, was du für die Person eingestellt hast",
          "Freunde, wiedererkannt am Zertifikat über Server und Umbenennungen hinweg, mit Online-Status",
          "Privater Verlauf mit Freunden bleibt erhalten",
          "Bilder zuverlässig reinziehen und einfügen: Vorschau vor dem Senden, mehrere auf einmal, Kompression auf das Server-Limit",
          "Bilder in voller Größe: Offizielle Clients bekommen eine Vorschau im Rahmen des Server-Limits, Mumcord-Nutzer laden das ganze Bild im Bildbetrachter direkt vom Absender",
        ],
      },
    ],
    epics: [
      {
        id: "epic-2",
        tag: "Epic 2",
        title: "Mehrere Server und eigene Themes",
        status: "later",
        summary: "Überall dabei, und so, wie es dir gefällt.",
        items: [
          "Mit mehreren Servern gleichzeitig verbunden sein und überall mitlesen, auf einem sprechen",
          "Eigene Themes mit Farbeinstellungen und Vorlagen",
          "Themes als Text teilen: Im Chat erscheint eine Vorschaukarte, ein Klick übernimmt das Theme",
        ],
      },
      {
        id: "epic-3",
        tag: "Epic 3",
        title: "Komfort",
        status: "later",
        summary: "Feinschliff für Vielnutzer.",
        items: [
          "Globale Tastenkürzel über Push-to-Talk hinaus",
          "Volles Tray-Menü",
          "Einstellungen aus dem offiziellen Mumble-Client übernehmen",
          "Flüstern und Rufen in andere Kanäle",
          "Öffentlicher Server-Browser",
        ],
      },
      {
        id: "epic-4",
        tag: "Epic 4",
        title: "Admin",
        status: "later",
        summary: "Damit Mumcord den offiziellen Client ganz ersetzen kann.",
        items: ["Rechte (ACLs) bearbeiten", "Bannen", "Kanäle anlegen, verschieben und verwalten"],
      },
      {
        id: "epic-5",
        tag: "Epic 5",
        title: "Auslieferung",
        status: "later",
        summary: "Installieren ohne Warnungen und immer aktuell.",
        items: [
          "Signierte Installer, ohne Warnung von SmartScreen und Gatekeeper",
          "Automatische Updates",
          "Absturzberichte, nur wenn du zustimmst",
          "Paketquellen und Stores",
        ],
      },
      {
        id: "epic-6",
        tag: "Epic 6",
        title: "GIF-Suche",
        status: "later",
        summary: "Suchen statt nur Favoriten.",
        items: [
          "GIF-Suche, ohne einen API-Schlüssel in die App zu packen, den jemand auslesen könnte",
          "Möglich wäre ein kleiner Vermittlungsdienst oder ein eigener Schlüssel; entschieden wird später",
        ],
      },
    ],
  },
  en: {
    title: "Roadmap",
    description:
      "Mumcord's roadmap in detail: what each stage of Epic 1 brings, what is planned after that and what will never happen.",
    label: "Where it's going",
    intro:
      "Mumcord is built in epics, Epic 1 in four stages. 1c and 1d ship together as version 0.3.0. This is what each stage brings. The roadmap is a proposal: order and scope can still change.",
    status: { done: "done", now: "in progress", planned: "up next", later: "later" },
    epic1: "Epic 1: the everyday client",
    epic1Body: "Everything a group needs for an evening, in four stages. 1a and 1b are out, 1c and 1d come together.",
    later: "After that",
    laterBody: "Bigger building blocks after Epic 1. The order isn't fixed yet.",
    never: "What will never happen",
    neverItems: [
      "Anything on the server: no companion services, no server plugins, no server configuration. Mumcord works with any standard Mumble server.",
      "Mobile apps and a web version.",
    ],
    ideaTitle: "Missing something?",
    ideaBody: "Requests go into the issues on GitHub and feed into the planning.",
    idea: "Request a feature",
    changelog: "What's already out is in the changelog",
    stages: [
      {
        id: "epic-1a",
        tag: "Epic 1 · 1a",
        title: "Everyday client",
        status: "done",
        version: "0.1.0",
        summary: "The core: connect, talk, write, read along.",
        items: [
          "Setup in a minute: identity, microphone, talk mode",
          "Server bar, mumble:// links and a certificate check on first contact",
          "Discord-style window with channel list, chat and member list",
          "Push-to-talk with keys and mouse buttons, also on Wayland, or voice activation",
          "Noise suppression, echo cancellation, volume per person",
          "Channel and private chat, Markdown, images, history on your computer",
          "Follow channels without being in them, with unread counts",
          "Registration, avatars, profiles, reconnect with everything",
          "Light and dark, English, German, Spanish, tray icon, diagnostic file",
          "Music quality up to 510 kbit/s (added in 0.1.1)",
        ],
      },
      {
        id: "epic-1b",
        tag: "Epic 1 · 1b",
        title: "More chat",
        status: "done",
        version: "0.2.0",
        summary: "The chat does everything you expect today and stays readable for official clients.",
        items: [
          "Link previews, dismissable per message, can be switched off in the wizard and in settings",
          "YouTube, Twitch and Spotify cards that load only on click",
          "External images in the chat and an image viewer with zoom",
          "GIF favorites with source credits for Giphy and Tenor",
          "@mentions with autocomplete, their own sound and their own notification",
          "Code with syntax highlighting, a formatting toolbar and shortcuts",
          "Manual threshold for voice activation",
          "“Now playing”: share what music you're listening to (Linux and Windows)",
          "Automatic clean-up of previews and old history",
        ],
      },
      {
        id: "epic-1c",
        tag: "Epic 1 · 1c",
        title: "In game",
        status: "now",
        version: "0.3.0",
        summary: "Everything that matters while gaming.",
        items: [
          "Positional audio via Mumble Link and Mumble's official game plugins",
          "Overlay right inside the game, also in exclusive fullscreen: a Vulkan layer on Linux (like MangoHud), a hook into the game's graphics API on Windows (like Discord)",
          "Switched on or off per game, with position, size and opacity. You get an anti-cheat note before turning it on",
          "Starts by itself with the game. Global “Off” or “On” with per-game exceptions, offered in the wizard, off by default",
          "Games known to block or ban overlays stay excluded by default, with the reason shown",
          "For games without the in-game overlay: a floating, click-through window that shows who is talking. There is no overlay on macOS",
          "Optional “Now gaming”: detects the game via Mumble Link, known programs and Steam, with join game via Steam",
          "Clickable @mentions: preview on hover, profile on click, menu on right-click",
          "Quick settings when you click the gear: previews, theme, overlay, sharing music and game, edit profile and register on the server",
          "Settings with search: finds sections and single settings, jumps there and highlights them. The sidebar stays in place while you scroll",
          "A new Accessibility section: visible keyboard hints, screen reader announcements and skip links, each with its own switch",
          "On KDE Wayland Mumcord sets up the window rule for the overlay in one click",
          "Polish: less rounded corners and sent images as sharp as the server limit allows",
        ],
      },
      {
        id: "epic-1d",
        tag: "Epic 1 · 1d",
        title: "Mumcord to Mumcord",
        status: "now",
        version: "0.3.0",
        summary: "What becomes possible when several people use Mumcord, and everything around people.",
        items: [
          "Shared chat history: Mumcord clients pass on up to 7 days of channel history so you can read what was written before you joined. Never private messages, marked as “from …'s history”, can be switched off",
          "Only what was written before you joined or followed, without duplicate messages",
          "A “Jump to newest” button when you're reading further up",
          "A badge for people who use Mumcord",
          "Double-click a person to open the private chat, click to pin their card",
          "Redesigned profile with everything you've set for that person",
          "Friends, recognised by certificate across servers and renames, with online status",
          "Private history with friends is kept",
          "Drop and paste images reliably: preview before sending, several at once, compression to the server limit",
          "Full-size images: official clients get a preview within the server limit, Mumcord users load the whole image in the image viewer straight from the sender",
        ],
      },
    ],
    epics: [
      {
        id: "epic-2",
        tag: "Epic 2",
        title: "Several servers and your own themes",
        status: "later",
        summary: "Everywhere at once, and the way you like it.",
        items: [
          "Connect to several servers at once, read along on all of them, talk on one",
          "Custom themes with colour settings and presets",
          "Share themes as text: the chat shows a preview card, one click imports the theme",
        ],
      },
      {
        id: "epic-3",
        tag: "Epic 3",
        title: "Comfort",
        status: "later",
        summary: "Polish for heavy users.",
        items: [
          "Global shortcuts beyond push-to-talk",
          "Full tray menu",
          "Import settings from the official Mumble client",
          "Whisper and shout to other channels",
          "Public server browser",
        ],
      },
      {
        id: "epic-4",
        tag: "Epic 4",
        title: "Admin",
        status: "later",
        summary: "So Mumcord can fully replace the official client.",
        items: ["Edit permissions (ACLs)", "Bans", "Create, move and manage channels"],
      },
      {
        id: "epic-5",
        tag: "Epic 5",
        title: "Distribution",
        status: "later",
        summary: "Install without warnings and always up to date.",
        items: [
          "Signed installers, no SmartScreen or Gatekeeper warning",
          "Automatic updates",
          "Crash reports, only if you agree",
          "Package repositories and stores",
        ],
      },
      {
        id: "epic-6",
        tag: "Epic 6",
        title: "GIF search",
        status: "later",
        summary: "Search instead of favorites only.",
        items: [
          "GIF search without shipping an API key in the app that anyone could extract",
          "Options are a small relay service or your own key; to be decided later",
        ],
      },
    ],
  },
};
