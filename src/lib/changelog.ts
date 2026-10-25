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
      version: "0.3.0",
      summary:
        "Der Abschluss von Epic 1: Mumcord im Spiel mit Positional Audio und Overlay, und alles, was zwischen Mumcord-Nutzern möglich wird, vom geteilten Chatverlauf bis zu Freunden. Dazu alle 24 Amtssprachen der EU.",
      groups: [
        {
          title: "Im Spiel",
          items: [
            "Positional Audio (Beta): Stimmen von Leuten im selben Spiel kommen aus ihrer Richtung und werden mit der Entfernung leiser. Positionen kommen über Mumble Link oder die offiziellen Spiel-Plugins von Mumble, die einzeln schaltbar sind. Die Einstellungen zeigen, woher die Positionen gerade kommen.",
            "Ein „3D“-Symbol zeigt, wer gerade Positionsdaten sendet, auch bei offiziellen Mumble-Clients und bei dir selbst. Positional Audio lässt sich auch in den Schnelleinstellungen schalten.",
            "Overlay im Spiel unter Linux: als Vulkan-Layer mit OpenGL als Ausweichweg, auch in Steam- und Proton-Spielen, getestet unter anderem mit Tyr und Supermarket Simulator. Pro Spiel schaltbar, global „An“ oder „Aus“, im Wizard wählbar und standardmäßig aus. Vor dem Einschalten gibt es einen Hinweis zu Anti-Cheat.",
            "Standardmäßig ohne Overlay im Spiel, weil ihr Anti-Cheat Overlays sperrt oder meldet: VALORANT und League of Legends (Riot Vanguard), Call of Duty mit Modern Warfare II/III, Warzone und Black Ops 6 (Ricochet), Counter-Strike 2 in FACEIT-Matches (FACEIT Anti-Cheat), PUBG: BATTLEGROUNDS (BattlEye) und Apex Legends (Easy Anti-Cheat). Mumcord zeigt den Grund an; einschalten geht nur mit ausdrücklicher Bestätigung.",
            "Overlay-Fenster unter Linux und Windows: durchsichtig, durchklickbar und immer im Vordergrund, mit Ecke, Größe und Deckkraft, schaltbar im Tray. Es zeigt nur Leute aus deinem Kanal. Unter KDE Wayland legt Mumcord die passende Fensterregel mit einem Klick an.",
            "„Spielt gerade“, auf Wunsch: Andere sehen, was du spielst, mit Steam-Bild und Spielzeit. „Spiel beitreten“ für Steam-Spiele, die das unterstützen.",
          ],
        },
        {
          title: "Mumcord unter sich",
          items: [
            "Geteilter Chatverlauf: Mumcord-Clients reichen bis zu 7 Tage Kanalverlauf weiter, damit du nachlesen kannst, was vor deinem Beitreten geschrieben wurde. Nie private Nachrichten, als „aus dem Verlauf von …“ markiert, ohne doppelte Nachrichten und abschaltbar.",
            "Knopf „Zu den neuesten“ mit Zähler, wenn du weiter oben liest.",
            "Ein Mumcord-Abzeichen zeigt, wer Mumcord nutzt, auch bei dir selbst.",
            "Bilder in voller Größe (Beta): Offizielle Clients bekommen eine Vorschau im Rahmen des Server-Limits, Mumcord-Nutzer laden das ganze Bild im Bildbetrachter direkt vom Absender. Anbieten und Laden lassen sich einzeln abschalten.",
            "Freunde: wiedererkannt am Zertifikat, auch über Server und Umbenennungen hinweg. Die Freunde-Liste in der rechten Spalte zeigt, wer online ist und in welchem Kanal. Der private Verlauf mit Freunden bleibt erhalten.",
          ],
        },
        {
          title: "Leute",
          items: [
            "Doppelklick auf eine Person öffnet den privaten Chat. Ein Klick heftet ihre Karte an, mit Knöpfen für private Nachricht und Profil.",
            "Neues Profil mit Banner, Abzeichen, Musik oder Spiel und allen Einstellungen für die Person. Änderungen gelten sofort, mit kurzem „Gespeichert“.",
            "Das Menü per Rechtsklick auf Leute hat Symbole und Schalter statt Beschriftungen wie „Stummschalten“ und „Lautschalten“.",
            "@Erwähnungen sind anklickbar: Vorschau beim Drüberfahren, Profil per Klick, Menü per Rechtsklick.",
            "„‹Kanal› beitreten“ im Menü einer Person oder eines Freundes bringt dich in ihren Kanal. Erlaubt der Server das nicht, steht der Grund daneben.",
            "Die rechte Spalte hat einklappbare Bereiche: „In ‹Kanal›“, „In anderen Kanälen“ mit allen anderen auf dem Server und „Freunde“. Mumcord merkt sich, was offen ist. Links steht „Serverübersicht“ über dem Kanalbaum.",
          ],
        },
        {
          title: "Einstellungen und Komfort",
          items: [
            "Alle 24 Amtssprachen der EU, auch im Tray-Menü. In der Auswahl steht jede Sprache in ihrem eigenen Namen und lässt sich unter jedem Namen finden. Übersetzt hat das Team ohne Prüfung durch Muttersprachler: Fehler gern als Issue melden.",
            "Ein neuer Schritt im Wizard zeigt vor der Wahl der Link-Vorschauen, womit sich Mumcord verbindet und wann, mit Link zur vollständigen Datenschutzerklärung.",
            "Ein Klick aufs Zahnrad öffnet die Schnelleinstellungen: Vorschauen, Design, Overlay, Musik und Spiel teilen, Profil bearbeiten und auf dem Server registrieren. Positional Audio und die anderen Beta-Funktionen stehen in einer eigenen, einklappbaren Gruppe.",
            "Einstellungen mit Suche, die zur Einstellung springt und sie hervorhebt. Die Seitenleiste bleibt beim Scrollen stehen.",
            "Neuer Bereich Barrierefreiheit: sichtbare Tastaturhinweise, Ansagen für Screenreader und Sprunglinks, einzeln schaltbar.",
            "Unter „Über“ gibt es Links zum Changelog und zum Melden von Fehlern und Wünschen.",
            "Kompatibilitätsmodus unter KDE: Ein Knopf richtet die „Unterstützung für ältere X11-Anwendungen“ ein, damit Push-to-Talk mit Maustasten auch im Hintergrund geht.",
          ],
        },
        {
          title: "Behoben",
          items: [
            "Bilder reinziehen und einfügen klappt zuverlässig: Vorschau vor dem Senden, mehrere Bilder auf einmal, keine file://-Links mehr im Eingabefeld.",
            "Gesendete Bilder sind scharf: bis 1920 px, PNG oder JPEG je nach Bild, das Server-Limit wird voll genutzt.",
            "Ein GIF zu den Favoriten zu ziehen ruckelt nicht mehr, und die Favoritenauswahl bleibt auch mit vielen GIFs flüssig.",
          ],
        },
      ],
      known: [
        "Positional Audio, die Spiel-Plugins und Bilder in voller Größe sind Beta: Wie gut es klappt, hängt vom Spiel ab.",
        "Das Overlay im Spiel unter Windows folgt später; bis dahin gibt es dort das Overlay-Fenster. Unter macOS gibt es kein Overlay.",
        "„Kanal beitreten“ für Freunde auf einem anderen Server kommt mit Epic 2, wenn Mumcord mehrere Server gleichzeitig kann.",
        "Die Installer sind weiterhin unsigniert. Die Signierung für Windows und macOS ist vorbereitet und startet, sobald die Zertifikate eingerichtet sind.",
      ],
    },
    {
      version: "0.2.0",
      summary:
        "Der Chat kann jetzt deutlich mehr. Links, Videos, Bilder und GIFs erscheinen direkt im Chat, dazu @Erwähnungen, Code-Hervorhebung und eine Formatierungsleiste. Ab dieser Version steht Mumcord unter der GNU AGPL v3.",
      groups: [
        {
          title: "Chat",
          items: [
            "Link-Vorschauen mit Titel, Beschreibung und Bild. An standardmäßig, abschaltbar im Wizard und in den Einstellungen; Vorschauen lassen sich pro Nachricht wegklicken.",
            "Karten für YouTube, Twitch und Spotify. Der Player lädt erst, wenn du draufklickst.",
            "Externe Bilder und Bildlinks direkt im Chat. Ein Klick öffnet den Bildbetrachter mit Zoom, Verschieben, Pfeiltasten durch alle Bilder des Chats und „Bild speichern“.",
            "GIFs: Links zu Giphy und Tenor spielen direkt ab, mit Hinweis auf die Quelle. Per Rechtsklick als Favorit speichern und über den GIF-Knopf wieder senden. Eine GIF-Suche gibt es bewusst nicht, dafür müsste ein API-Schlüssel in die App.",
            "@Erwähnungen mit Autovervollständigung. Erwähnungen werden hervorgehoben, benachrichtigen auch in stillen Kanälen und haben einen eigenen Ton; Ton und Benachrichtigung sind getrennt schaltbar.",
            "Code-Blöcke und Inline-Code mit Syntax-Hervorhebung.",
            "Formatierungsleiste und Kürzel: Strg+B fett, Strg+I kursiv, Strg+Shift+X durchgestrichen, Strg+E Code, Strg+K Link.",
            "Aufräumen: Vorschauen und Bilder werden nach einstellbaren Tagen gelöscht (Standard 7), auf Wunsch auch alte Chatverläufe.",
          ],
        },
        {
          title: "Sprache und Audio",
          items: [
            "Sprachaktivierung mit manueller Schwelle: ein Regler über der Live-Pegelanzeige, mit kurzer Haltezeit, damit Wortenden nicht abgeschnitten werden.",
            "„Läuft gerade“, standardmäßig aus: Andere Mumcord-Nutzer sehen Titel, Cover und Fortschritt der Musik, die du hörst. Offizielle Clients sehen eine Zeile im Kommentar. Unter Linux und Windows; macOS noch nicht.",
            "Ist das gewählte Audiogerät weg, startet Mumcord die Streams nicht mehr ständig neu, sondern versucht es im Hintergrund weiter.",
          ],
        },
        {
          title: "Kleinigkeiten",
          items: [
            "Der Einstellungen-Knopf ist jetzt ein Zahnrad.",
            "Bei Push-to-Talk zeigt das Mikrofon unten links durchgestrichen an, solange die Taste nicht gedrückt ist.",
            "Der Chat, den du gerade offen hast, zeigt keinen kurz aufblitzenden Ungelesen-Zähler mehr.",
          ],
        },
        {
          title: "Lizenz",
          items: [
            "Ab 0.2.0 steht Mumcord unter der GNU AGPL v3. Versionen bis 0.1.1 bleiben MIT.",
          ],
        },
      ],
      known: [
        "Die Installer sind weiterhin unsigniert.",
        "„Läuft gerade“ funktioniert unter macOS noch nicht.",
        "Positional Audio, Overlay, „Spielt gerade“, geteilter Chatverlauf und Freunde folgen mit 0.3.0.",
      ],
    },
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
        "Die erste öffentliche Alpha: der Alltags-Client aus Epic 1. Läuft mit jedem normalen Mumble-Server, ohne dass dort etwas installiert wird.",
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
        "Chat-Extras wie Link-Vorschauen und @Erwähnungen folgen mit 0.2.0, Positional Audio, Overlay, geteilter Chatverlauf und Freunde mit 0.3.0.",
      ],
    },
  ],
  en: [
    {
      version: "0.3.0",
      summary:
        "Completing Epic 1: Mumcord in game with positional audio and an overlay, and everything that becomes possible between Mumcord users, from shared chat history to friends. Plus all 24 official EU languages.",
      groups: [
        {
          title: "In game",
          items: [
            "Positional audio (beta): voices of people in the same game come from their direction and get quieter with distance. Positions come via Mumble Link or Mumble's official game plugins, which can be switched one by one. Settings show where positions are coming from.",
            "A “3D” icon shows who is sending positional data right now, for official Mumble clients and yourself too. Positional audio can also be switched in quick settings.",
            "In-game overlay on Linux: a Vulkan layer with OpenGL as a fallback, also in Steam and Proton games, tested with Tyr and Supermarket Simulator among others. Set per game, global “On” or “Off”, offered in the wizard and off by default. You get an anti-cheat note before turning it on.",
            "No in-game overlay by default, because their anti-cheat blocks or reports overlays: VALORANT and League of Legends (Riot Vanguard), Call of Duty with Modern Warfare II/III, Warzone and Black Ops 6 (Ricochet), Counter-Strike 2 in FACEIT matches (FACEIT Anti-Cheat), PUBG: BATTLEGROUNDS (BattlEye) and Apex Legends (Easy Anti-Cheat). Mumcord shows the reason; turning it on needs an explicit confirmation.",
            "Overlay window on Linux and Windows: transparent, click-through and always on top, with corner, size and opacity, switchable from the tray. It only shows people in your channel. On KDE Wayland Mumcord sets up the matching window rule in one click.",
            "Optional “Now gaming”: others see what you're playing, with the Steam picture and play time. “Join game” for Steam games that support it.",
          ],
        },
        {
          title: "Mumcord to Mumcord",
          items: [
            "Shared chat history: Mumcord clients pass on up to 7 days of channel history so you can read what was written before you joined. Never private messages, marked as “from …'s history”, without duplicates and can be switched off.",
            "A “Jump to newest” button with a count when you're reading further up.",
            "A Mumcord badge shows who uses Mumcord, yourself included.",
            "Full-size images (beta): official clients get a preview within the server limit, Mumcord users load the whole image in the image viewer straight from the sender. Offering and loading can each be switched off.",
            "Friends: recognised by certificate, also across servers and renames. The Friends list in the right column shows who is online and in which channel. Private history with friends is kept.",
          ],
        },
        {
          title: "People",
          items: [
            "Double-click a person to open the private chat. A click pins their card, with buttons for private message and profile.",
            "New profile with banner, badge, music or game and all settings for that person. Changes apply instantly with a short “Saved”.",
            "The right-click menu on people has icons and switches instead of labels like “Mute” and “Unmute”.",
            "@mentions are clickable: preview on hover, profile on click, menu on right-click.",
            "“Join ‹channel›” in the menu of a person or a friend takes you to their channel. If the server does not allow it, the reason is shown next to it.",
            "The right column has collapsible sections: “In ‹channel›”, “In other channels” with everyone else on the server, and “Friends”. Mumcord remembers what is open. On the left, “Server overview” sits above the channel tree.",
          ],
        },
        {
          title: "Settings and comfort",
          items: [
            "All 24 official EU languages, the tray menu included. The picker lists each language in its own name and finds it by any of its names. The team did the translations without review by native speakers: please report mistakes as an issue.",
            "A new wizard step before the link preview choice shows what Mumcord connects to and when, with a link to the full privacy statement.",
            "A click on the gear opens quick settings: previews, theme, overlay, sharing music and game, edit profile and register on the server. Positional audio and the other beta features sit in their own collapsible group.",
            "Settings with search that jumps to the setting and highlights it. The sidebar stays in place while you scroll.",
            "A new Accessibility section: visible keyboard hints, screen reader announcements and skip links, each with its own switch.",
            "“About” links to the changelog and to reporting bugs and requesting features.",
            "Compatibility mode on KDE: a button sets up “Legacy X11 App Support” so mouse-button push-to-talk also works in the background.",
          ],
        },
        {
          title: "Fixed",
          items: [
            "Dropping and pasting images works reliably: preview before sending, several images at once, no more file:// links in the input.",
            "Sent images are sharp: up to 1920 px, PNG or JPEG depending on the image, using the full server limit.",
            "Dragging a GIF to the favorites no longer stutters, and the favorites picker stays smooth with many GIFs.",
          ],
        },
      ],
      known: [
        "Positional audio, the game plugins and full-size images are beta: how well they work depends on the game.",
        "The in-game overlay on Windows comes later; until then Windows has the overlay window. There is no overlay on macOS.",
        "“Join channel” for friends on another server comes with Epic 2, once Mumcord can be on several servers at once.",
        "Installers are still unsigned. Signing for Windows and macOS is prepared and starts once the certificates are set up.",
      ],
    },
    {
      version: "0.2.0",
      summary:
        "The chat does a lot more now. Links, videos, images and GIFs show up right in the chat, plus @mentions, code highlighting and a formatting toolbar. From this version Mumcord is licensed under the GNU AGPL v3.",
      groups: [
        {
          title: "Chat",
          items: [
            "Link previews with title, description and image. On by default, can be switched off in the wizard and in settings; previews can be dismissed per message.",
            "Cards for YouTube, Twitch and Spotify. The player loads only when you click it.",
            "External images and image links right in the chat. A click opens the image viewer with zoom, panning, arrow keys through all images of the chat and “Save image”.",
            "GIFs: Giphy and Tenor links play inline, with a credit to the source. Save them as favorites by right-click and send them again from the GIF button. There is no GIF search on purpose, since it would need an API key inside the app.",
            "@mentions with autocomplete. Mentions are highlighted, notify you even in quiet channels and have their own sound; sound and notification have separate switches.",
            "Code blocks and inline code with syntax highlighting.",
            "Formatting toolbar and shortcuts: Ctrl+B bold, Ctrl+I italic, Ctrl+Shift+X strikethrough, Ctrl+E code, Ctrl+K link.",
            "Clean-up: previews and images are deleted after a number of days you choose (default 7), old chat history too if you want.",
          ],
        },
        {
          title: "Voice and audio",
          items: [
            "Voice activation with a manual threshold: a slider over the live level meter, with a short hold so word endings aren't cut off.",
            "“Now playing”, off by default: other Mumcord users see the title, cover and progress of the music you're listening to. Official clients see a line in your comment. On Linux and Windows; not on macOS yet.",
            "When the chosen audio device is gone, Mumcord no longer keeps restarting the streams but retries in the background.",
          ],
        },
        {
          title: "Small things",
          items: [
            "The settings button is a gear now.",
            "With push-to-talk, the microphone at the bottom left shows crossed out while the key isn't held.",
            "The chat you have open no longer flashes a brief unread count.",
          ],
        },
        {
          title: "License",
          items: [
            "From 0.2.0 Mumcord is licensed under the GNU AGPL v3. Versions up to 0.1.1 stay MIT.",
          ],
        },
      ],
      known: [
        "Installers are still unsigned.",
        "“Now playing” doesn't work on macOS yet.",
        "Positional audio, the overlay, “Now gaming”, shared chat history and friends follow in 0.3.0.",
      ],
    },
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
        "The first public alpha: the everyday client from Epic 1. Works with any standard Mumble server, with nothing to install there.",
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
        "Chat extras like link previews and @mentions follow in 0.2.0, positional audio, the overlay, shared chat history and friends in 0.3.0.",
      ],
    },
  ],
};
