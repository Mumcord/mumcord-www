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
  items?: string[];
  groups?: StageGroup[];
}

// A themed block inside an epic, released with the given version.
export interface StageGroup {
  title: string;
  version: string;
  items: string[];
}

export interface RoadmapPage {
  title: string;
  description: string;
  label: string;
  intro: string;
  status: Record<Status, string>;
  epicsTitle: string;
  epicsBody: string;
  never: string;
  neverItems: string[];
  ideaTitle: string;
  ideaBody: string;
  idea: string;
  changelog: string;
  epics: Stage[];
}

export const roadmapPage: Record<Lang, RoadmapPage> = {
  de: {
    title: "Roadmap",
    description:
      "Die Roadmap von Mumcord im Detail: was Epic 1 bringt, was danach geplant ist und was es nie geben wird.",
    label: "Wohin es geht",
    intro:
      "Mumcord wird in Epics gebaut. Epic 1 wird mit Version 0.3.0 komplett. Hier steht, was jedes Epic bringt. Die Roadmap ist ein Vorschlag: Reihenfolge und Umfang können sich noch ändern.",
    status: { done: "fertig", now: "in Arbeit", planned: "als Nächstes", later: "später" },
    epicsTitle: "Die Epics",
    epicsBody: "Epic 1 ist der Client für jeden Tag. Danach kommen größere Bausteine, deren Reihenfolge noch nicht feststeht.",
    never: "Was es nie geben wird",
    neverItems: [
      "Etwas auf dem Server: keine Begleitdienste, keine Server-Plugins, keine Serverkonfiguration. Mumcord läuft mit jedem normalen Mumble-Server.",
      "Mobile Apps und eine Web-Version.",
    ],
    ideaTitle: "Dir fehlt etwas?",
    ideaBody: "Wünsche landen in den Issues auf GitHub und fließen in die Planung ein.",
    idea: "Feature wünschen",
    changelog: "Was schon erschienen ist, steht im Changelog",
    epics: [
      {
        id: "epic-1",
        tag: "Epic 1",
        title: "Der Client für jeden Tag",
        status: "done",
        version: "0.3.0",
        summary: "Alles, was eine Runde am Abend braucht. Erschienen in drei Versionen, 0.3.0 schließt Epic 1 ab.",
        groups: [
          {
            title: "Alltags-Client",
            version: "0.1.0",
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
            title: "Mehr Chat",
            version: "0.2.0",
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
            title: "Im Spiel",
            version: "0.3.0",
            items: [
            "Positional Audio (Beta) über Mumble Link und die offiziellen Spiel-Plugins von Mumble, auch in den Schnelleinstellungen schaltbar. Ein „3D“-Symbol zeigt, wer gerade Positionsdaten sendet",
            "Overlay direkt im Spiel, auch im exklusiven Vollbild: unter Linux als Vulkan-Layer (wie MangoHud), auch in Steam- und Proton-Spielen, getestet zum Beispiel mit Tyr und Supermarket Simulator. Unter Windows folgt es später über die Grafikschnittstelle des Spiels (wie bei Discord), bis dahin gibt es das Overlay-Fenster",
            "Pro Spiel ein- und ausschaltbar, mit Position, Größe und Deckkraft. Vor dem Einschalten gibt es einen Hinweis zu Anti-Cheat",
            "Startet von selbst mit dem Spiel. Global „Aus“ oder „An“ mit Ausnahmen pro Spiel, im Wizard wählbar, standardmäßig aus",
            "Spiele, deren Anti-Cheat Overlays sperrt oder meldet, bleiben standardmäßig ausgenommen, mit Begründung: VALORANT und League of Legends (Riot Vanguard), Call of Duty mit Modern Warfare II/III, Warzone und Black Ops 6 (Ricochet), Counter-Strike 2 in FACEIT-Matches (FACEIT Anti-Cheat), PUBG: BATTLEGROUNDS (BattlEye) und Apex Legends (Easy Anti-Cheat)",
            "Bei Spielen ohne Overlay im Spiel: ein schwebendes, durchklickbares Fenster, das zeigt, wer spricht. Unter macOS gibt es kein Overlay",
            "„Spielt gerade“, auf Wunsch: erkennt das Spiel über Mumble Link, bekannte Programme und Steam, mit Spiel beitreten über Steam",
            "@Erwähnungen zum Anklicken: Vorschau beim Drüberfahren, Profil per Klick, Menü per Rechtsklick",
            "Menü per Rechtsklick auf Leute mit Symbolen und Schaltern, neues Profil, in dem Änderungen sofort gelten",
            "Schnelleinstellungen per Klick aufs Zahnrad: Vorschauen, Design, Overlay, Teilen von Musik und Spiel, Profil bearbeiten und auf dem Server registrieren",
            "Einstellungen mit Suche: findet Bereiche und einzelne Einstellungen, springt hin und hebt sie hervor. Die Seitenleiste bleibt beim Scrollen stehen",
            "Neuer Bereich Barrierefreiheit: sichtbare Tastaturhinweise, Ansagen für Screenreader und Sprunglinks, einzeln schaltbar",
            "Unter KDE Wayland legt Mumcord die Fensterregel für das Overlay mit einem Klick an",
            "Feinschliff: weniger runde Ecken und gesendete Bilder so scharf, wie das Server-Limit erlaubt",
            "Alle 24 Amtssprachen der EU, auch im Tray-Menü, in der Auswahl jeweils im eigenen Namen",
            "Ein Schritt zum Datenschutz im Wizard: womit sich Mumcord verbindet und wann",
            ],
          },
          {
            title: "Mumcord unter sich",
            version: "0.3.0",
            items: [
            "Geteilter Chatverlauf: Mumcord-Clients reichen bis zu 7 Tage Kanalverlauf weiter, damit du nachlesen kannst, was vor deinem Beitreten geschrieben wurde. Nie private Nachrichten, als „aus dem Verlauf von …“ markiert, abschaltbar",
            "Nur was vor deinem Beitreten oder Folgen geschrieben wurde, ohne doppelte Nachrichten",
            "Knopf „Zu den neuesten“, wenn du weiter oben liest",
            "Abzeichen für Leute, die Mumcord nutzen",
            "Doppelklick auf eine Person öffnet den privaten Chat, Klick heftet ihre Karte an",
            "Neu gestaltetes Profil mit allem, was du für die Person eingestellt hast",
            "Freunde, wiedererkannt am Zertifikat über Server und Umbenennungen hinweg, mit Online-Status",
            "Privater Verlauf mit Freunden bleibt erhalten",
            "Freunde-Liste in der rechten Spalte, mit dem Kanal, in dem sie gerade sind",
            "„‹Kanal› beitreten“ per Rechtsklick auf eine Person oder einen Freund",
            "Rechte Spalte mit einklappbaren Bereichen: „In ‹Kanal›“, „In anderen Kanälen“ und „Freunde“",
            "Bilder zuverlässig reinziehen und einfügen: Vorschau vor dem Senden, mehrere auf einmal, Kompression auf das Server-Limit",
            "Bilder in voller Größe (Beta): Offizielle Clients bekommen eine Vorschau im Rahmen des Server-Limits, Mumcord-Nutzer laden das ganze Bild im Bildbetrachter direkt vom Absender. Anbieten und Laden einzeln abschaltbar",
            ],
          },
        ],
      },
      {
        id: "epic-2",
        tag: "Epic 2",
        title: "Mehrere Server und eigene Themes",
        status: "planned",
        summary: "Überall dabei, und so, wie es dir gefällt.",
        items: [
          "Mit mehreren Servern gleichzeitig verbunden sein und überall mitlesen, auf einem sprechen",
          "Eigene Themes mit Farbeinstellungen und Vorlagen",
          "Themes als Text teilen: Im Chat erscheint eine Vorschaukarte, ein Klick übernimmt das Theme",
          "Aus Epic 1 übernommen: Overlay im Spiel unter Windows, mit Flatpak-Steam und auf HDR-Bildschirmen",
          "Aus Epic 1 übernommen: „Kanal beitreten“ bei Freunden auf einem anderen Server",
          "Aus Epic 1 übernommen: die Spiel-Plugins mit echten Spielen prüfen, damit Positional Audio, Plugins und Bilder in voller Größe die Beta verlassen",
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
          "Signierte Installer, ohne Warnung von SmartScreen und Gatekeeper: für Windows und macOS schon im Release-Ablauf vorbereitet, aktiv, sobald die Zertifikate eingerichtet sind",
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
      "Mumcord's roadmap in detail: what Epic 1 brings, what is planned after that and what will never happen.",
    label: "Where it's going",
    intro:
      "Mumcord is built in epics. Epic 1 is completed by version 0.3.0. This is what each epic brings. The roadmap is a proposal: order and scope can still change.",
    status: { done: "done", now: "in progress", planned: "up next", later: "later" },
    epicsTitle: "The epics",
    epicsBody: "Epic 1 is the everyday client. After that come bigger building blocks whose order isn't fixed yet.",
    never: "What will never happen",
    neverItems: [
      "Anything on the server: no companion services, no server plugins, no server configuration. Mumcord works with any standard Mumble server.",
      "Mobile apps and a web version.",
    ],
    ideaTitle: "Missing something?",
    ideaBody: "Requests go into the issues on GitHub and feed into the planning.",
    idea: "Request a feature",
    changelog: "What's already out is in the changelog",
    epics: [
      {
        id: "epic-1",
        tag: "Epic 1",
        title: "The everyday client",
        status: "done",
        version: "0.3.0",
        summary: "Everything a group needs for an evening. Released over three versions, 0.3.0 completes Epic 1.",
        groups: [
          {
            title: "Everyday client",
            version: "0.1.0",
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
            title: "More chat",
            version: "0.2.0",
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
            title: "In game",
            version: "0.3.0",
            items: [
            "Positional audio (beta) via Mumble Link and Mumble's official game plugins, also switchable in quick settings. A “3D” icon shows who is sending positional data right now",
            "Overlay right inside the game, also in exclusive fullscreen: a Vulkan layer on Linux (like MangoHud), also in Steam and Proton games, tested with Tyr and Supermarket Simulator for example. On Windows it comes later via the game's graphics API (like Discord); until then there is the overlay window",
            "Switched on or off per game, with position, size and opacity. You get an anti-cheat note before turning it on",
            "Starts by itself with the game. Global “Off” or “On” with per-game exceptions, offered in the wizard, off by default",
            "Games whose anti-cheat blocks or reports overlays stay excluded by default, with the reason shown: VALORANT and League of Legends (Riot Vanguard), Call of Duty with Modern Warfare II/III, Warzone and Black Ops 6 (Ricochet), Counter-Strike 2 in FACEIT matches (FACEIT Anti-Cheat), PUBG: BATTLEGROUNDS (BattlEye) and Apex Legends (Easy Anti-Cheat)",
            "For games without the in-game overlay: a floating, click-through window that shows who is talking. There is no overlay on macOS",
            "Optional “Now gaming”: detects the game via Mumble Link, known programs and Steam, with join game via Steam",
            "Clickable @mentions: preview on hover, profile on click, menu on right-click",
            "Right-click menu on people with icons and switches, a new profile where changes apply instantly",
            "Quick settings when you click the gear: previews, theme, overlay, sharing music and game, edit profile and register on the server",
            "Settings with search: finds sections and single settings, jumps there and highlights them. The sidebar stays in place while you scroll",
            "A new Accessibility section: visible keyboard hints, screen reader announcements and skip links, each with its own switch",
            "On KDE Wayland Mumcord sets up the window rule for the overlay in one click",
            "Polish: less rounded corners and sent images as sharp as the server limit allows",
            "All 24 official EU languages, the tray menu included, each listed in its own name",
            "A privacy step in the wizard: what Mumcord connects to and when",
            ],
          },
          {
            title: "Mumcord to Mumcord",
            version: "0.3.0",
            items: [
            "Shared chat history: Mumcord clients pass on up to 7 days of channel history so you can read what was written before you joined. Never private messages, marked as “from …'s history”, can be switched off",
            "Only what was written before you joined or followed, without duplicate messages",
            "A “Jump to newest” button when you're reading further up",
            "A badge for people who use Mumcord",
            "Double-click a person to open the private chat, click to pin their card",
            "Redesigned profile with everything you've set for that person",
            "Friends, recognised by certificate across servers and renames, with online status",
            "Private history with friends is kept",
            "Friends list in the right column, with the channel they are in",
            "“Join ‹channel›” on right-click on a person or a friend",
            "Right column with collapsible sections: “In ‹channel›”, “In other channels” and “Friends”",
            "Drop and paste images reliably: preview before sending, several at once, compression to the server limit",
            "Full-size images (beta): official clients get a preview within the server limit, Mumcord users load the whole image in the image viewer straight from the sender. Offering and loading can each be switched off",
            ],
          },
        ],
      },
      {
        id: "epic-2",
        tag: "Epic 2",
        title: "Several servers and your own themes",
        status: "planned",
        summary: "Everywhere at once, and the way you like it.",
        items: [
          "Connect to several servers at once, read along on all of them, talk on one",
          "Custom themes with colour settings and presets",
          "Share themes as text: the chat shows a preview card, one click imports the theme",
          "Carried over from Epic 1: in-game overlay on Windows, with Flatpak Steam and on HDR screens",
          "Carried over from Epic 1: “Join channel” for friends on another server",
          "Carried over from Epic 1: check the game plugins with real games so positional audio, plugins and full-size images can leave beta",
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
          "Signed installers, no SmartScreen or Gatekeeper warning: already prepared in the release workflow for Windows and macOS, active once the certificates are set up",
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
