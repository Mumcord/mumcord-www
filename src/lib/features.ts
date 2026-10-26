// Content of the features page. Every feature that has a screenshot names it by file name in
// src/assets/shots (without .png); features without one show text only until a capture exists.
import { localized } from "../i18n";
import { bundles } from "../i18n/locales";
import type { FeaturesText } from "../i18n/bundle";
import { ISSUES_URL } from "./release";

export const BUG_URL = `${ISSUES_URL}/new?template=bug_report.yml`;
export const IDEA_URL = `${ISSUES_URL}/new?template=feature_request.yml`;

export interface Feature {
  id: string;
  title: string;
  body: string;
  shot?: string;
  alt?: string;
  since?: string;
  beta?: boolean;
}

export interface FeatureGroup {
  id: string;
  title: string;
  features: Feature[];
}

export interface FeaturesPage {
  title: string;
  description: string;
  label: string;
  intro: string;
  contents: string;
  newIn: string;
  comingIn: string;
  beta: string;
  filterLabel: string;
  filterAll: string;
  filterBeta: string;
  filterEmpty: string;
  jump: string;
  statFeatures: string;
  statAreas: string;
  statPlatforms: string;
  statNew: string;
  count: string;
  zoom: string;
  close: string;
  prev: string;
  next: string;
  askTitle: string;
  askBody: string;
  idea: string;
  bug: string;
  bugNote: string;
  groups: FeatureGroup[];
}

