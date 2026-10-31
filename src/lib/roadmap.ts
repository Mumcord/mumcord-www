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
  /** Items already built on main (indexes into items), ticked off on the page. */
  done?: number[];
  /** Design sketches from the issues, by file name in src/assets/mockups (without .png). */
  mockups?: Mockup[];
}

export interface Mockup {
  shot: string;
  issue: number;
  caption: string;
}

export interface RoadmapPage {
  title: string;
  description: string;
  label: string;
  intro: string;
  status: Record<Status, string>;
  doneTitle: string;
  nextTitle: string;
  laterTitle: string;
  /** "{n}" is replaced with the number of delivered items. */
  delivered: string;
  showAll: string;
  statDone: string;
  statReleases: string;
  statNext: string;
  mockupsTitle: string;
  mockupsNote: string;
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
      "Die Roadmap von Mumcord im Detail: was jedes Epic bringt, was fertig ist und was als Nächstes kommt.",
    label: "Wohin es geht",
    intro:
      "Mumcord wächst in Epics: große Etappen, die jeweils mit einer eigenen Version erscheinen. Hier siehst du, was schon geschafft ist, woran gerade gebaut wird und was danach kommt. Die Roadmap ist ein Vorschlag, Reihenfolge und Umfang können sich ändern.",
    status: { done: "fertig", now: "in Arbeit", planned: "als Nächstes", later: "später" },
    doneTitle: "Geschafft",
    nextTitle: "Als Nächstes",
    laterTitle: "Danach",
    delivered: "{n} Punkte geliefert",
    showAll: "Alle anzeigen",
    statDone: "Epics fertig",
    statReleases: "Releases",
    statNext: "Nächstes Ziel",
    mockupsTitle: "Entwürfe aus den Issues",
    mockupsNote: "Skizzen, nicht final. Namen und Inhalte sind erfunden.",
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
            "Fenster mit Server-Leiste, Kanalliste, Chat und Mitgliederliste",
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
            "Overlay direkt im Spiel, auch im exklusiven Vollbild: unter Linux als Vulkan-Layer (wie MangoHud), auch in Steam- und Proton-Spielen, getestet zum Beispiel mit Tyr und Supermarket Simulator. Unter Windows folgt es später über die Grafikschnittstelle des Spiels, bis dahin gibt es das Overlay-Fenster",
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
        status: "now",
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
              "Eigene Themes aus wenigen Grundfarben, mit Vorlagen und Live-Vorschau, jedes in einer dunklen und einer hellen Version; die zweite erzeugt Mumcord selbst und sorgt für gut lesbaren Kontrast",
              "Themes als Farbkreise auswählen; eigene Themes speichern, umbenennen und löschen, die helle und die dunkle Version nebeneinander bearbeiten",
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
              "Gesendete Nachrichten erscheinen sofort, leicht grau, bis der Server sie bestätigt; klappt das nicht, lassen sie sich erneut senden oder löschen",
              "Profilkommentar mit Fett, Kursiv, Links und Listen",
              "Ein eigener Regler für die Bitrate, bis zum höchsten Wert, den Server und Mumble zulassen",
              "Falsches Passwort? Ein Fenster fragt gleich nach dem richtigen und speichert es auf Wunsch",
              "Wer einem Kanal nur zuhört, steht mit einem Ohr-Symbol in der normalen Liste statt in einer eigenen Gruppe",
              "Die Einstellungen für eine Person, etwa Lautstärke und Stummschalten, stehen eingeklappt im Profil, mit kurzem Hinweis, wenn etwas verstellt ist",
              "Kanäle mit Passwort: Mumcord fragt danach und merkt es sich pro Server, gesperrte Kanäle zeigen ein Schloss",
              "Tooltips im Look des Themes statt der grauen System-Tooltips",
            ],
          },
          {
            title: "Chat",
            items: [
              "Auf Nachrichten antworten, im Kanal und privat: mit einem kurzen Zitat, das auch im offiziellen Mumble-Client lesbar ist; ein Klick darauf springt zum Original",
              "Bei langen Nachrichten steht das Profilbild oben beim Namen, und beim Scrollen bleiben Bild und Name sichtbar",
              "Antwortet jemand auf deine Nachricht, zählt das wie eine @Erwähnung",
              "„> Text“ wird zum Zitat, auch per Knopf; „>_>“ und ähnliche Smileys bleiben, wie sie sind",
              "Willkommensnachricht des Servers und Kanalbeschreibung lassen sich wegklicken und tauchen wieder auf, wenn sie sich ändern",
              "Rechtsklick auf einen Link im Chat: kopieren oder öffnen",
              "Behoben: YouTube- und Twitch-Videos spielen auch in den fertigen Versionen unter Linux und macOS direkt im Chat",
            ],
          },
          {
            title: "Verbindungsqualität",
            items: [
              "Die Verbindung im Profil auf einen Blick (gut, mittel, schwach), aufgeklappt mit Ping, Paketverlust, Bandbreite und UDP oder TCP, auch für dich selbst; im Menü einer Person kurz Ping und Verbindungsart. Admins sehen zusätzlich Client und Betriebssystem",
              "Ein kleines Signal-Symbol bei Leuten mit schwacher Verbindung, abschaltbar",
            ],
          },
          {
            title: "Overlay",
            items: [
              "Overlay im Spiel jetzt auch unter Windows, als eigenes, durchklickbares Fenster über dem Spiel. Es lädt nichts ins Spiel und geht deshalb auch in Spielen mit Anti-Cheat; nur im exklusiven Vollbild bleibt es unsichtbar",
              "Richtige Farben in HDR-Spielen, Spiele aus Flatpak-Steam, randlose Vollbildspiele unter KDE und GNOME geprüft",
              "Behoben: Schließt oder aktualisierst du Mumcord, stürzt ein laufendes Spiel nicht mehr ab",
              "Overlay im Spiel auch in nativen Linux-Spielen mit OpenGL, zum Beispiel Project Hospital, Euro Truck Simulator 2 und Hearts of Iron IV: Mumcord zeigt die passende Steam-Startoption zum Kopieren, die auch nach Updates gilt",
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
              "Schließt du den Bildbetrachter, lädt das Bild im Hintergrund weiter; abbrechen geht mit dem × am Fortschrittsbalken",
            ],
          },
          {
            title: "Zusammen schauen (Beta)",
            items: [
              "YouTube-Watch-Party: Alle im Sprachkanal schauen dasselbe Video gleichzeitig, jeder kann pausieren und spulen, mit gemeinsamer Playlist, zu der alle etwas hinzufügen",
              "Bildschirm oder Fenster teilen, für bis zu 8 Zuschauer, standardmäßig in 720p mit 30 Bildern pro Sekunde; unter Windows und macOS auf Wunsch mit dem Ton der geteilten App, unter Linux ohne Ton",
              "Beides startest du über einen Apps-Knopf im Chat deines Sprachkanals",
              "Watch-Party und geteilte Bildschirme laufen in schwebenden Fenstern in der App, die du verschieben, größer ziehen und einklappen kannst; ein Hinweis oben im Chat zeigt, was im Kanal gerade läuft",
              "Teilst du deinen Bildschirm, zeigt ein roter Balken mit „Beenden“ das deutlich an, und bei den anderen hat dein Bild einen roten Ring mit „LIVE“",
              "Wer später in den Kanal kommt, sieht laufende Watch-Partys und geteilte Bildschirme sofort; eine neue Watch-Party wartet pausiert, bis jemand auf Play drückt",
              "Der Ton von Video und geteiltem Bildschirm wird leiser, solange jemand spricht, einstellbar",
              "Kurze Töne, wenn jemand eine Watch-Party startet, beitritt oder verlässt und wenn jemand seinen Bildschirm teilt; jeder Ton einzeln abschaltbar",
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
        status: "now",
        version: "0.5.0",
        summary: "Feinschliff für Vielnutzer: mehr Ruhe mit Blockieren, Nachrichtenfilter und Benachrichtigungszentrale, mehrere Identitäten, Server-Info, ein neues Design für Assistent, Einstellungen, Watch-Party und Kanalbaum, Audio pro Kanal, ein Low-Latency-Modus zum Musizieren, Updates in der App und ein optionales Relay für direkte Verbindungen.",
        groups: [
          {
            title: "Komfort im Alltag",
            items: [
              "Globale Tastenkürzel über Push-to-Talk hinaus",
              "Volles Tray-Menü",
              "Einstellungen aus dem offiziellen Mumble-Client übernehmen",
              "Flüstern und Rufen in andere Kanäle",
              "Öffentlicher Server-Browser",
              "„Bitte nicht stören“: Ein Schalter macht Benachrichtigungen, Töne und Pop-ups stumm, Stimmen hörst du weiter",
              "@all und @channel, um alle auf dem Server oder im Kanal zu erwähnen",
              "Mikrofon und Kopfhörer per Rechtsklick auf Stumm und Taub wechseln, mit Lautstärke und Pegelanzeige",
              "Rechtsklick auf Auflegen: nur die Sprache verlassen und weiter mitlesen, einen Server trennen oder alle",
              "Den Einrichtungsassistenten erneut starten, ohne die Identität anzufassen",
              "mumble://-Links im Chat erscheinen als Karte für Server oder Kanal, ein Klick verbindet",
              "Eigene Töne, wenn du gekickt oder gebannt wirst",
              "Audiodateien im Chat mit eigenem Player: abspielen, spulen und Lautstärke direkt in der Nachricht",
              "Links zu Spotify, Apple Music, Tidal und anderen Musikdiensten werden zur Musikkarte, die erst nach einem Klick über den offiziellen Player des Dienstes spielt",
            ],
            done: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11],
            mockups: [
              { shot: "epic3-64-hotkeys-settings-dark", issue: 64, caption: "Globale Tastenkürzel in den Einstellungen" },
              { shot: "epic3-65-tray-menu-and-icon-states-dark", issue: 65, caption: "Volles Tray-Menü und Symbolzustände" },
              { shot: "66-import-wizard-dark", issue: 66, caption: "Einstellungen aus Mumble übernehmen" },
              { shot: "67-whisper-live-dark", issue: 67, caption: "Flüstern in einen anderen Kanal" },
              { shot: "68-server-browser-dark", issue: 68, caption: "Öffentlicher Server-Browser" },
              { shot: "epic3-69-dnd-quick-settings-dark", issue: 69, caption: "„Bitte nicht stören“ in den Schnelleinstellungen" },
              { shot: "70-mentions-dark", issue: 70, caption: "@channel und @all im Eingabefeld" },
              { shot: "io-devices-dark", issue: 153, caption: "Geräte wechseln an Stumm und Taub" },
              { shot: "disconnect-menu-dark", issue: 154, caption: "Menü am Auflegen-Knopf" },
              { shot: "epic3-rerun-wizard-dark", issue: 149, caption: "Einrichtungsassistent erneut starten" },
              { shot: "mumble-link-card-dark", issue: 175, caption: "Ein mumble://-Link als Karte" },
              { shot: "audio-embed-dark", issue: 260, caption: "Ein Audio-Link mit Player im Chat" },
              { shot: "music-embed-dark", issue: 262, caption: "Eine Musikkarte im Chat" },
            ],
          },
          {
            title: "Neues Design",
            items: [
              "Ein neuer Einrichtungsassistent, ruhig und klar: Voreinstellungen von „Alles an“ bis „Maximale Privatsphäre“, in rund zwei Minuten fertig",
              "Einstellungen neu geordnet: weniger, klarere Bereiche, einheitliche Karten und eine Suche, die jede Einstellung findet",
              "Watch-Party und Bildschirm teilen bekommen eine eigene Kino-Ansicht mit Zeitleiste, Lautstärke, Playlist und wer gerade zuschaut",
              "Video oder geteilten Bildschirm in ein eigenes Fenster lösen, etwa auf den zweiten Monitor oder über ein Spiel, auf Wunsch immer im Vordergrund",
              "Die Mitgliederspalte rechts einklappen, ganz oder zu einer schmalen Leiste mit Profilbildern, damit der Chat mehr Platz hat",
              "Die Übersicht der privaten Nachrichten neu gestaltet",
              "Ein Menü hinter dem Kanalnamen mit allen Aktionen und einer Kanal-Info",
              "Server- und Kanalbaum neu gestaltet: Rechtsklick-Menü an jedem Kanal, Nutzerlimit am Namen und klare Status-Symbole",
              "Schnelleinstellungen überarbeitet",
              "Das Nutzer-Panel unten links neu gestaltet",
            ],
            done: [4, 5, 6, 7],
            mockups: [
              { shot: "wizard-1-welcome-dark", issue: 159, caption: "Der neue Einrichtungsassistent" },
              { shot: "wizard-0-presets-dark", issue: 159, caption: "Voreinstellungen im Assistenten" },
              { shot: "settings-a-voice-audio-dark", issue: 161, caption: "Neue Einstellungen: Stimme und Audio" },
              { shot: "settings-b-privacy-connections-dark", issue: 161, caption: "Neue Einstellungen: Privatsphäre und Verbindungen" },
              { shot: "watch-together-dark", issue: 163, caption: "Gemeinsam schauen in der neuen Ansicht" },
              { shot: "screen-share-viewer-dark", issue: 163, caption: "Einen geteilten Bildschirm ansehen" },
              { shot: "pop-out-dark", issue: 164, caption: "Video im eigenen Fenster" },
              { shot: "layout-b-dark", issue: 165, caption: "Mitgliederspalte als schmale Leiste" },
              { shot: "pm-dark", issue: 173, caption: "Die neue Übersicht der privaten Nachrichten" },
              { shot: "channel-menu-dark", issue: 170, caption: "Das Menü hinter dem Kanalnamen" },
              { shot: "tree-dark", issue: 172, caption: "Der neue Server- und Kanalbaum" },
              { shot: "quick-settings-dark", issue: 234, caption: "Die überarbeiteten Schnelleinstellungen" },
              { shot: "user-panel-dark", issue: 246, caption: "Das neue Nutzer-Panel" },
            ],
          },
          {
            title: "Ruhe und Privatsphäre",
            items: [
              "Personen blockieren: keine Nachrichten, keine Stimme und keine Einladungen mehr von ihnen, erkannt am Zertifikat statt am Namen",
              "Private Nachrichten nur von Freunden, von allen oder von niemandem, auch pro Server. Fremde landen bei den Nachrichtenanfragen",
              "Eine Benachrichtigungszentrale an der Glocke sammelt Erwähnungen, Antworten, Anfragen und Einladungen von allen Servern, bei „Bitte nicht stören“ auch alles, was sonst aufpoppen würde",
              "Watch-Partys laden nichts von YouTube oder Twitch, solange eingebettete Inhalte ausgeschaltet sind",
              "Ein Hinweis im Chat, wenn Link-Vorschauen und eingebettete Inhalte ausgeschaltet sind, statt kommentarlos nur den Link zu zeigen",
            ],
            done: [1, 2, 3, 4],
            mockups: [
              { shot: "block-menu-dark", issue: 140, caption: "Eine Person blockieren" },
              { shot: "pm-chat-request-dark", issue: 141, caption: "Nachrichtenanfrage einer fremden Person" },
              { shot: "notification-centre-dark", issue: 143, caption: "Benachrichtigungszentrale" },
              { shot: "embed-hint-dark", issue: 261, caption: "Hinweis bei ausgeschalteten Vorschauen" },
            ],
          },
          {
            title: "Server und Identitäten",
            items: [
              "Mehrere Identitäten verwalten und pro Server wählen, mit der du dich verbindest",
              "Ein aufgeräumter Dialog für Server hinzufügen und bearbeiten, mit Identität und „Verbindung testen“",
              "Server-Info: Version, Limits, Zertifikat und deine Rechte auf einen Blick, ganz ohne Änderung am Server",
              "Gespeicherte Kanal-Passwörter zeigen, zu welchem Kanal sie gehören, und lassen sich benennen",
              "Die Server-Info zeigt, ob ein Mumbot oder ein mumpeer-Relay angekündigt ist",
            ],
            done: [0, 1, 2, 3],
            mockups: [
              { shot: "epic3-ids-dark", issue: 148, caption: "Mehrere Identitäten verwalten" },
              { shot: "server-dialog-dark", issue: 151, caption: "Neuer Dialog für Server" },
              { shot: "server-info-dark", issue: 147, caption: "Server-Info" },
            ],
          },
          {
            title: "Klang und Musik",
            items: [
              "Rechtsklick auf die Verbindungsinfo: Bitrate, Musikqualität und Low-Latency-Modus direkt im Gespräch einstellen",
              "Low-Latency-Modus, um gemeinsam Musik zu machen: rund 40 statt 90 ms vom Mund zum Ohr, auch auf normalen Mumble-Servern",
              "Audio pro Kanal: Musikqualität, Low-Latency-Modus und Bitrate merkt sich jeder Kanal selbst",
              "Hochwertige Rauschunterdrückung mit dem RNNoise-Modell von 2024, als Beta",
            ],
            done: [0, 1, 2],
            mockups: [
              { shot: "connection-quick-panel-dark", issue: 155, caption: "Sprachqualität direkt an der Verbindungsinfo" },
              { shot: "low-latency-dark", issue: 156, caption: "Low-Latency-Modus" },
              { shot: "channel-audio-dark", issue: 171, caption: "Audio-Einstellungen pro Kanal" },
            ],
          },
          {
            title: "Direkte Verbindungen über ein Relay",
            items: [
              "Klappt keine direkte Verbindung, etwa hinter CGNAT, oder willst du deine IP-Adresse nicht zeigen, leitet ein mumpeer-Relay die Daten weiter",
              "Der Inhalt bleibt Ende-zu-Ende verschlüsselt, das Relay reicht nur Bytes durch und lässt nur Nutzer des eigenen Servers rein",
              "Optional: Eine Community kann das Relay zusammen mit Mumbot betreiben. Ohne Relay funktioniert alles wie bisher",
              "Einstellbar: Relay aus, nur wenn direkt nicht klappt, oder immer, damit deine IP-Adresse verborgen bleibt",
            ],
            mockups: [
              { shot: "epic3-62-relay-setting-and-connection-info-dark", issue: 62, caption: "Relay-Einstellung und Verbindungsinfo" },
            ],
          },
          {
            title: "Updates und Installation",
            items: [
              "Updates direkt in der App: prüfen, herunterladen, Signatur prüfen und neu starten",
              "Unter Windows eine portable Mumcord.exe neben dem Installer",
            ],
            done: [1],
            mockups: [
              { shot: "update-available-dark", issue: 168, caption: "Ein Update ist da" },
            ],
          },
        ],
      },
      {
        id: "epic-3.1",
        tag: "Epic 3.1",
        title: "Plugins",
        status: "planned",
        version: "0.6.0",
        summary: "Mumcord lässt sich mit kleinen, sicheren Plugins erweitern: aus einem offiziellen Verzeichnis in den Einstellungen installiert, ohne Änderung am Server und ohne Backend von Mumcord. Das erste Plugin sind die Echolings.",
        groups: [
          {
            title: "Plugins in Mumcord",
            items: [
              "Ein Bereich „Plugins“ in den Einstellungen: stöbern, installieren, ein- und ausschalten, einstellen, aktualisieren und entfernen, ohne Konten und Bewertungen",
              "Vor der Installation in klaren Worten sehen, was ein Plugin darf, optionale Teile ablehnen und es später ändern",
              "Plugins zeigen Oberfläche nur an festen Stellen und nie als eigenes HTML. Mumcord zeichnet sie in deinem Theme und barrierefrei",
              "Ein Server kann über Mumbot empfehlen, welche Plugins seine Community nutzt. Mumcord zeigt das ruhig in der Benachrichtigungszentrale",
            ],
            mockups: [
              { shot: "plugins-installed-dark", issue: 277, caption: "Installierte Plugins in den Einstellungen" },
              { shot: "plugins-prompt-dark", issue: 275, caption: "Was ein Plugin darf, vor der Installation" },
              { shot: "plugins-server-suggestion-dark", issue: 283, caption: "Ein Server empfiehlt ein Plugin" },
            ],
          },
          {
            title: "Sicher und ohne Backend",
            items: [
              "Plugins laufen abgeschottet in einer Sandbox, ohne Zugriff auf Netz, Dateien, Mikrofon oder dein Zertifikat",
              "Nur signierte, geprüfte Pakete. Inoffizielle Plugins sind deutlich gekennzeichnet",
              "Updates ohne Überraschungen, nie heimlich mehr Rechte, und ein schädliches Plugin lässt sich schnell für alle abschalten",
              "Ein offizielles Plugin-Verzeichnis auf GitHub, öffentlich nachvollziehbar und ohne Server von Mumcord",
              "Weitere Verzeichnisse von Communities per URL hinzufügen, klar als nicht geprüft markiert",
            ],
            mockups: [
              { shot: "plugins-unofficial-dark", issue: 276, caption: "Ein inoffizielles Plugin" },
              { shot: "plugins-updates-dark", issue: 278, caption: "Updates für Plugins" },
            ],
          },
          {
            title: "Für Entwickler",
            items: [
              "Ein kleines, strenges Manifest und klare Versionsregeln",
              "Eine Schnittstelle für Ereignisse, Speicher, Timer, Benachrichtigungen und das Theme, jede hinter einer Erlaubnis",
              "Plugins sprechen über Mumble-Plugin-Daten mit demselben Plugin bei anderen Mumcord-Nutzern",
              "Vorlage, Kommandozeilen-Tool, SDK und eine Test-Umgebung: ein Plugin an einem Nachmittag",
              "Die Website listet die Plugins aus dem offiziellen Verzeichnis",
            ],
          },
          {
            title: "Die ersten Plugins",
            items: [
              "Umfragen als erstes Test-Plugin: Frage stellen, abstimmen und das Ergebnis live sehen, im Kanal oder in privaten Nachrichten",
              "Würfeln als zweites Test-Plugin: /roll im Chat mit gängiger Würfelnotation, eine animierte Würfelkarte und Würfe, die alle nachprüfen können",
              "Echolings: ein kleines Wesen aus Klang, das in Mumcord lebt, mit dir und deinen Freunden wächst und im Sprachkanal neben dir auftaucht. Ganz ohne Drängeln, Strafen oder Verkaufen",
              "Gebaut nur auf der öffentlichen Plugin-Schnittstelle, als Beweis, dass sie reicht, und als Beispiel in der Doku",
            ],
            mockups: [
              { shot: "plugin-poll-dark", issue: 284, caption: "Eine Umfrage im Chat" },
              { shot: "plugin-dice-dark", issue: 285, caption: "Ein Wurf im Chat" },
              { shot: "echolings-dark", issue: 264, caption: "Ein Echoling zu Hause" },
              { shot: "plugins-slot-dark", issue: 279, caption: "Ein Plugin an seinem Platz in Mumcord" },
            ],
          },
        ],
      },
      {
        id: "epic-4",
        tag: "Epic 4",
        title: "Admin",
        status: "planned",
        summary: "Damit Mumcord den offiziellen Client ganz ersetzen kann: Kanäle, Rechte, Banns und Personen verwalten, nur mit normalen Mumble-Nachrichten und ohne Änderung am Server.",
        groups: [
          {
            title: "Admin, wo du ohnehin suchst",
            items: [
              "Admin-Aktionen erscheinen nur, wo der Server sie dir erlaubt. Ohne Rechte siehst du nichts davon",
              "Alles im Rechtsklick-Menü von Kanälen und Personen und im Server-Menü, ohne eigenen Admin-Modus",
              "Ein privates Protokoll auf deinem Rechner: wen hast du letzte Woche gebannt und warum",
            ],
            mockups: [
              { shot: "admin-menus-dark", issue: 249, caption: "Admin-Aktionen im Rechtsklick-Menü" },
            ],
          },
          {
            title: "Kanäle und Rechte",
            items: [
              "Kanäle anlegen, umbenennen, beschreiben, verschieben, sortieren und löschen, auch temporäre Kanäle, Nutzerlimits und Verknüpfungen",
              "Kanal-Passwörter setzen, ändern und entfernen, so wie im offiziellen Client",
              "Ein Editor für Rechte (ACLs) und Gruppen, den auch Nicht-Profis lesen können: was vererbt wird, welche Regel gewinnt und wer am Ende was darf",
              "Server-Infos für Admins und die Willkommensnachricht bearbeiten, soweit das Protokoll es erlaubt",
            ],
            mockups: [
              { shot: "admin-channel-edit-dark", issue: 250, caption: "Einen Kanal bearbeiten" },
              { shot: "admin-acl-rules-dark", issue: 252, caption: "Die Rechte eines Kanals" },
            ],
          },
          {
            title: "Personen und Banns",
            items: [
              "Personen vom Server werfen, mit Grund, und auf Wunsch für eine Zeit bannen, nach Zertifikat, IP-Adresse oder beidem",
              "Die Bannliste ansehen, durchsuchen und bearbeiten, auch Banns für Leute, die gerade nicht online sind",
              "Leute schnell verschieben: eine Person zu dir oder alle aus einem Kanal in einen anderen",
              "Registrierte Nutzer verwalten: wann sie zuletzt da waren, umbenennen, abmelden und Leute registrieren, die online sind",
              "Für alle stumm oder taub schalten, Vorrang beim Sprechen geben und unerwünschte Kommentare oder Profilbilder zurücksetzen",
            ],
            mockups: [
              { shot: "admin-ban-dialog-dark", issue: 253, caption: "Jemanden bannen" },
              { shot: "admin-registered-users-dark", issue: 256, caption: "Registrierte Nutzer" },
            ],
          },
          {
            title: "Windows",
            items: ["Signierte Windows-Builds, Installer und App"],
          },
        ],
      },
      {
        id: "epic-5",
        tag: "Epic 5",
        title: "Mumcord fürs Handy",
        status: "planned",
        summary: "Mumcord als App für Android und iOS, kompatibel mit normalen Mumble-Servern wie am Desktop. Zuerst als APK zum Herunterladen und über TestFlight, die App Stores kommen später.",
        groups: [
          {
            title: "Grundlage und Verteilung",
            items: [
              "Android- und iOS-App auf Basis der vorhandenen Rust-Engine, gebaut in der CI",
              "Signierte APK in den GitHub-Releases und iOS über TestFlight, noch ohne App Stores",
              "Klar beschrieben, welche Desktop-Funktionen in der ersten Version fehlen und warum",
            ],
          },
          {
            title: "Server, Kanäle und Identität",
            items: [
              "Server finden, hinzufügen und verbinden, mit einer Navigation für eine Hand",
              "Eine neue Identität anlegen oder die vom Desktop sicher aufs Handy holen, damit Name, Freunde und Rechte bleiben",
              "Kanäle und Personen übersichtlich auf dem kleinen Bildschirm, mit denselben Infos wie am Desktop",
            ],
            mockups: [
              { shot: "mobile-servers-voice-dark", issue: 228, caption: "Serverliste, Kanalbaum und Push-to-Talk am Handy" },
            ],
          },
          {
            title: "Sprechen und Chatten",
            items: [
              "Ein großer Push-to-Talk-Knopf, zuverlässige Sprachaktivierung und Ton dort, wo du ihn erwartest: Hörmuschel, Lautsprecher oder Bluetooth",
              "Sprache läuft weiter bei ausgeschaltetem Bildschirm, mit Sprechen, Stumm, Taub und Auflegen auf dem Sperrbildschirm",
              "Kanal-Chat und private Nachrichten bequem am Handy",
              "Benachrichtigungen für Erwähnungen, Nachrichten und Anfragen, ganz ohne Push-Server",
            ],
            mockups: [
              { shot: "mobile-chat-lock-dark", issue: 228, caption: "Chat, Sperrbildschirm und Einstellungen am Handy" },
            ],
          },
          {
            title: "Alltag am Handy",
            items: [
              "Kurze, klare Einstellungen mit nur dem, was am Handy Sinn ergibt",
              "Bleibt verbunden bei Netzwechseln und geht sparsam mit Akku und mobilen Daten um",
              "Voll bedienbar mit TalkBack, VoiceOver und großer Systemschrift",
            ],
          },
        ],
      },
      {
        id: "epic-6",
        tag: "Epic 6",
        title: "Auslieferung",
        status: "later",
        summary: "Installieren ohne Warnungen und immer aktuell.",
        items: [
          "Signierte Installer, ohne Warnung von SmartScreen und Gatekeeper: für Windows und macOS schon im Release-Ablauf vorbereitet, aktiv, sobald die Zertifikate eingerichtet sind",
          "Automatische Updates",
          "Absturzberichte, nur wenn du zustimmst",
          "Paketquellen und Stores",
          "Mumcord auf Flathub, für jede Linux-Distribution aus dem Software-Center",
          "Die Handy-App in Google Play, im App Store und bei F-Droid",
        ],
      },
      {
        id: "epic-future",
        tag: "Epic Future",
        title: "Ideen für später",
        status: "later",
        summary: "Ideen ohne festes Epic, zum Beispiel die Suche nach GIFs.",
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
      "Mumcord's roadmap in detail: what each epic brings, what is done and what comes next.",
    label: "Where it's going",
    intro:
      "Mumcord grows in epics: big stages that each ship as their own version. Here you can see what is done, what is being built right now and what comes after. The roadmap is a proposal, order and scope may change.",
    status: { done: "done", now: "in progress", planned: "up next", later: "later" },
    doneTitle: "Done",
    nextTitle: "Up next",
    laterTitle: "After that",
    delivered: "{n} things delivered",
    showAll: "Show all",
    statDone: "Epics done",
    statReleases: "Releases",
    statNext: "Next target",
    mockupsTitle: "Sketches from the issues",
    mockupsNote: "Design sketches, not final. Names and content are made up.",
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
            "Window with server bar, channel list, chat and member list",
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
            "Overlay right inside the game, also in exclusive fullscreen: a Vulkan layer on Linux (like MangoHud), also in Steam and Proton games, tested with Tyr and Supermarket Simulator for example. On Windows it comes later via the game's graphics API; until then there is the overlay window",
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
        status: "now",
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
              "Your own themes from a few key colours, with presets and a live preview, each in a dark and a light version; Mumcord makes the second one itself and keeps the contrast readable",
              "Pick themes as colour circles; save, rename and delete your own, and edit the light and dark versions side by side",
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
              "Sent messages show up at once, slightly grey until the server confirms them; if that fails, you can send them again or delete them",
              "Profile comment with bold, italic, links and lists",
              "A bitrate slider of its own, up to the highest value the server and Mumble allow",
              "Wrong password? A window asks for the right one straight away and saves it if you like",
              "People who only listen to a channel appear in the normal list with an ear icon instead of in a group of their own",
              "Settings for a person, such as volume and mute, sit collapsed in their profile, with a short hint when something is changed",
              "Channels with a password: Mumcord asks for it and remembers it per server, and locked channels show a lock",
              "Tooltips in the theme's look instead of the grey system ones",
            ],
          },
          {
            title: "Chat",
            items: [
              "Reply to messages, in channels and in private: with a short quote that also reads fine in the official Mumble client; one click on it jumps to the original",
              "On long messages the profile picture sits at the top next to the name, and picture and name stay in view while you scroll",
              "A reply to your message counts like an @mention",
              "“> text” becomes a quote, also with a button; “>_>” and similar smileys stay as they are",
              "The server's welcome message and the channel description can be closed and come back when they change",
              "Right-click a link in the chat to copy or open it",
              "Fixed: YouTube and Twitch videos play right in the chat in the released versions on Linux and macOS too",
            ],
          },
          {
            title: "Connection quality",
            items: [
              "The connection in a person's profile at a glance (good, fair, weak), expanded with ping, packet loss, bandwidth and UDP or TCP, for yourself too; a person's menu shows just ping and transport. Admins also see the client and operating system",
              "A small signal icon next to people with a weak connection, can be switched off",
            ],
          },
          {
            title: "Overlay",
            items: [
              "The in-game overlay on Windows too, as a separate click-through window over the game. Nothing is loaded into the game, so it also works in games with anti-cheat; only exclusive fullscreen hides it",
              "Correct colours in HDR games, games from Flatpak Steam, borderless fullscreen games checked on KDE and GNOME",
              "Fixed: closing or updating Mumcord no longer crashes a running game",
              "The in-game overlay in native Linux games that use OpenGL too, such as Project Hospital, Euro Truck Simulator 2 and Hearts of Iron IV: Mumcord shows the right Steam launch option to copy, and it keeps working after updates",
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
              "Closing the image viewer keeps the image loading in the background; the × on the progress bar cancels it",
            ],
          },
          {
            title: "Watching together (beta)",
            items: [
              "YouTube watch party: everyone in the voice channel watches the same video at once, anyone can pause and seek, with a shared playlist everyone can add to",
              "Share a screen or a window for up to 8 viewers, 720p at 30 frames per second by default; on Windows and macOS with the shared app's sound if you like, on Linux without sound",
              "Start both from an Apps button in your voice channel's chat",
              "The watch party and shared screens run in floating windows inside the app that you can move, resize and collapse; a hint at the top of the chat shows what is running in the channel",
              "While you share your screen, a red bar with “End” makes it clear, and others see a red ring with “LIVE” around your picture",
              "Anyone who joins the channel later sees running watch parties and shared screens at once; a new watch party waits, paused, until someone presses Play",
              "The sound of the video and the shared screen gets quieter while someone talks, adjustable",
              "Short sounds when someone starts, joins or leaves a watch party and when someone shares their screen; each sound can be switched off",
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
        status: "now",
        version: "0.5.0",
        summary: "Polish for heavy users: more peace with blocking, a message filter and a notification centre, several identities, server info, a fresh design for the wizard, settings, watch party and channel tree, audio per channel, a low-latency mode for making music, updates in the app and an optional relay for direct connections.",
        groups: [
          {
            title: "Everyday comfort",
            items: [
              "Global shortcuts beyond push-to-talk",
              "Full tray menu",
              "Import settings from the official Mumble client",
              "Whisper and shout to other channels",
              "Public server browser",
              "Do Not Disturb: one switch silences notifications, sounds and pop-ups, and you still hear voices",
              "@all and @channel to mention everyone on the server or in the channel",
              "Switch microphone and headphones with a right-click on mute and deafen, with volume and a level meter",
              "Right-click hang up: leave voice and keep reading, disconnect one server or all of them",
              "Run the setup wizard again without touching your identity",
              "mumble:// links in the chat show as a card for the server or channel, one click connects",
              "Sounds of their own when you are kicked or banned",
              "Audio files in the chat with a player of their own: play, seek and set the volume right in the message",
              "Links to Spotify, Apple Music, Tidal and other music services become a music card that plays through the service's official player, only after a click",
            ],
            done: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11],
            mockups: [
              { shot: "epic3-64-hotkeys-settings-dark", issue: 64, caption: "Global shortcuts in the settings" },
              { shot: "epic3-65-tray-menu-and-icon-states-dark", issue: 65, caption: "Full tray menu and icon states" },
              { shot: "66-import-wizard-dark", issue: 66, caption: "Importing settings from Mumble" },
              { shot: "67-whisper-live-dark", issue: 67, caption: "Whispering to another channel" },
              { shot: "68-server-browser-dark", issue: 68, caption: "Public server browser" },
              { shot: "epic3-69-dnd-quick-settings-dark", issue: 69, caption: "Do Not Disturb in the quick settings" },
              { shot: "70-mentions-dark", issue: 70, caption: "@channel and @all in the message input" },
              { shot: "io-devices-dark", issue: 153, caption: "Switching devices from mute and deafen" },
              { shot: "disconnect-menu-dark", issue: 154, caption: "The hang-up button menu" },
              { shot: "epic3-rerun-wizard-dark", issue: 149, caption: "Running the setup wizard again" },
              { shot: "mumble-link-card-dark", issue: 175, caption: "A mumble:// link as a card" },
              { shot: "audio-embed-dark", issue: 260, caption: "An audio link with a player in the chat" },
              { shot: "music-embed-dark", issue: 262, caption: "A music card in the chat" },
            ],
          },
          {
            title: "A fresh design",
            items: [
              "A new setup wizard, calm and clear: presets from “Everything on” to “Maximum privacy”, done in about two minutes",
              "Settings reorganised: fewer, clearer sections, consistent cards and a search that finds every setting",
              "Watch party and screen sharing get a cinema-like view of their own with a timeline, volume, playlist and who is watching",
              "Pop a video or a shared screen out into its own window, onto a second monitor or over a game, always on top if you like",
              "Collapse the member column on the right, fully or to a slim rail of avatars, so the chat gets more room",
              "The private messages overview redesigned",
              "A menu behind the channel name with every action and a channel info",
              "The server and channel tree redesigned: a right-click menu on every channel, the user limit next to the name and clear status icons",
              "Quick settings overhauled",
              "The user panel at the bottom left redesigned",
            ],
            done: [4, 5, 6, 7],
            mockups: [
              { shot: "wizard-1-welcome-dark", issue: 159, caption: "The new setup wizard" },
              { shot: "wizard-0-presets-dark", issue: 159, caption: "Presets in the wizard" },
              { shot: "settings-a-voice-audio-dark", issue: 161, caption: "New settings: voice and audio" },
              { shot: "settings-b-privacy-connections-dark", issue: 161, caption: "New settings: privacy and connections" },
              { shot: "watch-together-dark", issue: 163, caption: "Watching together in the new view" },
              { shot: "screen-share-viewer-dark", issue: 163, caption: "Watching a shared screen" },
              { shot: "pop-out-dark", issue: 164, caption: "A video in its own window" },
              { shot: "layout-b-dark", issue: 165, caption: "The member column as a slim rail" },
              { shot: "pm-dark", issue: 173, caption: "The new private messages overview" },
              { shot: "channel-menu-dark", issue: 170, caption: "The menu behind the channel name" },
              { shot: "tree-dark", issue: 172, caption: "The redesigned server and channel tree" },
              { shot: "quick-settings-dark", issue: 234, caption: "The overhauled quick settings" },
              { shot: "user-panel-dark", issue: 246, caption: "The new user panel" },
            ],
          },
          {
            title: "Peace and privacy",
            items: [
              "Block people: no more messages, voice or invites from them, recognised by their certificate instead of their name",
              "Private messages from friends only, from everyone or from nobody, per server too. Strangers end up in message requests",
              "A notification centre behind a bell collects mentions, replies, requests and invites from every server, and during Do Not Disturb everything that would otherwise pop up",
              "Watch parties load nothing from YouTube or Twitch while embedded content is off",
              "A hint in the chat when link previews and embeds are off, instead of silently showing only the link",
            ],
            done: [1, 2, 3, 4],
            mockups: [
              { shot: "block-menu-dark", issue: 140, caption: "Blocking a person" },
              { shot: "pm-chat-request-dark", issue: 141, caption: "A message request from a stranger" },
              { shot: "notification-centre-dark", issue: 143, caption: "Notification centre" },
              { shot: "embed-hint-dark", issue: 261, caption: "A hint when previews are off" },
            ],
          },
          {
            title: "Servers and identities",
            items: [
              "Manage several identities and choose per server which one you connect with",
              "A tidy dialog for adding and editing servers, with identity and “Test connection”",
              "Server info: version, limits, certificate and your permissions at a glance, without any server change",
              "Saved channel passwords show which channel they belong to and can be named",
              "Server info shows whether a Mumbot or a mumpeer relay is announced",
            ],
            done: [0, 1, 2, 3],
            mockups: [
              { shot: "epic3-ids-dark", issue: 148, caption: "Managing several identities" },
              { shot: "server-dialog-dark", issue: 151, caption: "The new server dialog" },
              { shot: "server-info-dark", issue: 147, caption: "Server info" },
            ],
          },
          {
            title: "Sound and music",
            items: [
              "Right-click the connection info: set bitrate, music quality and low-latency mode right in the conversation",
              "Low-latency mode for making music together: about 40 instead of 90 ms mouth to ear, on standard Mumble servers too",
              "Audio per channel: every channel remembers its own music quality, low-latency mode and bitrate",
              "High-quality noise suppression with the 2024 RNNoise model, as a beta",
            ],
            done: [0, 1, 2],
            mockups: [
              { shot: "connection-quick-panel-dark", issue: 155, caption: "Voice quality right at the connection info" },
              { shot: "low-latency-dark", issue: 156, caption: "Low-latency mode" },
              { shot: "channel-audio-dark", issue: 171, caption: "Audio settings per channel" },
            ],
          },
          {
            title: "Direct connections through a relay",
            items: [
              "If no direct connection works, for example behind CGNAT, or you don't want to show your IP address, a mumpeer relay forwards the data",
              "The content stays end-to-end encrypted; the relay only passes bytes along and only lets in users of its own server",
              "Optional: a community can run the relay together with Mumbot. Without a relay everything works as before",
              "Your choice: relay off, only when a direct connection fails, or always, so your IP address stays hidden",
            ],
            mockups: [
              { shot: "epic3-62-relay-setting-and-connection-info-dark", issue: 62, caption: "Relay setting and connection info" },
            ],
          },
          {
            title: "Updates and installation",
            items: [
              "Updates right in the app: check, download, verify the signature and restart",
              "On Windows a portable Mumcord.exe next to the installer",
            ],
            done: [1],
            mockups: [
              { shot: "update-available-dark", issue: 168, caption: "An update is ready" },
            ],
          },
        ],
      },
      {
        id: "epic-3.1",
        tag: "Epic 3.1",
        title: "Plugins",
        status: "planned",
        version: "0.6.0",
        summary: "Mumcord can be extended with small, safe plugins: installed from an official repository in Settings, with no change to the server and no Mumcord backend. The first plugin is Echolings.",
        groups: [
          {
            title: "Plugins in Mumcord",
            items: [
              "A Plugins section in Settings: browse, install, turn on and off, configure, update and remove, without accounts or ratings",
              "See in plain words what a plugin may do before installing it, say no to optional parts and change your mind later",
              "Plugins show UI only in fixed places and never as their own HTML. Mumcord draws it in your theme and accessibly",
              "A server can recommend through Mumbot which plugins its community uses. Mumcord shows it calmly in the notification centre",
            ],
            mockups: [
              { shot: "plugins-installed-dark", issue: 277, caption: "Installed plugins in Settings" },
              { shot: "plugins-prompt-dark", issue: 275, caption: "What a plugin may do, before installing" },
              { shot: "plugins-server-suggestion-dark", issue: 283, caption: "A server recommends a plugin" },
            ],
          },
          {
            title: "Safe and without a backend",
            items: [
              "Plugins run sealed off in a sandbox, without access to the network, files, the microphone or your certificate",
              "Only signed, verified packages. Unofficial plugins are clearly marked",
              "Updates without surprises, never silently more permissions, and a harmful plugin can be switched off for everyone quickly",
              "An official plugin repository on GitHub, open to review and without any Mumcord server",
              "Add more repositories from communities by URL, clearly marked as not reviewed",
            ],
            mockups: [
              { shot: "plugins-unofficial-dark", issue: 276, caption: "An unofficial plugin" },
              { shot: "plugins-updates-dark", issue: 278, caption: "Plugin updates" },
            ],
          },
          {
            title: "For developers",
            items: [
              "A small, strict manifest and clear version rules",
              "An interface for events, storage, timers, notifications and the theme, each behind a permission",
              "Plugins talk to the same plugin on other Mumcord clients through Mumble plugin data",
              "A template, a command-line tool, an SDK and a test host: a plugin in an afternoon",
              "The website lists the plugins from the official repository",
            ],
          },
          {
            title: "The first plugins",
            items: [
              "Polls as the first test plugin: ask a question, vote and watch the result live, in a channel or in private messages",
              "Dice as the second test plugin: /roll in the chat with standard dice notation, an animated dice card and rolls everyone can check",
              "Echolings: a small creature made of sound that lives in Mumcord, grows with you and your friends and shows up beside you in voice. Never nagging, punishing or selling",
              "Built only on the public plugin interface, as proof that it is enough and as the example in the docs",
            ],
            mockups: [
              { shot: "plugin-poll-dark", issue: 284, caption: "A poll in the chat" },
              { shot: "plugin-dice-dark", issue: 285, caption: "A roll in the chat" },
              { shot: "echolings-dark", issue: 264, caption: "An Echoling at home" },
              { shot: "plugins-slot-dark", issue: 279, caption: "A plugin in its place in Mumcord" },
            ],
          },
        ],
      },
      {
        id: "epic-4",
        tag: "Epic 4",
        title: "Admin",
        status: "planned",
        summary: "So Mumcord can fully replace the official client: manage channels, permissions, bans and people, with standard Mumble messages only and no change to the server.",
        groups: [
          {
            title: "Admin where you already look",
            items: [
              "Admin actions only appear where the server grants them. Without rights you see none of it",
              "Everything in the right-click menus of channels and people and in the server menu, no separate admin mode",
              "A private log on your computer: who did you ban last week and why",
            ],
            mockups: [
              { shot: "admin-menus-dark", issue: 249, caption: "Admin actions in the right-click menu" },
            ],
          },
          {
            title: "Channels and permissions",
            items: [
              "Create, rename, describe, move, reorder and delete channels, including temporary channels, user limits and links",
              "Set, change and remove channel passwords, the same way as in the official client",
              "An editor for permissions (ACLs) and groups that non-experts can read: what is inherited, which rule wins and in the end who can do what",
              "Server information for admins and editing the welcome text, as far as the protocol allows",
            ],
            mockups: [
              { shot: "admin-channel-edit-dark", issue: 250, caption: "Editing a channel" },
              { shot: "admin-acl-rules-dark", issue: 252, caption: "A channel's permissions" },
            ],
          },
          {
            title: "People and bans",
            items: [
              "Remove people from the server with a reason, and ban them for a chosen time if you like, by certificate, IP address or both",
              "See, search and edit the ban list, including bans for people who are not online",
              "Move people quickly: one person to you, or everyone in a channel to another one",
              "Manage registered users: when they were last seen, rename, unregister, and register people who are online",
              "Mute or deafen someone for everyone, make them priority speaker, and reset an unwanted comment or avatar",
            ],
            mockups: [
              { shot: "admin-ban-dialog-dark", issue: 253, caption: "Banning someone" },
              { shot: "admin-registered-users-dark", issue: 256, caption: "Registered users" },
            ],
          },
          {
            title: "Windows",
            items: ["Signed Windows builds, installer and app"],
          },
        ],
      },
      {
        id: "epic-5",
        tag: "Epic 5",
        title: "Mumcord on your phone",
        status: "planned",
        summary: "Mumcord as an app for Android and iOS, compatible with standard Mumble servers like on the desktop. First as an APK to download and through TestFlight, the app stores come later.",
        groups: [
          {
            title: "Foundation and distribution",
            items: [
              "Android and iOS app on top of the existing Rust engine, built in CI",
              "A signed APK in the GitHub releases and iOS through TestFlight, no app stores yet",
              "Written down clearly: which desktop features the first version leaves out and why",
            ],
          },
          {
            title: "Servers, channels and identity",
            items: [
              "Find, add and connect to servers, with a navigation that works with one thumb",
              "Create a new identity or bring your desktop one over safely, so your name, friends and permissions stay",
              "Channels and people clearly laid out on a small screen, with the same information as on the desktop",
            ],
            mockups: [
              { shot: "mobile-servers-voice-dark", issue: 228, caption: "Server list, channel tree and push-to-talk on the phone" },
            ],
          },
          {
            title: "Talking and chatting",
            items: [
              "A big push-to-talk button, reliable voice activity and sound where you expect it: earpiece, speaker or Bluetooth",
              "Voice keeps running with the screen off, with talk, mute, deafen and leave on the lock screen",
              "Channel chat and private messages, comfortable on the phone",
              "Notifications for mentions, messages and requests, without any push server",
            ],
            mockups: [
              { shot: "mobile-chat-lock-dark", issue: 228, caption: "Chat, lock screen and settings on the phone" },
            ],
          },
          {
            title: "Everyday on the phone",
            items: [
              "Short, clear settings with only what makes sense on a phone",
              "Stays connected through network changes and is careful with battery and mobile data",
              "Fully usable with TalkBack, VoiceOver and large system text",
            ],
          },
        ],
      },
      {
        id: "epic-6",
        tag: "Epic 6",
        title: "Distribution",
        status: "later",
        summary: "Install without warnings and always up to date.",
        items: [
          "Signed installers, no SmartScreen or Gatekeeper warning: already prepared in the release workflow for Windows and macOS, active once the certificates are set up",
          "Automatic updates",
          "Crash reports, only if you agree",
          "Package repositories and stores",
          "Mumcord on Flathub, for every Linux distribution from the software centre",
          "The phone app in Google Play, the App Store and F-Droid",
        ],
      },
      {
        id: "epic-future",
        tag: "Epic Future",
        title: "Ideas for later",
        status: "later",
        summary: "Ideas without a planned epic, such as GIF search.",
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
        groups: e.groups?.map((g, i) => ({
          ...g,
          title: te.groups?.[i]?.title ?? g.title,
          items: te.groups?.[i]?.items ?? g.items,
          mockups: g.mockups?.map((m, j) => ({ ...m, caption: te.groups?.[i]?.mockups?.[j] ?? m.caption })),
        })),
      };
    }),
  };
};

export const roadmapPage = localized(source, (l) => mergeRoadmap(source.en, bundles[l]?.roadmap));
