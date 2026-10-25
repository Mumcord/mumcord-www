// Hand-written release notes. GitHub's generated notes only list pull requests, so the
// changelog page tells people what changed for them. The date and download link come from
// the matching GitHub release once it is published (see pages/changelog).
import type { Lang } from "../i18n";

export interface ChangeGroup {
  title: string;
  items: string[];
}

export interface ChangelogEntry {
  version: string;
  summary: string;
  groups: ChangeGroup[];
  known?: string[];
}

export const changelog: Record<Lang, ChangelogEntry[]> = {
  de: [
    {
      version: "0.1.1",
      summary:
        "Ein kleines Update für alle, die über Mumble Musik hören oder machen: ein Schalter für Musikqualität.",
      groups: [
        {
          title: "Sprache und Audio",
          items: [
            "Neuer Schalter „Musikqualität“ unter Einstellungen → Audio, standardmäßig aus. Eingeschaltet darf die Bitrate bis zum Limit des Servers steigen, höchstens 510 kbit/s statt 96 kbit/s, und der Opus-Encoder ist auf Musik statt Sprache eingestellt.",
            "Mit Musikqualität sind Rauschunterdrückung und automatische Lautstärke aus, damit Musik nicht verfälscht wird. Am besten zusammen mit Push-to-Talk nutzen.",
            "Die Bitrate passt sich weiterhin an Paketverlust an und sinkt bei schlechter Verbindung.",
          ],
        },
      ],
    },
    {
      version: "0.1.0",
      summary:
        "Die erste öffentliche Alpha: der Alltags-Client aus Epic 1, Stufe 1a. Läuft mit jedem normalen Mumble-Server, ohne dass dort etwas installiert wird.",
      groups: [
        {
          title: "Verbinden",
          items: [
            "Server-Leiste mit gespeicherten Servern; hinzufügen per Adresse oder mumble://-Link, bearbeiten, sortieren, entfernen.",
            "mumble://-Links aus dem Browser öffnen Mumcord und springen direkt in den Kanal.",
            "Zertifikatsprüfung beim ersten Kontakt mit Fingerabdruck, klare Warnung bei Änderungen.",
            "Automatisches Wiederverbinden mit Kanal, Stumm/Taub-Status und gefolgten Kanälen. Nach einem Neustart Angebot, dem letzten Sprachkanal wieder beizutreten.",
            "Verbinden ist zuerst nur lesend (stumm und taub), bis du einem Kanal beitrittst. Abschaltbar in den Einstellungen.",
          ],
        },
        {
          title: "Kanäle und Chat",
          items: [
            "Kanälen per Auge folgen oder über das Server-Menü allen folgen; Ungelesenes als Zähler, auch für den eigenen Kanal.",
            "Chat im Discord-Stil mit Avataren und gruppierten Nachrichten, wahlweise kompakt. Markdown, Bilder einfügen oder reinziehen.",
            "Kanalbeschreibung und Willkommensnachricht oben im Chat angeheftet.",
            "Avatar-Stapel für eingeklappte und volle Kanäle, Profilvorschau beim Drüberfahren.",
            "Rechtsklick auf Personen: Profil, für mich stummschalten, Lautstärke 0–200 %, private Nachricht.",
            "Status-Icons mit Tooltip für Gast, registriert, stumm, taub, vom Server stummgeschaltet und unterdrückt.",
            "Große Server: Suche mit Strg+K, „Zu meinem Kanal springen“, eingeklappter Start ab etwa 50 Kanälen. Getestet mit 1000 Personen in 305 Kanälen.",
            "Kanal- und Mitgliederliste in der Breite ziehbar.",
          ],
        },
        {
          title: "Sprache und Audio",
          items: [
            "Sprachaktivierung oder Push-to-Talk mit Tasten und Maustasten, auch im Hintergrund. Unter Wayland über das Shortcut-Portal oder im Kompatibilitätsmodus.",
            "KI-Rauschunterdrückung, Echounterdrückung und automatische Verstärkung.",
            "Bitrate passt sich dem Netz an; verschlüsselte Sprache über UDP mit TCP-Fallback.",
            "Geräte wechseln ohne neu zu verbinden, Mikrofontest mit Wiedergabe der eigenen Stimme.",
          ],
        },
        {
          title: "Komfort",
          items: [
            "Einrichtung in etwa einer Minute: Identität, Mikrofon, Sprechmodus.",
            "Benachrichtigungen für neue Nachrichten als Pop-up in der App, als Systembenachrichtigung, beides oder aus.",
            "Kurze Töne pro Ereignis, auch beim Beitreten und Auflegen.",
            "Tray-Symbol, Start beim Anmelden, optional minimiert.",
            "Helles und dunkles Design; Deutsch, Englisch und Spanisch.",
            "Identität im sicheren Speicher des Systems, Import und Export als PKCS#12.",
            "Diagnosedatei ohne Chatinhalte oder persönliche Daten. Keine Telemetrie.",
          ],
        },
      ],
      known: [
        "Die Installer sind unsigniert: Windows SmartScreen und macOS Gatekeeper warnen beim ersten Start.",
        "Eine Serververbindung gleichzeitig. Mehrere Server kommen mit Epic 2.",
        "Chat-Extras wie Link-Vorschauen und @Erwähnungen folgen mit Stufe 1b, Positional Audio und Overlay mit Stufe 1c, geteilter Chatverlauf und Freunde mit Stufe 1d.",
      ],
    },
  ],
  en: [
    {
      version: "0.1.1",
      summary: "A small update for everyone who listens to or plays music over Mumble: a music quality switch.",
      groups: [
        {
          title: "Voice and audio",
          items: [
            "New “Music quality” switch in Settings → Audio, off by default. When on, the bitrate may rise to the server's limit, at most 510 kbit/s instead of 96 kbit/s, and the Opus encoder is tuned for music instead of speech.",
            "With music quality on, noise suppression and automatic gain are off so music isn't distorted. Works best with push-to-talk.",
            "The bitrate still adapts to packet loss and drops on a bad connection.",
          ],
        },
      ],
    },
    {
      version: "0.1.0",
      summary:
        "The first public alpha: the everyday client from Epic 1, stage 1a. Works with any standard Mumble server, with nothing to install there.",
      groups: [
        {
          title: "Connecting",
          items: [
            "Server bar with saved servers; add one by address or mumble:// link, edit, reorder, remove.",
            "mumble:// links from the browser open Mumcord and jump straight into the channel.",
            "Certificate check on first contact with the fingerprint, and a clear warning if it changes.",
            "Automatic reconnect that restores your channel, mute/deafen state and followed channels. After a restart Mumcord offers to rejoin your last voice channel.",
            "Connecting is read-only at first (muted and deafened) until you join a channel. Can be switched off in settings.",
          ],
        },
        {
          title: "Channels and chat",
          items: [
            "Follow channels with the eye, or follow all from the server menu; unread counts, also for your own channel.",
            "Discord-style chat with avatars and grouped messages, or a compact layout. Markdown, paste or drop images.",
            "Channel description and welcome message pinned at the top of the chat.",
            "Avatar stacks for collapsed and crowded channels, profile preview on hover.",
            "Right-click a person: profile, mute for me, volume 0–200 %, private message.",
            "Status icons with tooltips for guest, registered, muted, deafened, server-muted and suppressed.",
            "Big servers: search with Ctrl+K, “Jump to my channel”, collapsed start from about 50 channels. Tested with 1000 people in 305 channels.",
            "Resizable channel and member lists.",
          ],
        },
        {
          title: "Voice and audio",
          items: [
            "Voice activation or push-to-talk with keys and mouse buttons, also in the background. On Wayland via the shortcuts portal or in compatibility mode.",
            "AI noise suppression, echo cancellation and automatic gain.",
            "Bitrate adapts to the network; encrypted voice over UDP with TCP fallback.",
            "Switch devices without reconnecting, microphone test that plays your own voice back.",
          ],
        },
        {
          title: "Comfort",
          items: [
            "Setup in about a minute: identity, microphone, talk mode.",
            "Notifications for new messages as an in-app pop-up, a system notification, both or off.",
            "Short sounds per event, including when you join and hang up.",
            "Tray icon, start at login, optionally minimized.",
            "Light and dark themes; English, German and Spanish.",
            "Identity in the system's secure storage, import and export as PKCS#12.",
            "Diagnostic file without chat contents or personal data. No telemetry.",
          ],
        },
      ],
      known: [
        "Installers are unsigned: Windows SmartScreen and macOS Gatekeeper warn on first start.",
        "One server connection at a time. Several servers come with Epic 2.",
        "Chat extras like link previews and @mentions follow in stage 1b, positional audio and the overlay in stage 1c, shared chat history and friends in stage 1d.",
      ],
    },
  ],
};