const source: Record<"de" | "en", FeaturesPage> = {
  de: {
    title: "Funktionen",
    description:
      "Alle Funktionen von Mumcord mit Screenshots: Server und Zertifikate, Kanälen folgen, Chat mit Vorschauen und @Erwähnungen, Push-to-Talk, Audio und Komfort.",
    label: "Was Mumcord kann",
    intro:
      "Alles, was Mumcord kann, mit einem Bild dazu, wo es eins gibt, und was mit der nächsten Version kommt. Der Filter zeigt Beta-Funktionen oder was in welcher Version neu ist. Fehlt dir etwas oder klemmt etwas, sag es auf GitHub.",
    contents: "Inhalt",
    newIn: "neu in",
    comingIn: "kommt mit",
    beta: "Beta",
    filterLabel: "Filtern",
    filterAll: "Alle",
    filterBeta: "Beta",
    filterEmpty: "Keine Funktionen für diesen Filter.",
    jump: "Springen",
    statFeatures: "Funktionen",
    statAreas: "Bereiche",
    statPlatforms: "Systeme",
    statNew: "neu in",
    count: "Funktionen",
    zoom: "Screenshot in voller Größe öffnen",
    close: "Schließen",
    prev: "Vorheriger Screenshot",
    next: "Nächster Screenshot",
    askTitle: "Fehlt etwas? Klemmt etwas?",
    askBody:
      "Wünsche und Fehler sammeln sich in den Issues auf GitHub. Du brauchst dafür ein kostenloses GitHub-Konto; die Vorlagen fragen nur das ab, was wirklich hilft.",
    idea: "Feature wünschen",
    bug: "Fehler melden",
    bugNote: "Sicherheitslücken bitte nicht öffentlich melden, sondern per E-Mail an tobias@vorwachs.com.",
    groups: [
      {
        id: "verbinden",
        title: "Verbinden",
        features: [
          {
            id: "einrichtung",
            title: "Eingerichtet in einer Minute",
            body: "Beim ersten Start fragt Mumcord nur drei Dinge ab: deinen Namen samt Identität, das Mikrofon mit Pegeltest und wie du sprechen willst. Bestehende Mumble-Identitäten lassen sich als PKCS#12 importieren.",
            shot: "wizard-1-identity",
            alt: "Einrichtungsassistent, Schritt Identität",
          },
          {
            id: "server",
            title: "Server-Leiste und mumble://-Links",
            body: "Gespeicherte Server links in der Leiste, hinzufügen per Adresse oder Link, sortieren per Ziehen. Ein mumble://-Link aus dem Browser öffnet Mumcord und springt direkt in den Kanal.",
            shot: "dialog-add-server",
            alt: "Dialog „Server hinzufügen“",
          },
          {
            id: "zertifikate",
            title: "Zertifikate, die man versteht",
            body: "Beim ersten Kontakt zeigt Mumcord den Fingerabdruck des Servers und merkt ihn sich. Ändert er sich später, gibt es eine deutliche Warnung statt eines stillen Klicks.",
            shot: "dialog-certificate-trust",
            alt: "Dialog zur Zertifikatsprüfung mit Fingerabdruck",
          },
          {
            id: "wiederverbinden",
            title: "Wiederverbinden mit allem",
            body: "Bricht die Verbindung ab, kommst du in denselben Kanal zurück, mit Stumm/Taub-Status und gefolgten Kanälen. Nach einem Neustart bietet Mumcord an, dem letzten Sprachkanal wieder beizutreten.",
            shot: "banner-rejoin",
            alt: "Hinweis zum Wiederbeitreten des letzten Sprachkanals",
          },
          {
            id: "mehrere-server",
            title: "Mehrere Server gleichzeitig",
            body: "Bis zu 5 Server auf einmal verbunden, einstellbar bis 15. Du sprichst auf einem und liest, schreibst und bekommst Benachrichtigungen auf allen. Jeder Server verbindet sich nach einem Abbruch für sich neu.",
            since: "0.4.0",
          },
          {
            id: "passwort",
            title: "Falsches Passwort, gleich nochmal",
            body: "Lehnt der Server dein Passwort ab, fragt ein Fenster direkt nach dem richtigen. Gespeichert wird es auf Wunsch, und erst, wenn die Verbindung klappt.",
            since: "0.4.0",
          },
          {
            id: "linux-pakete",
            title: "Installation unter Linux",
            body: "Pakete für Debian und Ubuntu, Fedora und openSUSE, Arch (AUR: mumcord-bin) und das AppImage, für x86_64 und ARM64, auch mit einer Zeile im Terminal. Auf Wunsch ein Hinweis, wenn eine neue Version da ist.",
            since: "0.4.0",
          },
          {
            id: "server-hinweise",
            title: "Benachrichtigungen pro Server",
            body: "Benachrichtigungen und private Nachrichten tragen den Servernamen, und jeder Server lässt sich einzeln stummschalten.",
            since: "0.4.0",
          },
          {
            id: "ueber-server",
            title: "Über Server hinweg beitreten",
            body: "„Kanal beitreten“ geht auch bei Freunden auf einem anderen Server, und mumble://-Links zu einem verbundenen Server springen direkt hin.",
            since: "0.4.0",
          },
          {
            id: "autostart",
            title: "Beim Anmelden starten",
            body: "„Mumcord beim Anmelden starten“ gibt es auf allen Systemen.",
            since: "0.4.0",
          },
        ],
      },
      {
        id: "kanaele",
        title: "Kanäle und Leute",
        features: [
          {
            id: "folgen",
            title: "Kanälen folgen",
            body: "Ein Klick aufs Auge, und du liest einen Kanal mit, ohne drin zu sein. Ungelesenes erscheint als Zähler, auch im eigenen Kanal.",
            shot: "follow-unread-badge",
            alt: "Kanalliste mit Augen-Symbol und Ungelesen-Zählern",
          },
          {
            id: "grosse-server",
            title: "Große Server im Griff",
            body: "Strg+K sucht Kanäle und Leute, „Zu meinem Kanal springen“ bringt dich zurück. Getestet mit 1000 Leuten in 305 Kanälen bei flüssigen 60 fps.",
            shot: "search",
            alt: "Suche nach Kanälen und Leuten mit Strg+K",
          },
          {
            id: "avatare",
            title: "Wer ist wo",
            body: "Eingeklappte und volle Kanäle zeigen einen Stapel Avatare. Beim Drüberfahren gibt es eine Profilvorschau.",
            shot: "channel-avatar-stack",
            alt: "Kanalbaum mit Avatar-Stapeln",
          },
          {
            id: "rechtsklick",
            title: "Rechtsklick auf Leute",
            body: "Profil ansehen, nur für dich stummschalten, Lautstärke von 0 bis 200 % oder eine private Nachricht schreiben. Mumcord merkt sich das pro Person.",
            shot: "person-menu",
            alt: "Kontextmenü einer Person mit Lautstärkeregler",
          },
          {
            id: "personenkarte",
            title: "Doppelklick für private Nachrichten",
            body: "Doppelklick auf eine Person öffnet den privaten Chat. Ein Klick heftet ihre Karte an, mit Knöpfen für private Nachricht und Profil.",
            since: "0.3.0",
          },
          {
            id: "profil",
            title: "Neues Profil",
            body: "Banner, Abzeichen, Musik oder Spiel und alle Einstellungen für die Person. Änderungen gelten sofort, mit kurzem „Gespeichert“. Das Menü per Rechtsklick hat Symbole und Schalter.",
            shot: "profile-full",
            alt: "Volles Profil mit Musik, Einstellungen für die Person und privater Notiz",
            since: "0.3.0",
          },
          {
            id: "kanal-beitreten",
            title: "Kanal einer Person beitreten",
            body: "Rechtsklick auf eine Person oder einen Freund: „‹Kanal› beitreten“ bringt dich direkt in ihren Kanal. Erlaubt der Server das nicht, steht der Grund daneben.",
            shot: "person-menu",
            alt: "Menü einer Person mit „Kanal beitreten“",
            since: "0.3.0",
          },
          {
            id: "mitgliederspalte",
            title: "Rechte Spalte mit Bereichen",
            body: "„In ‹Kanal›“, „In anderen Kanälen“ mit allen anderen auf dem Server und „Freunde“, jeweils einklappbar. Mumcord merkt sich, was offen ist. Links steht „Serverübersicht“ über dem Kanalbaum.",
            shot: "members-other-channels",
            alt: "Rechte Spalte mit geöffnetem Bereich „In anderen Kanälen“",
            since: "0.3.0",
          },
          {
            id: "verbindungsqualitaet",
            title: "Verbindungsqualität",
            body: "Im Profil siehst du auf einen Blick, ob die Verbindung gut, mittel oder schwach ist, aufgeklappt mit Ping, Paketverlust und Bandbreite. Ein kleines Signal-Symbol zeigt, wer gerade schwach verbunden ist.",
            since: "0.4.0",
          },
          {
            id: "zuhoerer",
            title: "Zuhörer mit Ohr",
            body: "Wer einen Kanal nur mithört, steht mit einem Ohr-Symbol in der normalen Liste statt in einer eigenen Gruppe.",
            since: "0.4.0",
          },
          {
            id: "client-info",
            title: "Client und System für Admins",
            body: "Admins sehen im Profil zusätzlich, welchen Client und welches Betriebssystem jemand nutzt, etwa „Mumcord 0.4.0“ oder „Mumble 1.5“.",
            since: "0.4.0",
          },
          {
            id: "kanalfilter",
            title: "Leere Kanäle ausblenden",
            body: "Große Server frieren beim ersten Anzeigen nicht mehr ein. Dazu die Schalter „Leere Kanäle ausblenden“ und „Sprechende zuerst“.",
            since: "0.4.0",
          },
          {
            id: "profilkommentar",
            title: "Profilkommentar mit Format",
            body: "Dein Profilkommentar kann Fett, Kursiv, Links und Listen.",
            since: "0.4.0",
          },
          {
            id: "personen-einstellungen",
            title: "Einstellungen pro Person",
            body: "Lautstärke, Stummschalten und Notiz für jemanden stehen eingeklappt im Profil. Ist etwas verstellt, zeigt die Zeile es kurz an, etwa „Lautstärke 60 %“.",
            since: "0.4.0",
          },
        ],
      },
      {
        id: "chat",
        title: "Chat",
        features: [
          {
            id: "chat-stil",
            title: "Chat im Discord-Stil",
            body: "Avatare, gruppierte Nachrichten, Markdown und eingefügte Bilder. Kanalbeschreibung und Willkommensnachricht sind oben angeheftet.",
            shot: "main-dark",
            alt: "Hauptfenster mit Chat, Kanalliste und Mitgliederliste",
          },
          {
            id: "kompakt",
            title: "Kompakt für volle Kanäle",
            body: "Eine Zeile pro Nachricht mit Uhrzeit und Name, wenn viel los ist.",
            shot: "chat-compact",
            alt: "Chat im kompakten Layout",
          },
          {
            id: "vorschauen",
            title: "Link-Vorschauen",
            body: "Links bekommen eine Karte mit Titel, Beschreibung und Bild. Mumcord lädt sie selbst, nie von Adressen im lokalen Netz; jede Karte lässt sich wegklicken, und die Funktion ist im Wizard und in den Einstellungen abschaltbar.",
            shot: "chat-link-preview",
            alt: "Chat mit einer Link-Vorschau",
            since: "0.2.0",
          },
          {
            id: "videos",
            title: "YouTube und Twitch",
            body: "Video-Links werden zu einer Karte mit Vorschaubild. Der Player lädt erst, wenn du auf Play klickst.",
            shot: "chat-youtube",
            alt: "Chat mit einer YouTube-Karte",
            since: "0.2.0",
          },
          {
            id: "spotify",
            title: "Spotify",
            body: "Auch Spotify-Links bekommen eine Karte mit Cover, Titel und Künstler, der Player kommt erst beim Klick.",
            shot: "chat-spotify",
            alt: "Chat mit einer Spotify-Karte",
            since: "0.2.0",
          },
          {
            id: "bilder",
            title: "Bilder und GIFs im Chat",
            body: "Externe Bilder und Bildlinks erscheinen direkt in der Nachricht, GIFs von Giphy und Tenor spielen ab und zeigen ihre Quelle.",
            shot: "chat-images",
            alt: "Chat mit einem Bild und einem GIF",
            since: "0.2.0",
          },
          {
            id: "bildbetrachter",
            title: "Bildbetrachter",
            body: "Ein Klick auf ein Bild öffnet es groß: zoomen mit Mausrad oder Tasten, verschieben, mit den Pfeiltasten durch alle Bilder des Chats und „Bild speichern“.",
            shot: "image-viewer",
            alt: "Bildbetrachter mit Zoom-Leiste",
            since: "0.2.0",
          },
          {
            id: "erwaehnungen",
            title: "@Erwähnungen",
            body: "Tipp @ und Mumcord schlägt Namen vor. Erwähnungen werden hervorgehoben, benachrichtigen auch in stillen Kanälen und haben einen eigenen Ton.",
            shot: "mention-autocomplete",
            alt: "Eingabefeld mit Namensvorschlag nach @",
            since: "0.2.0",
          },
          {
            id: "code",
            title: "Code und Formatierung",
            body: "Code-Blöcke mit Syntax-Hervorhebung, eine Formatierungsleiste über dem Eingabefeld und Kürzel wie Strg+B, Strg+I oder Strg+E.",
            shot: "chat-code-toolbar",
            alt: "Chat mit hervorgehobenem Code und Formatierungsleiste",
            since: "0.2.0",
          },
          {
            id: "gifs",
            title: "GIF-Favoriten",
            body: "Jedes GIF im Chat per Rechtsklick als Favorit speichern und über den GIF-Knopf wieder senden. Eine GIF-Suche gibt es bewusst nicht: Dafür müsste ein API-Schlüssel in die App.",
            shot: "gif-picker",
            alt: "Auswahl der GIF-Favoriten",
            since: "0.2.0",
          },
          {
            id: "benachrichtigungen",
            title: "Benachrichtigungen, wie du willst",
            body: "Neue Nachrichten als Pop-up in der App, als Systembenachrichtigung, beides oder gar nicht. Dazu kurze, leise Töne pro Ereignis.",
            shot: "notification-toast",
            alt: "Pop-up einer neuen Nachricht in der App",
          },
          {
            id: "aufraeumen",
            title: "Räumt selbst auf",
            body: "Vorschauen und Bilder werden nach einstellbaren Tagen gelöscht, auf Wunsch auch alte Chatverläufe. Der Verlauf liegt nur auf deinem Rechner und lässt sich pro Server abschalten.",
            shot: "settings-04-chat-history-dark",
            alt: "Einstellungen, Bereich Chat und Verlauf",
            since: "0.2.0",
          },
          {
            id: "erwaehnungs-chips",
            title: "@Erwähnungen zum Anklicken",
            body: "Vorschau beim Drüberfahren, Profil per Klick, Menü per Rechtsklick.",
            since: "0.3.0",
          },
          {
            id: "antworten",
            title: "Antworten und Zitate",
            body: "Auf jede Nachricht antworten, mit einem kurzen Zitat, das auch offizielle Clients lesbar zeigen; ein Klick darauf springt zum Original. Antworten auf deine Nachrichten zählen wie eine @Erwähnung, und „> Text“ wird zum Zitat.",
            since: "0.4.0",
          },
          {
            id: "willkommen",
            title: "Willkommensnachricht wegklicken",
            body: "Willkommensnachricht des Servers und Kanalbeschreibung lassen sich schließen und tauchen wieder auf, wenn sie sich ändern.",
            since: "0.4.0",
          },
          {
            id: "zugestellt",
            title: "Zustellung bestätigt",
            body: "Deine Nachricht erscheint sofort, leicht grau, bis der Server sie bestätigt. Klappt das nicht, bleibt der Text erhalten, und du kannst ihn erneut senden oder löschen.",
            since: "0.4.0",
          },
          {
            id: "lange-nachrichten",
            title: "Lange Nachrichten",
            body: "Das Profilbild steht oben beim Namen, und beim Scrollen durch eine lange Nachricht bleiben Bild und Name als schmales Band oben sichtbar.",
            since: "0.4.0",
          },
          {
            id: "bilder-laden",
            title: "Bilder laden im Hintergrund",
            body: "Ein schmaler Balken unter dem Bild zeigt, wie weit die volle Größe ist. Schließt du den Bildbetrachter, lädt sie weiter; das × am Balken bricht ab.",
            since: "0.4.0",
          },
          {
            id: "link-menue",
            title: "Links kopieren",
            body: "Ein Rechtsklick auf einen Link im Chat bietet „Link kopieren“ und „Link öffnen“.",
            since: "0.4.0",
          },
        ],
      },
      {
        id: "sprache",
        title: "Sprache und Audio",
        features: [
          {
            id: "push-to-talk",
            title: "Push-to-Talk überall",
            body: "Tasten und Maustasten, auch wenn ein Spiel im Vordergrund läuft. Unter Wayland über das Shortcut-Portal oder im Kompatibilitätsmodus wie bei TeamSpeak.",
            shot: "wizard-4-talk-mode",
            alt: "Einrichtungsassistent, Schritt Sprechmodus",
          },
          {
            id: "schwelle",
            title: "Sprachaktivierung mit eigener Schwelle",
            body: "Automatisch oder von Hand: Ein Regler über der Live-Pegelanzeige legt fest, ab wann Mumcord sendet. Eine kurze Haltezeit schneidet keine Wortenden ab.",
            shot: "settings-03-voice-dark",
            alt: "Einstellungen, Bereich Sprache mit manueller Schwelle",
            since: "0.2.0",
          },
          {
            id: "klang",
            title: "Klarer Klang von Haus aus",
            body: "KI-Rauschunterdrückung, Echounterdrückung und automatische Verstärkung sind an. Geräte wechseln ohne neu zu verbinden, Mikrofontest mit der eigenen Stimme.",
            shot: "wizard-2-microphone",
            alt: "Einrichtungsassistent, Schritt Mikrofon mit Pegeltest",
          },
          {
            id: "musik",
            title: "Musikqualität",
            body: "Ein Schalter hebt die Bitrate bis zum Limit des Servers, höchstens 510 kbit/s, stimmt den Encoder auf Musik ab und schaltet Rauschunterdrückung und automatische Lautstärke ab.",
            shot: "settings-02-audio-dark",
            alt: "Einstellungen, Bereich Audio mit dem Schalter Musikqualität",
            since: "0.1.1",
          },
          {
            id: "laeuft-gerade",
            title: "Läuft gerade",
            body: "Wenn du willst, sehen andere Mumcord-Nutzer, welche Musik du hörst, mit Cover und Fortschritt. Unter Linux und Windows.",
            shot: "profile-preview",
            alt: "Profilkarte mit „Listening to“ und Fortschrittsbalken",
            since: "0.2.0",
          },
          {
            id: "bitrate",
            title: "Bitrate von Hand",
            body: "Ein eigener Regler von 16 kbit/s bis zum höchsten Wert, den Server und Mumble zulassen. Bei Paketverlust regelt Mumcord weiterhin selbst nach unten.",
            since: "0.4.0",
          },
        ],
      },
      {
        id: "im-spiel",
        title: "Im Spiel",
        features: [
          {
            id: "positional",
            title: "Positional Audio",
            body: "Stimmen von Leuten im selben Spiel kommen aus ihrer Richtung und werden mit der Entfernung leiser. Über Mumble Link oder die offiziellen Spiel-Plugins von Mumble; ein „3D“-Symbol zeigt, wer Positionsdaten sendet.",
            shot: "settings-02b-audio-positional-dark",
            alt: "Einstellungen, Positional Audio mit Entfernungen und Spiel-Plugins",
            since: "0.3.0",
            beta: true,
          },
          {
            id: "spiel-plugins",
            title: "Offizielle Spiel-Plugins",
            body: "Die Plugins von Mumble liefern Positionen für unterstützte Spiele, einzeln schaltbar. Die Einstellungen zeigen, welches gerade aktiv ist.",
            since: "0.3.0",
            beta: true,
          },
          {
            id: "overlay-im-spiel",
            title: "Overlay im Spiel",
            body: "Unter Linux direkt im Spiel als Vulkan-Layer, auch in Steam- und Proton-Spielen, getestet mit Tyr und Supermarket Simulator. Pro Spiel schaltbar; Spiele, deren Anti-Cheat Overlays sperrt, bleiben ausgenommen. Unter Windows kommt es mit 0.4.0.",
            shot: "settings-09b-overlay-ingame-dark",
            alt: "Einstellungen, Overlay im Spiel mit Anti-Cheat-Hinweis und Auswahl pro Spiel",
            since: "0.3.0",
          },
          {
            id: "overlay-fenster",
            title: "Overlay-Fenster",
            body: "Unter Linux und Windows ein durchsichtiges, durchklickbares Fenster über allem, das zeigt, wer in deinem Kanal spricht. Unter macOS gibt es kein Overlay. Mit 0.4.0 fällt das Overlay-Fenster weg.",
            shot: "overlay-window",
            alt: "Overlay-Fenster über einem Spiel, zeigt, wer spricht",
            since: "0.3.0",
          },
          {
            id: "spielt-gerade",
            title: "Spielt gerade",
            body: "Auf Wunsch sehen andere, was du spielst, mit Steam-Bild und Spielzeit. „Spiel beitreten“ für Steam-Spiele, die das unterstützen.",
            since: "0.3.0",
          },
          {
            id: "overlay-windows",
            title: "Overlay im Spiel unter Windows",
            body: "Ein eigenes, durchklickbares Fenster über dem Spiel. Es lädt nichts ins Spiel und geht deshalb auch in Spielen mit Anti-Cheat. Nur im exklusiven Vollbild bleibt es unsichtbar.",
            since: "0.4.0",
          },
          {
            id: "overlay-opengl",
            title: "OpenGL-Spiele unter Linux",
            body: "Für native OpenGL-Spiele wie Project Hospital zeigt Mumcord die passende Steam-Startoption zum Kopieren, die auch nach Updates gilt. Dazu stimmen die Farben in HDR-Spielen.",
            since: "0.4.0",
          },
          {
            id: "flatpak-steam",
            title: "Flatpak-Steam und randloses Vollbild",
            body: "Overlay im Spiel auch für Spiele aus Steam als Flatpak, randlose Vollbildspiele unter KDE und GNOME geprüft. Schließt oder aktualisierst du Mumcord, stürzt ein laufendes Spiel nicht mehr ab.",
            since: "0.4.0",
          },
          {
            id: "spiel-beitreten-link",
            title: "„Spiel beitreten“ über Mumble Link",
            body: "„Spiel beitreten“ auch für Spiele, die ihre Serveradresse über Mumble Link mitteilen.",
            since: "0.4.0",
          },
        ],
      },
      {
        id: "unter-sich",
        title: "Mumcord unter sich",
        features: [
          {
            id: "verlauf",
            title: "Geteilter Chatverlauf",
            body: "Mumcord-Clients reichen bis zu 7 Tage Kanalverlauf weiter, damit du nachlesen kannst, was vor deinem Beitreten geschrieben wurde. Nie private Nachrichten, abschaltbar.",
            shot: "chat-history-sync",
            alt: "Chat mit Nachrichten aus dem Verlauf eines anderen Mumcord-Nutzers",
            since: "0.3.0",
          },
          {
            id: "abzeichen",
            title: "Mumcord-Abzeichen",
            body: "Zeigt, wer Mumcord nutzt, auch bei dir selbst.",
            since: "0.3.0",
          },
          {
            id: "volle-bilder",
            title: "Bilder in voller Größe",
            body: "Mumcord-Nutzer laden das ganze Bild im Bildbetrachter direkt vom Absender, offizielle Clients sehen die Vorschau. Anbieten und Laden einzeln abschaltbar.",
            since: "0.3.0",
            beta: true,
          },
          {
            id: "freunde",
            title: "Freunde",
            body: "Wiedererkannt am Zertifikat, auch über Server und Umbenennungen hinweg. Die Freunde-Liste in der rechten Spalte zeigt, wer online ist und in welchem Kanal. Der private Verlauf mit Freunden bleibt erhalten.",
            shot: "members-friends",
            alt: "Rechte Spalte mit Freunden und wo sie online sind",
            since: "0.3.0",
          },
          {
            id: "direkt",
            title: "Direkt von Mumcord zu Mumcord",
            body: "Verschlüsselte, direkte Verbindungen über IPv6, die Portfreigabe des Routers oder das eigene Netz, ohne fremden Server. Bilder in voller Größe kommen so viel schneller an. Mumcord fragt vorher, weil die anderen dabei deine IP-Adresse sehen.",
            since: "0.4.0",
          },
          {
            id: "zusammen-schauen",
            title: "Zusammen schauen",
            body: "YouTube-Watch-Party im Sprachkanal: Alle sehen dasselbe Video gleichzeitig, jeder kann pausieren und spulen, mit gemeinsamer Playlist.",
            since: "0.4.0",
            beta: true,
          },
          {
            id: "bildschirm-teilen",
            title: "Bildschirm teilen",
            body: "Bildschirm oder Fenster für bis zu 8 Zuschauer, in 720p mit 30 Bildern pro Sekunde. Unter Windows und macOS auf Wunsch mit dem Ton der geteilten App. Gestartet wird über den Apps-Knopf im Chat.",
            since: "0.4.0",
            beta: true,
          },
          {
            id: "schwebende-fenster",
            title: "Schwebende Fenster",
            body: "Watch-Party und geteilte Bildschirme laufen in eigenen Fenstern in der App: verschieben, größer ziehen, einklappen oder als Vollbild. Ein Hinweis oben im Chat zeigt, was im Kanal gerade läuft, und holt dich mit einem Klick dazu.",
            since: "0.4.0",
          },
          {
            id: "live",
            title: "Live, und alle sehen es",
            body: "Teilst du deinen Bildschirm, zeigt ein roter Balken über deinem Profil das an, mit „Beenden“ und der Zahl der Zuschauer. Bei den anderen hat dein Bild einen roten Ring mit „LIVE“.",
            since: "0.4.0",
          },
          {
            id: "ducking",
            title: "Leiser, wenn jemand spricht",
            body: "Solange im Kanal jemand redet, wird der Ton von Watch-Party und geteiltem Bildschirm leiser und danach wieder lauter. Wie leise, stellst du selbst ein, oder du schaltest es ab.",
            since: "0.4.0",
            beta: true,
          },
          {
            id: "aktivitaetstoene",
            title: "Töne für Watch-Party und Teilen",
            body: "Ein kurzer Ton, wenn jemand eine Watch-Party startet, beitritt oder verlässt und wenn jemand seinen Bildschirm teilt oder dir zuschaut. Jeder Ton ist einzeln abschaltbar.",
            since: "0.4.0",
            beta: true,
          },
        ],
      },
      {
        id: "komfort",
        title: "Komfort",
        features: [
          {
            id: "design",
            title: "Hell und dunkel",
            body: "Folgt dem System oder deiner Wahl.",
            shot: "main-light",
            alt: "Hauptfenster im hellen Design",
          },
          {
            id: "toene",
            title: "Töne und Benachrichtigungen",
            body: "Jedes Ereignis einzeln schaltbar: Beitreten, Auflegen, Nachrichten, Erwähnungen.",
            shot: "settings-08-sounds-notifications-dark",
            alt: "Einstellungen, Bereich Töne und Benachrichtigungen",
          },
          {
            id: "sprachen",
            title: "Sprache wechseln ohne Neustart",
            body: "Die Sprache gilt sofort. Tray-Symbol, Start beim Anmelden und Bedienung per Tastatur und Screenreader gehören dazu.",
            shot: "settings-07-language-dark",
            alt: "Einstellungen, Bereich Sprache der Oberfläche",
          },
          {
            id: "privatsphaere",
            title: "Keine Telemetrie",
            body: "Die Identität liegt im sicheren Speicher des Systems. Die Diagnosedatei enthält keine Chatinhalte oder Passwörter und verlässt deinen Rechner nur, wenn du sie selbst verschickst.",
          },
          {
            id: "eu-sprachen",
            title: "Alle 24 Amtssprachen der EU",
            body: "Von Bulgarisch bis Schwedisch, auch im Tray-Menü. Jede Sprache steht in ihrem eigenen Namen in der Auswahl und lässt sich unter jedem Namen suchen. Übersetzt vom Team ohne Prüfung durch Muttersprachler: Korrekturen gern als Issue.",
            since: "0.3.0",
          },
          {
            id: "datenschutz-schritt",
            title: "Datenschutz im Wizard",
            body: "Beim ersten Start zeigt ein kurzer Schritt, womit sich Mumcord verbindet und wann, mit Link zur vollständigen Datenschutzerklärung.",
            shot: "wizard-3-privacy",
            alt: "Wizard, Schritt Datenschutz",
            since: "0.3.0",
          },
          {
            id: "schnelleinstellungen",
            title: "Schnelleinstellungen am Zahnrad",
            body: "Ein Klick aufs Zahnrad: Vorschauen, Design, Overlay, Musik und Spiel teilen, Profil bearbeiten und registrieren. Beta-Funktionen wie Positional Audio stehen in einer eigenen, einklappbaren Gruppe.",
            shot: "quick-settings-beta",
            alt: "Schnelleinstellungen mit geöffneter Beta-Gruppe",
            since: "0.3.0",
          },
          {
            id: "einstellungssuche",
            title: "Einstellungen mit Suche",
            body: "Findet Bereiche und einzelne Einstellungen, springt hin und hebt sie hervor. Die Seitenleiste bleibt beim Scrollen stehen.",
            shot: "settings-search-dark",
            alt: "Einstellungssuche mit Treffern für „overlay“",
            since: "0.3.0",
          },
          {
            id: "barrierefreiheit",
            title: "Bereich Barrierefreiheit",
            body: "Sichtbare Tastaturhinweise, Ansagen für Screenreader und Sprunglinks, einzeln schaltbar.",
            shot: "settings-06-accessibility-dark",
            alt: "Einstellungen, Bereich Barrierefreiheit",
            since: "0.3.0",
          },
          {
            id: "eigene-themes",
            title: "Eigene Themes",
            body: "Aus wenigen Grundfarben, jedes in Hell und Dunkel, mit gut lesbarem Kontrast. Als Farbkreise auswählen, im Chat teilen und auf Wunsch eins pro Server.",
            since: "0.4.0",
          },
          {
            id: "website-look",
            title: "Der Look dieser Website",
            body: "Leuchtende Knöpfe, Farbverläufe, Glas-Effekte und leichtes Filmkorn, auch in der App, abschaltbar.",
            since: "0.4.0",
          },
          {
            id: "auswahllisten",
            title: "Aufgeräumte Einstellungen",
            body: "Eigene Auswahllisten im Theme statt der Browser-Optik, und alle Eingabefelder in den Einstellungen sauber ausgerichtet.",
            since: "0.4.0",
          },
        ],
      },
    ],
  },
  en: {
    title: "Features",
    description:
      "Every Mumcord feature with screenshots: servers and certificates, following channels, chat with previews and @mentions, push-to-talk, audio and comfort.",
    label: "What Mumcord does",
    intro:
      "Everything Mumcord does, with a picture where there is one, plus what comes with the next version. The filter shows beta features or what's new in which version. Missing something or something broken? Tell us on GitHub.",
    contents: "Contents",
    newIn: "new in",
    comingIn: "coming in",
    beta: "Beta",
    filterLabel: "Filter",
    filterAll: "All",
    filterBeta: "Beta",
    filterEmpty: "No features for this filter.",
    jump: "Jump to",
    statFeatures: "features",
    statAreas: "areas",
    statPlatforms: "systems",
    statNew: "new in",
    count: "features",
    zoom: "Open the screenshot at full size",
    close: "Close",
    prev: "Previous screenshot",
    next: "Next screenshot",
    askTitle: "Missing something? Something broken?",
    askBody:
      "Ideas and bugs are collected in the issues on GitHub. You need a free GitHub account; the templates only ask for what actually helps.",
    idea: "Request a feature",
    bug: "Report a bug",
    bugNote: "Please don't report security problems publicly; email tobias@vorwachs.com instead.",
    groups: [
      {
        id: "connecting",
        title: "Connecting",
        features: [
          {
            id: "setup",
            title: "Set up in a minute",
            body: "On first start Mumcord asks for three things only: your name and identity, the microphone with a level test, and how you want to talk. Existing Mumble identities can be imported as PKCS#12.",
            shot: "wizard-1-identity",
            alt: "Setup wizard, identity step",
          },
          {
            id: "servers",
            title: "Server bar and mumble:// links",
            body: "Saved servers in the bar on the left, added by address or link, reordered by dragging. A mumble:// link from the browser opens Mumcord and jumps straight into the channel.",
            shot: "dialog-add-server",
            alt: "“Add server” dialog",
          },
          {
            id: "certificates",
            title: "Certificates that make sense",
            body: "On first contact Mumcord shows the server's fingerprint and remembers it. If it changes later, you get a clear warning instead of a silent click-through.",
            shot: "dialog-certificate-trust",
            alt: "Certificate trust dialog with fingerprint",
          },
          {
            id: "reconnect",
            title: "Reconnect with everything",
            body: "If the connection drops, you're back in the same channel with your mute/deafen state and followed channels. After a restart Mumcord offers to rejoin your last voice channel.",
            shot: "banner-rejoin",
            alt: "Banner offering to rejoin the last voice channel",
          },
          {
            id: "several-servers",
            title: "Several servers at once",
            body: "Up to 5 servers connected at once, adjustable up to 15. You talk on one and read, write and get notified on all of them. Each server reconnects on its own after a drop.",
            since: "0.4.0",
          },
          {
            id: "password",
            title: "Wrong password, try again right away",
            body: "If the server turns down your password, a window asks for the right one straight away. It is saved if you like, and only once the connection works.",
            since: "0.4.0",
          },
          {
            id: "linux-packages",
            title: "Installing on Linux",
            body: "Packages for Debian and Ubuntu, Fedora and openSUSE, Arch (AUR: mumcord-bin) and the AppImage, for x86_64 and ARM64, also with one line in the terminal. Optionally a hint when a new version is out.",
            since: "0.4.0",
          },
          {
            id: "server-notices",
            title: "Notifications per server",
            body: "Notifications and private messages carry the server name, and each server can be muted on its own.",
            since: "0.4.0",
          },
          {
            id: "across-servers",
            title: "Join across servers",
            body: "“Join channel” also works for friends on another server, and mumble:// links to a connected server jump straight there.",
            since: "0.4.0",
          },
          {
            id: "autostart",
            title: "Start at login",
            body: "“Start Mumcord when I log in” is there on every system.",
            since: "0.4.0",
          },
        ],
      },
      {
        id: "channels",
        title: "Channels and people",
        features: [
          {
            id: "follow",
            title: "Follow channels",
            body: "One click on the eye and you read along in a channel without being in it. Unread messages show as a count, in your own channel too.",
            shot: "follow-unread-badge",
            alt: "Channel list with eye icons and unread counts",
          },
          {
            id: "big-servers",
            title: "Big servers under control",
            body: "Ctrl+K searches channels and people, “Jump to my channel” brings you back. Tested with 1000 people in 305 channels at a smooth 60 fps.",
            shot: "search",
            alt: "Ctrl+K search for channels and people",
          },
          {
            id: "avatars",
            title: "Who is where",
            body: "Collapsed and crowded channels show a stack of avatars. Hover for a profile preview.",
            shot: "channel-avatar-stack",
            alt: "Channel tree with avatar stacks",
          },
          {
            id: "right-click",
            title: "Right-click people",
            body: "See the profile, mute just for you, set the volume from 0 to 200 % or send a private message. Mumcord remembers it per person.",
            shot: "person-menu",
            alt: "Context menu of a person with a volume slider",
          },
          {
            id: "person-card",
            title: "Double-click for private messages",
            body: "Double-click a person to open the private chat. A click pins their card, with buttons for private message and profile.",
            since: "0.3.0",
          },
          {
            id: "profile",
            title: "New profile",
            body: "Banner, badge, music or game and all settings for that person. Changes apply instantly with a short “Saved”. The right-click menu has icons and switches.",
            shot: "profile-full",
            alt: "Full profile with music, settings for that person and a private note",
            since: "0.3.0",
          },
          {
            id: "join-channel",
            title: "Join a person's channel",
            body: "Right-click a person or a friend: “Join ‹channel›” takes you straight to their channel. If the server does not allow it, the reason is shown next to it.",
            shot: "person-menu",
            alt: "Person menu with “Join channel”",
            since: "0.3.0",
          },
          {
            id: "member-column",
            title: "Right column with sections",
            body: "“In ‹channel›”, “In other channels” with everyone else on the server, and “Friends”, each collapsible. Mumcord remembers what is open. On the left, “Server overview” sits above the channel tree.",
            shot: "members-other-channels",
            alt: "Right column with “In other channels” open",
            since: "0.3.0",
          },
          {
            id: "connection-quality",
            title: "Connection quality",
            body: "A profile shows at a glance whether the connection is good, fair or weak, and expanded it shows ping, packet loss and bandwidth. A small signal icon marks who has a weak connection right now.",
            since: "0.4.0",
          },
          {
            id: "listeners",
            title: "Listeners with an ear",
            body: "People who only listen to a channel appear in the normal list with an ear icon instead of a group of their own.",
            since: "0.4.0",
          },
          {
            id: "client-info",
            title: "Client and system for admins",
            body: "Admins also see in a profile which client and operating system someone uses, such as “Mumcord 0.4.0” or “Mumble 1.5”.",
            since: "0.4.0",
          },
          {
            id: "channel-filters",
            title: "Hide empty channels",
            body: "Big servers no longer freeze when first shown. Plus the switches “Hide empty channels” and “Talking people first”.",
            since: "0.4.0",
          },
          {
            id: "profile-comment",
            title: "Formatted profile comment",
            body: "Your profile comment can do bold, italic, links and lists.",
            since: "0.4.0",
          },
          {
            id: "person-settings",
            title: "Settings per person",
            body: "Volume, mute and a note for someone sit collapsed in their profile. When something is changed, the row shows it briefly, such as “Volume 60 %”.",
            since: "0.4.0",
          },
        ],
      },
      {
        id: "chat",
        title: "Chat",
        features: [
          {
            id: "chat-style",
            title: "Discord-style chat",
            body: "Avatars, grouped messages, Markdown and pasted images. The channel description and welcome message are pinned on top.",
            shot: "main-dark",
            alt: "Main window with chat, channel list and member list",
          },
          {
            id: "compact",
            title: "Compact for busy channels",
            body: "One line per message with time and name when a lot is going on.",
            shot: "chat-compact",
            alt: "Chat in the compact layout",
          },
          {
            id: "previews",
            title: "Link previews",
            body: "Links get a card with title, description and image. Mumcord fetches them itself, never from local network addresses; every card can be dismissed, and the feature can be switched off in the wizard and in settings.",
            shot: "chat-link-preview",
            alt: "Chat with a link preview",
            since: "0.2.0",
          },
          {
            id: "videos",
            title: "YouTube and Twitch",
            body: "Video links turn into a card with a thumbnail. The player loads only when you click play.",
            shot: "chat-youtube",
            alt: "Chat with a YouTube card",
            since: "0.2.0",
          },
          {
            id: "spotify",
            title: "Spotify",
            body: "Spotify links get a card too, with cover, title and artist; the player comes only on click.",
            shot: "chat-spotify",
            alt: "Chat with a Spotify card",
            since: "0.2.0",
          },
          {
            id: "images",
            title: "Images and GIFs in the chat",
            body: "External images and image links show right in the message, Giphy and Tenor GIFs play and credit their source.",
            shot: "chat-images",
            alt: "Chat with an image and a GIF",
            since: "0.2.0",
          },
          {
            id: "image-viewer",
            title: "Image viewer",
            body: "Click an image to see it large: zoom with the wheel or keys, pan, arrow keys through all images of the chat and “Save image”.",
            shot: "image-viewer",
            alt: "Image viewer with zoom toolbar",
            since: "0.2.0",
          },
          {
            id: "mentions",
            title: "@mentions",
            body: "Type @ and Mumcord suggests names. Mentions are highlighted, notify you even in quiet channels and have their own sound.",
            shot: "mention-autocomplete",
            alt: "Message input with a name suggestion after @",
            since: "0.2.0",
          },
          {
            id: "code",
            title: "Code and formatting",
            body: "Code blocks with syntax highlighting, a formatting toolbar above the input and shortcuts like Ctrl+B, Ctrl+I or Ctrl+E.",
            shot: "chat-code-toolbar",
            alt: "Chat with highlighted code and the formatting toolbar",
            since: "0.2.0",
          },
          {
            id: "gifs",
            title: "GIF favorites",
            body: "Save any GIF in the chat as a favorite by right-click and send it again from the GIF button. There is no GIF search on purpose: it would need an API key inside the app.",
            shot: "gif-picker",
            alt: "GIF favorites picker",
            since: "0.2.0",
          },
          {
            id: "notifications",
            title: "Notifications your way",
            body: "New messages as an in-app pop-up, a system notification, both or none. Plus short, quiet sounds per event.",
            shot: "notification-toast",
            alt: "In-app pop-up for a new message",
          },
          {
            id: "clean-up",
            title: "Cleans up after itself",
            body: "Previews and images are deleted after a number of days you choose, old chat history too if you like. History lives only on your computer and can be switched off per server.",
            shot: "settings-04-chat-history-dark",
            alt: "Settings, chat and history section",
            since: "0.2.0",
          },
          {
            id: "mention-chips",
            title: "Clickable @mentions",
            body: "Preview on hover, profile on click, menu on right-click.",
            since: "0.3.0",
          },
          {
            id: "replies",
            title: "Replies and quotes",
            body: "Reply to any message with a short quote that official clients show readably too; one click on it jumps to the original. Replies to your messages count like an @mention, and “> text” becomes a quote.",
            since: "0.4.0",
          },
          {
            id: "welcome",
            title: "Close the welcome message",
            body: "The server's welcome message and the channel description can be closed and come back when they change.",
            since: "0.4.0",
          },
          {
            id: "delivered",
            title: "Confirmed delivery",
            body: "Your message shows up at once, slightly grey until the server confirms it. If that fails, the text is kept and you can send it again or delete it.",
            since: "0.4.0",
          },
          {
            id: "long-messages",
            title: "Long messages",
            body: "The profile picture sits at the top next to the name, and while you scroll through a long message, picture and name stay visible in a slim band at the top.",
            since: "0.4.0",
          },
          {
            id: "image-loading",
            title: "Images load in the background",
            body: "A slim bar under the image shows how far the full size has got. Closing the image viewer keeps it loading; the × on the bar cancels it.",
            since: "0.4.0",
          },
          {
            id: "link-menu",
            title: "Copy links",
            body: "Right-clicking a link in the chat offers “Copy link” and “Open link”.",
            since: "0.4.0",
          },
        ],
      },
      {
        id: "voice",
        title: "Voice and audio",
        features: [
          {
            id: "push-to-talk",
            title: "Push-to-talk everywhere",
            body: "Keys and mouse buttons, even with a game in the foreground. On Wayland via the shortcuts portal or in a TeamSpeak-like compatibility mode.",
            shot: "wizard-4-talk-mode",
            alt: "Setup wizard, talk mode step",
          },
          {
            id: "threshold",
            title: "Voice activation with your own threshold",
            body: "Automatic or by hand: a slider over the live level meter sets when Mumcord starts sending. A short hold keeps word endings intact.",
            shot: "settings-03-voice-dark",
            alt: "Settings, voice section with a manual threshold",
            since: "0.2.0",
          },
          {
            id: "sound",
            title: "Clear sound out of the box",
            body: "AI noise suppression, echo cancellation and automatic gain are on. Switch devices without reconnecting, test your microphone with your own voice.",
            shot: "wizard-2-microphone",
            alt: "Setup wizard, microphone step with level test",
          },
          {
            id: "music",
            title: "Music quality",
            body: "One switch raises the bitrate up to the server's limit, at most 510 kbit/s, tunes the encoder for music and turns off noise suppression and automatic gain.",
            shot: "settings-02-audio-dark",
            alt: "Settings, audio section with the music quality switch",
            since: "0.1.1",
          },
          {
            id: "now-playing",
            title: "Now playing",
            body: "If you like, other Mumcord users see what music you're listening to, with cover and progress. On Linux and Windows.",
            shot: "profile-preview",
            alt: "Profile card with “Listening to” and a progress bar",
            since: "0.2.0",
          },
          {
            id: "bitrate",
            title: "Bitrate by hand",
            body: "A slider of its own from 16 kbit/s up to the highest value the server and Mumble allow. On packet loss Mumcord still turns it down by itself.",
            since: "0.4.0",
          },
        ],
      },
      {
        id: "in-game",
        title: "In game",
        features: [
          {
            id: "positional",
            title: "Positional audio",
            body: "Voices of people in the same game come from their direction and get quieter with distance. Via Mumble Link or Mumble's official game plugins; a “3D” icon shows who is sending positions.",
            shot: "settings-02b-audio-positional-dark",
            alt: "Settings, positional audio with distances and game plugins",
            since: "0.3.0",
            beta: true,
          },
          {
            id: "game-plugins",
            title: "Official game plugins",
            body: "Mumble's plugins deliver positions for supported games, each with its own switch. Settings show which one is active.",
            since: "0.3.0",
            beta: true,
          },
          {
            id: "in-game-overlay",
            title: "In-game overlay",
            body: "On Linux right inside the game as a Vulkan layer, also in Steam and Proton games, tested with Tyr and Supermarket Simulator. Set per game; games whose anti-cheat blocks overlays stay excluded. Windows gets it with 0.4.0.",
            shot: "settings-09b-overlay-ingame-dark",
            alt: "Settings, in-game overlay with anti-cheat warning and per-game choices",
            since: "0.3.0",
          },
          {
            id: "overlay-window",
            title: "Overlay window",
            body: "On Linux and Windows a transparent, click-through window on top of everything that shows who is talking in your channel. There is no overlay on macOS. The overlay window goes away with 0.4.0.",
            shot: "overlay-window",
            alt: "Overlay window over a game showing who is talking",
            since: "0.3.0",
          },
          {
            id: "now-gaming",
            title: "Now gaming",
            body: "If you like, others see what you're playing, with the Steam picture and play time. “Join game” for Steam games that support it.",
            since: "0.3.0",
          },
          {
            id: "overlay-windows",
            title: "In-game overlay on Windows",
            body: "A separate click-through window over the game. It loads nothing into the game, so it also works in games with anti-cheat. Only exclusive fullscreen hides it.",
            since: "0.4.0",
          },
          {
            id: "overlay-opengl",
            title: "OpenGL games on Linux",
            body: "For native OpenGL games such as Project Hospital, Mumcord shows the right Steam launch option to copy, and it keeps working after updates. Colours in HDR games are right too.",
            since: "0.4.0",
          },
          {
            id: "flatpak-steam",
            title: "Flatpak Steam and borderless fullscreen",
            body: "The in-game overlay also for games from Steam as a Flatpak, borderless fullscreen games checked on KDE and GNOME. Closing or updating Mumcord no longer crashes a running game.",
            since: "0.4.0",
          },
          {
            id: "join-game-link",
            title: "“Join game” via Mumble Link",
            body: "“Join game” also for games that share their server address through Mumble Link.",
            since: "0.4.0",
          },
        ],
      },
      {
        id: "mumcord-to-mumcord",
        title: "Mumcord to Mumcord",
        features: [
          {
            id: "history",
            title: "Shared chat history",
            body: "Mumcord clients pass on up to 7 days of channel history so you can read what was written before you joined. Never private messages, can be switched off.",
            shot: "chat-history-sync",
            alt: "Chat with messages from another Mumcord user's history",
            since: "0.3.0",
          },
          {
            id: "badge",
            title: "Mumcord badge",
            body: "Shows who uses Mumcord, yourself included.",
            since: "0.3.0",
          },
          {
            id: "full-images",
            title: "Full-size images",
            body: "Mumcord users load the whole image in the image viewer straight from the sender, official clients see the preview. Offering and loading can each be switched off.",
            since: "0.3.0",
            beta: true,
          },
          {
            id: "friends",
            title: "Friends",
            body: "Recognised by certificate, also across servers and renames. The Friends list in the right column shows who is online and in which channel. Private history with friends is kept.",
            shot: "members-friends",
            alt: "Right column with friends and where they are online",
            since: "0.3.0",
          },
          {
            id: "direct",
            title: "Straight from Mumcord to Mumcord",
            body: "Encrypted, direct connections over IPv6, your router's port mapping or your own network, without anyone else's server. Full-size images arrive much faster that way. Mumcord asks first, because the others see your IP address.",
            since: "0.4.0",
          },
          {
            id: "watch-party",
            title: "Watch together",
            body: "A YouTube watch party in the voice channel: everyone sees the same video at once, anyone can pause and seek, with a shared playlist.",
            since: "0.4.0",
            beta: true,
          },
          {
            id: "screen-share",
            title: "Screen sharing",
            body: "A screen or a window for up to 8 viewers, at 720p and 30 frames per second. On Windows and macOS with the shared app's sound if you like. You start it from the Apps button in the chat.",
            since: "0.4.0",
            beta: true,
          },
          {
            id: "floating-widgets",
            title: "Floating windows",
            body: "The watch party and shared screens run in their own windows inside the app: move them, resize them, collapse them or go full screen. A hint at the top of the chat shows what is running in the channel and gets you in with one click.",
            since: "0.4.0",
          },
          {
            id: "live",
            title: "Live, and everyone sees it",
            body: "While you share your screen, a red bar above your profile says so, with “End” and the number of viewers. Others see a red ring with “LIVE” around your picture.",
            since: "0.4.0",
          },
          {
            id: "ducking",
            title: "Quieter while people talk",
            body: "While someone in the channel talks, the sound of the watch party and the shared screen gets quieter and comes back afterwards. You set how quiet, or switch it off.",
            since: "0.4.0",
            beta: true,
          },
          {
            id: "activity-sounds",
            title: "Sounds for watch parties and sharing",
            body: "A short sound when someone starts, joins or leaves a watch party and when someone shares their screen or starts watching yours. Each sound can be switched off.",
            since: "0.4.0",
            beta: true,
          },
        ],
      },
      {
        id: "comfort",
        title: "Comfort",
        features: [
          {
            id: "themes",
            title: "Light and dark",
            body: "Follows your system or your choice.",
            shot: "main-light",
            alt: "Main window in the light theme",
          },
          {
            id: "sounds",
            title: "Sounds and notifications",
            body: "Every event can be switched on its own: joining, leaving, messages, mentions.",
            shot: "settings-08-sounds-notifications-dark",
            alt: "Settings, sounds and notifications section",
          },
          {
            id: "languages",
            title: "Switch language without restarting",
            body: "The language applies at once. A tray icon, start at login and full keyboard and screen reader use come with it.",
            shot: "settings-07-language-dark",
            alt: "Settings, interface language section",
          },
          {
            id: "privacy",
            title: "No telemetry",
            body: "Your identity lives in the system's secure storage. The diagnostic file contains no chat contents or passwords and only leaves your computer if you send it yourself.",
          },
          {
            id: "eu-languages",
            title: "All 24 official EU languages",
            body: "From Bulgarian to Swedish, the tray menu included. Each language is listed in its own name and can be found by any of its names. Translated by the team without review by native speakers: corrections are welcome as an issue.",
            since: "0.3.0",
          },
          {
            id: "privacy-step",
            title: "Privacy in the wizard",
            body: "On first start a short step shows what Mumcord connects to and when, with a link to the full privacy statement.",
            shot: "wizard-3-privacy",
            alt: "Wizard, privacy step",
            since: "0.3.0",
          },
          {
            id: "quick-settings",
            title: "Quick settings on the gear",
            body: "One click on the gear: previews, theme, overlay, sharing music and game, edit profile and register. Beta features such as positional audio sit in their own collapsible group.",
            shot: "quick-settings-beta",
            alt: "Quick settings with the Beta group open",
            since: "0.3.0",
          },
          {
            id: "settings-search",
            title: "Settings with search",
            body: "Finds sections and single settings, jumps there and highlights them. The sidebar stays in place while you scroll.",
            shot: "settings-search-dark",
            alt: "Settings search with results for “overlay”",
            since: "0.3.0",
          },
          {
            id: "accessibility",
            title: "Accessibility section",
            body: "Visible keyboard hints, screen reader announcements and skip links, each with its own switch.",
            shot: "settings-06-accessibility-dark",
            alt: "Settings, accessibility section",
            since: "0.3.0",
          },
          {
            id: "custom-themes",
            title: "Your own themes",
            body: "Made from a few key colours, each in light and dark, with readable contrast. Pick them as colour circles, share them in the chat and, if you like, use one per server.",
            since: "0.4.0",
          },
          {
            id: "website-look",
            title: "This website's look",
            body: "Glowing buttons, gradients, glass effects and a light film grain, in the app too, can be switched off.",
            since: "0.4.0",
          },
          {
            id: "dropdowns",
            title: "Tidy settings",
            body: "Themed dropdowns instead of the browser's look, and every input in the settings neatly aligned.",
            since: "0.4.0",
          },
        ],
      },
    ],
  },
};

// Words from the translation, everything else (screenshots, versions, beta) from English.
const mergeFeatures = (en: FeaturesPage, tr: FeaturesText | undefined): FeaturesPage => {
  if (!tr) return en;
  const { groups: _groups, ...words } = tr;
  return {
    ...en,
    ...words,
    groups: en.groups.map((g) => {
      const tg = tr.groups.find((x) => x.id === g.id);
      return {
        ...g,
        title: tg?.title ?? g.title,
        features: g.features.map((f) => {
          const tf = tg?.features.find((x) => x.id === f.id);
          return tf ? { ...f, title: tf.title, body: tf.body, alt: tf.alt ?? f.alt } : f;
        }),
      };
    }),
  };
};

export const featuresPage = localized(source, (l) => mergeFeatures(source.en, bundles[l]?.features));
