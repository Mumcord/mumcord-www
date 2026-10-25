// Content of the detailed roadmap page. It follows the Mumcord spec (specs/01-foundation-specification.md,
// section 2 and the epic table) and the wiki's Roadmap page; the short version lives in the i18n dicts.
import { localized } from "../i18n";
import { bundles } from "../i18n/locales";
import type { RoadmapText } from "../i18n/bundle";

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
  /** Shown as a pill; left out when the whole epic ships as one version. */
  version?: string;
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

const source: Record<"de" | "en", RoadmapPage> = {
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
      "Ein Vermittlungs- oder Relay-Server für direkte Verbindungen: Klappt keine direkte Verbindung, nutzt Mumcord den Weg über den Mumble-Server.",
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
        title: "Mehrere Server, Themes und Feinschliff",
        status: "planned",
        version: "0.4.0",
        summary: "Alles erscheint zusammen als Version 0.4.0: mehrere Server, eigene Themes, das Overlay im Spiel für Windows und die ersten direkten Verbindungen zwischen Mumcord-Nutzern. Positional Audio, Spiel-Plugins und Bilder in voller Größe bleiben dabei Beta.",
                groups: [
          {
            title: "Mehrere Server gleichzeitig",
            items: [
              "Bis zu 5 Server gleichzeitig verbunden, einstellbar von 1 bis 15. Sprechen auf einem, mitlesen, schreiben und benachrichtigt werden auf allen",
              "Server mit „Beim Start immer verbinden“ und die zuletzt offenen verbinden sich von selbst; jeder Server verbindet sich nach einem Abbruch für sich neu",
              "Benachrichtigungen und private Nachrichten mit Servernamen, Benachrichtigungen pro Server stummschaltbar",
              "„Kanal beitreten“ auch bei Freunden auf einem anderen Server; Links mit mumble:// zu einem verbundenen Server springen direkt hin",
            ],
          },
          {
            title: "Themes und Look",
            items: [
              "Eigene Themes aus wenigen Grundfarben, mit Vorlagen und Live-Vorschau; Mumcord sorgt für gut lesbaren Kontrast",
              "Themes als Text teilen: Im Chat erscheint eine Vorschaukarte, ein Klick übernimmt das Theme für die App oder für einen Server",
              "Auf Wunsch ein eigenes Theme pro Server",
              "Der Look dieser Website in der App: leuchtende Knöpfe, Farbverläufe, Glas-Effekte und leichtes Filmkorn, abschaltbar",
            ],
          },
          {
            title: "Feinschliff und große Server",
            items: [
              "Eigene Auswahllisten statt der Browser-Optik, alle Eingabefelder in den Einstellungen sauber ausgerichtet",
              "Ein schmaler Fortschrittsbalken unter Bildern im Chat, während die volle Größe lädt",
              "Große Server frieren beim ersten Anzeigen nicht mehr ein, dazu die Schalter „Leere Kanäle ausblenden“ und „Sprechende zuerst“",
              "Nachrichten gelten erst als gesendet, wenn der Server sie bestätigt; abgelehnte lassen sich erneut senden",
              "Profilkommentar mit Fett, Kursiv, Links und Listen",
            ],
          },
          {
            title: "Verbindungsqualität",
            items: [
              "Ping, Paketverlust, Bandbreite und UDP oder TCP im Profil und im Menü einer Person, auch für dich selbst",
              "Ein kleines Signal-Symbol bei Leuten mit schwacher Verbindung, abschaltbar",
            ],
          },
          {
            title: "Overlay",
            items: [
              "Overlay im Spiel jetzt auch unter Windows, über DirectX 11 und 12, mit denselben Einstellungen und derselben Anti-Cheat-Liste wie unter Linux",
              "Richtige Farben in HDR-Spielen, Spiele aus Flatpak-Steam, randlose Vollbildspiele unter KDE und GNOME geprüft",
              "Behoben: Schließt oder aktualisierst du Mumcord, stürzt ein laufendes Spiel nicht mehr ab",
              "Das Overlay-Fenster fällt weg; wer es genutzt hat, bekommt einmal einen Hinweis und landet in den Einstellungen für das Overlay im Spiel",
              "„Spiel beitreten“ auch für Spiele, die ihre Serveradresse über Mumble Link mitteilen",
            ],
          },
          {
            title: "Direkt von Mumcord zu Mumcord",
            items: [
              "Direkte, verschlüsselte Verbindungen zwischen Mumcord-Nutzern über IPv6, die Portfreigabe des Routers oder das eigene Netz, ohne fremden Server",
              "Mumcord fragt vorher einmal, weil die anderen dabei deine IP-Adresse sehen; in den Einstellungen änderbar",
              "Bilder in voller Größe kommen darüber viel schneller an; klappt keine direkte Verbindung, läuft es wie bisher",
              "Schließt du den Bildbetrachter, bricht die Übertragung ab",
            ],
          },
          {
            title: "Zusammen schauen (Beta)",
            items: [
              "YouTube-Watch-Party: Alle im Sprachkanal schauen dasselbe Video gleichzeitig, jeder kann pausieren und spulen",
              "Bildschirm oder Fenster teilen, auf Wunsch mit Ton, für bis zu 8 Zuschauer, standardmäßig in 720p mit 30 Bildern pro Sekunde",
            ],
          },
          {
            title: "Installation unter Linux und Updates",
            items: [
              "Pakete für Debian und Ubuntu (.deb), Fedora und openSUSE (.rpm), Arch (AUR: mumcord-bin) und das AppImage, jeweils für x86_64 und ARM64",
              "Installation mit einer Zeile im Terminal, mit Menüeintrag und Unterstützung für Links mit mumble://",
              "„Mumcord beim Anmelden starten“ auf allen Systemen",
              "Auf Wunsch ein Hinweis, wenn eine neue Version da ist; Mumcord fragt dafür höchstens einmal am Tag bei GitHub nach",
            ],
          },
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
      "A relay server for direct connections: if no direct path works, Mumcord goes through the Mumble server instead.",
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
        title: "Several servers, themes and polish",
        status: "planned",
        version: "0.4.0",
        summary: "Everything ships together as version 0.4.0: several servers, your own themes, the in-game overlay on Windows and the first direct connections between Mumcord users. Positional audio, game plugins and full-size images stay beta.",
                groups: [
          {
            title: "Several servers at once",
            items: [
              "Up to 5 servers connected at once, adjustable from 1 to 15. Talk on one, read, write and get notified on all of them",
              "Servers marked “Always connect at start” and the ones open last time connect by themselves; each server reconnects on its own after a drop",
              "Notifications and private messages show the server name, notifications can be muted per server",
              "“Join channel” also for friends on another server; mumble:// links to a connected server jump straight there",
            ],
          },
          {
            title: "Themes and look",
            items: [
              "Your own themes from a few key colours, with presets and a live preview; Mumcord keeps the contrast readable",
              "Share themes as text: the chat shows a preview card, one click applies the theme to the app or to a server",
              "A theme per server if you like",
              "This website's look in the app: glowing buttons, gradients, glass effects and a light film grain, can be switched off",
            ],
          },
          {
            title: "Polish and big servers",
            items: [
              "Themed dropdowns instead of the browser's, every input in the settings neatly aligned",
              "A slim progress bar under chat images while the full size loads",
              "Big servers no longer freeze when first shown, plus “Hide empty channels” and “Talking people first” switches",
              "Messages only count as sent once the server confirms them; refused ones can be sent again",
              "Profile comment with bold, italic, links and lists",
            ],
          },
          {
            title: "Connection quality",
            items: [
              "Ping, packet loss, bandwidth and UDP or TCP in a person's profile and menu, for yourself too",
              "A small signal icon next to people with a weak connection, can be switched off",
            ],
          },
          {
            title: "Overlay",
            items: [
              "The in-game overlay on Windows too, through DirectX 11 and 12, with the same settings and anti-cheat list as on Linux",
              "Correct colours in HDR games, games from Flatpak Steam, borderless fullscreen games checked on KDE and GNOME",
              "Fixed: closing or updating Mumcord no longer crashes a running game",
              "The overlay window goes away; if you used it, a one-time notice takes you to the in-game overlay settings",
              "“Join game” also for games that share their server address through Mumble Link",
            ],
          },
          {
            title: "Straight from Mumcord to Mumcord",
            items: [
              "Direct, encrypted connections between Mumcord users over IPv6, your router's port mapping or your own network, without anyone else's server",
              "Mumcord asks once first, because the others see your IP address; you can change it in the settings",
              "Full-size images arrive much faster that way; if no direct connection works, it works as before",
              "Closing the image viewer stops the transfer",
            ],
          },
          {
            title: "Watching together (beta)",
            items: [
              "YouTube watch party: everyone in the voice channel watches the same video at once, anyone can pause and seek",
              "Share a screen or a window, with sound if you like, for up to 8 viewers, 720p at 30 frames per second by default",
            ],
          },
          {
            title: "Installing on Linux and updates",
            items: [
              "Packages for Debian and Ubuntu (.deb), Fedora and openSUSE (.rpm), Arch (AUR: mumcord-bin) and the AppImage, each for x86_64 and ARM64",
              "Install with one line in the terminal, with a menu entry and support for mumble:// links",
              "“Start Mumcord when I log in” on every system",
              "Optionally a hint when a new version is out; Mumcord asks GitHub at most once a day",
            ],
          },
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

// Words from the translation; ids, tags, statuses and versions from English.
const mergeRoadmap = (en: RoadmapPage, tr: RoadmapText | undefined): RoadmapPage => {
  if (!tr) return en;
  const { epics: _epics, ...words } = tr;
  return {
    ...en,
    ...words,
    epics: en.epics.map((e) => {
      const te = tr.epics.find((x) => x.id === e.id);
      if (!te) return e;
      return {
        ...e,
        title: te.title,
        summary: te.summary,
        items: e.items && (te.items ?? e.items),
        groups: e.groups?.map((g, i) => ({ ...g, title: te.groups?.[i]?.title ?? g.title, items: te.groups?.[i]?.items ?? g.items })),
      };
    }),
  };
};

export const roadmapPage = localized(source, (l) => mergeRoadmap(source.en, bundles[l]?.roadmap));
