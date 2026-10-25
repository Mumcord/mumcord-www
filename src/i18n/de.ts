export const de = {
  lang: "de",
  locale: "de_DE",
  meta: {
    title: "Mumcord — moderner Voice-Chat für jeden Mumble-Server",
    description:
      "Mumcord ist ein freier Desktop-Client im Discord-Stil für Mumble-Server: Kanälen folgen, Benachrichtigungen, KI-Rauschunterdrückung, Push-to-Talk auch unter Wayland. Für Linux, Windows und macOS. Open Source, ohne Telemetrie.",
  },
  nav: {
    features: "Funktionen",
    how: "So funktioniert's",
    roadmap: "Roadmap",
    download: "Download",
    docs: "Doku",
    changelog: "Changelog",
    server: "Server",
    skip: "Zum Inhalt springen",
    langSwitch: "English",
    menu: "Menü",
  },
  hero: {
    kicker: "Alpha · Open Source · AGPL",
    titleA: "Dein Mumble-Server.",
    titleB: "Endlich gemütlich.",
    lead:
      "Mumcord ist ein Desktop-Client im Discord-Stil, der das Mumble-Protokoll spricht. Server-Leiste, Kanäle, Chat und Mitgliederliste — auf jedem ganz normalen Mumble-Server. Am Server ändert sich nichts.",
    ctaDownload: "Herunterladen",
    ctaSource: "Quellcode auf GitHub",
    meta: "Linux · Windows · macOS",
    shotAlt: "Mumcord-Hauptfenster: Server-Leiste, Kanalbaum, Chat und Mitgliederliste (dunkles Design, Demodaten)",
    talking: "spricht",
  },
  ticker: [
    "Kein Server-Umbau",
    "Mumble 1.4 und neuer",
    "Verschlüsselte Sprache",
    "Hell & dunkel",
    "Keine Telemetrie",
    "Linux X11 & Wayland",
    "Windows 10/11",
    "macOS",
    "Deutsch · English · Español",
    "WCAG 2.2 AA als Ziel",
  ],
  ptt: {
    label: "01 — Push-to-Talk",
    title: "Halt die Taste. Red los.",
    body:
      "Tasten und Maustasten, auch wenn ein Spiel im Vordergrund läuft. Unter Wayland über das Global-Shortcuts-Portal — oder im Kompatibilitätsmodus wie bei TeamSpeak.",
    hint: "Leertaste halten oder Taste drücken",
    idle: "Stumm",
    live: "Du sprichst",
    keyLabel: "Leertaste",
    note: "Nur eine Animation. Die Seite nutzt dein Mikrofon nicht.",
  },
  features: {
    label: "02 — Was Mumcord heute kann",
    title: "Alles, was eine Runde am Abend braucht.",
    intro:
      "Stand: Version 0.2.0 mit Stufe 1a und 1b. Was noch fehlt, steht ehrlich in der Roadmap.",
    all: "Alle Funktionen mit Screenshots",
    items: [
      {
        id: "follow",
        title: "Kanälen folgen",
        body:
          "Ein Klick aufs Auge, und du liest einen Kanal mit, ohne beizutreten — oder folgst über das Server-Menü gleich allen. Ungelesenes steht als Zähler dran, auch im eigenen Kanal.",
      },
      {
        id: "audio",
        title: "Klarer Klang, von Haus aus",
        body:
          "KI-Rauschunterdrückung, Echounterdrückung und automatische Verstärkung sind an. Die Bitrate folgt dem Netz: runter bei Paketverlust, wieder hoch, wenn es sich erholt. Für Musik gibt es einen Schalter für Musikqualität mit bis zu 510 kbit/s, und die Schwelle der Sprachaktivierung lässt sich von Hand setzen.",
      },
      {
        id: "trust",
        title: "Zertifikate, verständlich",
        body:
          "Beim ersten Verbinden siehst du den Fingerabdruck des Servers und entscheidest. Ändert er sich später, stoppt Mumcord mit einer klaren Warnung.",
      },
      {
        id: "chat",
        title: "Chat im Discord-Stil",
        body:
          "Avatare, gruppierte Nachrichten und Markdown mit Formatierungsleiste und Tastenkürzeln. @Erwähnungen mit Autovervollständigung und eigenem Ton, Code mit Syntax-Hervorhebung. Für volle Kanäle gibt es ein kompaktes Layout; Kanalbeschreibung und Willkommensnachricht sind oben angeheftet.",
      },
      {
        id: "media",
        title: "Links, die man sieht",
        body:
          "Link-Vorschauen, Karten für YouTube, Twitch und Spotify, die erst beim Klick laden, und externe Bilder direkt im Chat, mit Bildbetrachter und Zoom. GIF-Favoriten per Rechtsklick. Alles abschaltbar, nie von Adressen im lokalen Netz.",
      },
      {
        id: "notify",
        title: "Benachrichtigungen, wie du willst",
        body:
          "Neue Nachrichten als kleines Pop-up in der App, als Systembenachrichtigung, beides oder gar nicht. Dazu kurze, leise Töne pro Ereignis — auch beim Beitreten und Auflegen.",
      },
      {
        id: "crowd",
        title: "Auch große Server bleiben übersichtlich",
        body:
          "Suche mit Strg+K, ein Sprung zu deinem Kanal, gestapelte Avatare ab sechs Leuten. Getestet mit 1000 Personen in 305 Kanälen — flüssig bei 60 fps.",
      },
      {
        id: "people",
        title: "Rechtsklick auf Leute",
        body:
          "Profil, für mich stummschalten, Lautstärke von 0 bis 200 %, private Nachricht. Gemerkt am Zertifikat der Person — auch nach einer Umbenennung. Profilvorschau schon beim Drüberfahren.",
      },
      {
        id: "reconnect",
        title: "Kommt zurück, wo du warst",
        body:
          "Nach einem Abbruch stellt Mumcord Kanal, Stumm/Taub-Status und gefolgte Kanäle wieder her. Nach einem Neustart bietet es an, deinem letzten Sprachkanal wieder beizutreten.",
      },
      {
        id: "identity",
        title: "Deine Identität bleibt deine",
        body:
          "Das Client-Zertifikat liegt im sicheren Speicher deines Systems. Import aus dem offiziellen Mumble-Client per PKCS#12, Export jederzeit.",
      },
      {
        id: "setup",
        title: "In einer Minute startklar",
        body:
          "Der Einrichtungsassistent fragt nur Identität, Mikrofon und Sprechmodus ab. Auf Wunsch öffnet Mumcord mumble://-Links und startet beim Anmelden mit.",
      },
      {
        id: "a11y",
        title: "Für alle gebaut",
        body:
          "Tastaturbedienung, Screenreader-Labels, helles und dunkles Design, Systemskalierung. Deutsch, Englisch und Spanisch — Wechsel ohne Neustart.",
      },
    ],
    followDemo: {
      channel: "Raid-Planung",
      unread: "neu",
      message: "Priya: Mittwoch, 20 Uhr?",
      following: "Gefolgt",
    },
    noise: { before: "Ohne", after: "Mit Rauschunterdrückung" },
    fingerprint: "SHA-256 Fingerabdruck",
    trustQuestion: "Diesem Server vertrauen?",
    trustYes: "Vertrauen",
    trustNo: "Abbrechen",
  },
  how: {
    label: "03 — Nur ein Client",
    title: "Nichts am Server installieren. Nie.",
    body:
      "Mumcord spricht das Standard-Mumble-Protokoll. Dein Server bleibt, wie er ist; Freunde mit dem offiziellen Mumble-Client sitzen im selben Kanal wie du.",
    server: "Mumble-Server",
    serverSub: "murmur / mumble-server, unverändert",
    you: "Du, mit Mumcord",
    friend: "Freunde, mit Mumble",
    channelTls: "TLS · Steuerung & Chat",
    channelUdp: "OCB2-AES · Sprache via UDP, Fallback TCP",
    linkTitle: "mumble://-Links öffnen direkt",
    linkBody: "Klick im Browser, Mumcord startet, bietet das Speichern an und springt in den Kanal.",
    facts: [
      { k: "64738", v: "Standard-Port, sonst nichts" },
      { k: "1.4+", v: "volle Funktion, ältere Server best effort" },
      { k: "0", v: "Zeilen Server-Code" },
    ],
  },
  gallery: {
    label: "04 — Einmal durchklicken",
    title: "Ein Fenster, das sich vertraut anfühlt.",
    items: [
      { src: "wizard-1-identity", caption: "Einrichtung in etwa einer Minute: Identität, Mikrofon, Sprechmodus." },
      { src: "wizard-3-talk-mode", caption: "Sprachaktivierung oder Push-to-Talk, mumble://-Links und Autostart." },
      { src: "follow-unread-badge", caption: "Kanälen per Auge folgen, Ungelesenes als Zähler." },
      { src: "notification-toast", caption: "Ein kleines Pop-up meldet neue Nachrichten aus anderen Kanälen." },
      { src: "chat-compact", caption: "Kompaktes Chat-Layout: Zeit, Name und Nachricht in einer Zeile." },
      { src: "channel-avatar-stack", caption: "Volle Kanäle zeigen einen Avatar-Stapel statt einer langen Liste." },
      { src: "person-menu", caption: "Rechtsklick: stummschalten, Lautstärke, private Nachricht." },
      { src: "search", caption: "Strg+K durchsucht Kanäle und Leute." },
      { src: "banner-rejoin", caption: "Nach dem Neustart zurück in den letzten Sprachkanal." },
      { src: "dialog-certificate-trust", caption: "Vertrauen beim ersten Kontakt, mit Fingerabdruck." },
      { src: "settings-07-sounds-notifications-dark", caption: "Töne und Benachrichtigungen, pro Ereignis einstellbar." },
      { src: "settings-02-audio-dark", caption: "Geräte wechseln, ohne neu zu verbinden." },
      { src: "main-light", caption: "Helles Design, vollwertig." },
      { src: "settings-06-language-dark", caption: "Deutsch, Englisch, Spanisch." },
    ],
  },
  roadmap: {
    label: "05 — Wohin es geht",
    title: "Ehrlich: das hier ist eine Alpha.",
    body: "Die Roadmap ist ein Vorschlag und kann sich ändern. Mobile Apps und eine Web-Version sind nicht geplant. Serverseitig wird nie etwas nötig sein.",
    now: "jetzt",
    all: "Die ganze Roadmap im Detail",
    steps: [
      { tag: "Epic 1 · 1a", title: "Alltags-Client", body: "Fertig seit Version 0.1.0: Wizard, Server, Kanäle, Sprache, Chat und Folgen. Unsignierte Builds für Linux, Windows und macOS." },
      { tag: "Epic 1 · 1b", title: "Mehr Chat", body: "Fertig mit 0.2.0: Link-Vorschauen zum Wegklicken, Karten für YouTube, Twitch und Spotify, die erst beim Klick laden, externe Bilder mit Bildbetrachter und Zoom, @Erwähnungen mit eigenem Ton, GIF-Favoriten, Code-Hervorhebung und eine Formatierungsleiste. Dazu eine manuelle Schwelle für die Sprachaktivierung und, wenn du willst, „Läuft gerade“: Andere sehen, welche Musik du hörst." },
      { tag: "Epic 1 · 1c", title: "Im Spiel", now: true, body: "Kommt mit 0.3.0, zusammen mit 1d. Positional Audio über Mumble Link und die offiziellen Spiel-Plugins. Ein Overlay direkt im Spiel unter Linux und Windows, pro Spiel einstellbar, sonst als schwebendes Fenster; unter macOS gibt es kein Overlay. Auf Wunsch „Spielt gerade“ mit Spiel beitreten über Steam, @Erwähnungen zum Anklicken, Schnelleinstellungen am Zahnrad und Einstellungen mit Suche und eigenem Bereich für Barrierefreiheit." },
      { tag: "Epic 1 · 1d", title: "Mumcord unter sich", now: true, body: "Kommt mit 0.3.0, zusammen mit 1c. Mumcord-Clients teilen den Chatverlauf der letzten Tage, damit du nachlesen kannst, was vor deinem Beitreten geschrieben wurde. Ein Abzeichen zeigt, wer Mumcord nutzt. Doppelklick für private Nachrichten, neues Profil, Freunde mit Online-Status und Bilder, die sich zuverlässig reinziehen und einfügen lassen. Andere Mumcord-Nutzer sehen deine Bilder in voller Größe statt nur als Vorschau." },
      { tag: "Epic 2", title: "Mehrere Server und eigene Themes", body: "Auf allen Servern mitlesen, auf einem sprechen. Dazu eigene Themes mit Farben und Vorlagen, teilbar als Text: Im Chat erscheint eine Vorschaukarte, ein Klick übernimmt das Theme." },
      { tag: "Epic 3", title: "Komfort", body: "Globale Hotkeys, volles Tray-Menü, Import aus dem offiziellen Client, Flüstern, Server-Browser." },
      { tag: "Epic 4", title: "Admin", body: "ACLs, Banns, Kanalverwaltung." },
      { tag: "Epic 5", title: "Auslieferung", body: "Signierte Installer, Auto-Update, Absturzberichte nur mit Zustimmung, Paketquellen." },
      { tag: "Epic 6", title: "GIF-Suche", body: "Suche nach GIFs, ohne einen API-Schlüssel in die App zu packen, den jemand auslesen könnte. Wie genau, wird noch entschieden." },
    ],
  },
  download: {
    label: "06 — Holen",
    title: "Mumcord herunterladen",
    latest: "Neueste Version",
    prerelease: "Vorabversion",
    published: "veröffentlicht am",
    notes: "Was ist neu",
    allReleases: "Alle Releases",
    checksums: "SHA256SUMS prüfen",
    noRelease:
      "Das erste Release ist noch nicht veröffentlicht. Releases entstehen aus Versions-Tags, werden auf frischen Rechnern getestet und erscheinen dann auf GitHub — diese Seite zeigt sie automatisch an.",
    testBuilds: "Releases auf GitHub",
    howTo: "Installationsanleitung",
    platforms: {
      windows: { name: "Windows", sub: "10 / 11 · Installer (.exe)", warn: "SmartScreen warnt vor unbekanntem Herausgeber: „Weitere Informationen“ → „Trotzdem ausführen“." },
      macos: { name: "macOS", sub: "Universal, Apple Silicon & Intel · .dmg", warn: "Gatekeeper blockiert beim ersten Start: Rechtsklick → „Öffnen“ oder unter Datenschutz & Sicherheit erlauben." },
      linux: { name: "Linux", sub: "X11 & Wayland · AppImage", warn: "chmod +x Mumcord_*.AppImage — braucht WebKitGTK 4.1 und einen Secret-Service-Schlüsselbund." },
    },
    unsigned: "Builds sind derzeit unsigniert. Signierte Installer kommen mit Epic 5.",
    source: "Lieber selbst bauen? Rust, Node 24, ein Befehl.",
    sourceLink: "Bauanleitung im Wiki",
  },
  changelog: {
    title: "Changelog",
    description: "Was sich in jeder Mumcord-Version geändert hat — von der ersten Alpha an.",
    label: "Versionen",
    intro: "Was sich in jeder Version für dich ändert. Die technischen Details stehen in den Releases auf GitHub.",
    released: "veröffentlicht am",
    upcoming: "in Vorbereitung",
    upcomingNote: "Diese Version ist noch nicht veröffentlicht. Sobald das Release auf GitHub erscheint, steht hier der Download.",
    download: "Herunterladen",
    onGithub: "Release auf GitHub",
    known: "Bekannte Einschränkungen",
    githubOnly: "Für diese Version gibt es nur die Release-Notes auf GitHub.",
  },
  footer: {
    tagline: "Moderner Voice-Chat für Mumble-Server.",
    disclaimer:
      "Mumcord ist mit Mumble kompatibel, aber weder mit dem Mumble-Projekt verbunden noch von ihm unterstützt. „Mumble“ ist der Name dieses Projekts; Mumcord verwendet nicht das Mumble-Logo.",
    project: "Projekt",
    legal: "Rechtliches",
    source: "Quellcode",
    wiki: "Wiki",
    issues: "Alle Issues",
    releases: "Releases",
    idea: "Feature wünschen",
    bug: "Fehler melden",
    features: "Funktionen",
    roadmap: "Roadmap",
    changelog: "Changelog",
    server: "Eigener Server",
    license: "Lizenz (AGPL-3.0)",
    imprint: "Impressum",
    privacy: "Datenschutz",
    noTracking: "Diese Seite setzt keine Cookies und lädt nichts von Dritten.",
    by: "Ein Projekt von",
  },
  notFound: {
    title: "Kanal nicht gefunden",
    body: "Hier ist niemand. Vielleicht hat sich der Server umbenannt — oder der Link war nie da.",
    back: "Zurück zur Lobby",
  },
};

export type Dict = typeof de;
