export const de = {
  lang: "de",
  locale: "de_DE",
  meta: {
    title: "Mumcord — moderner Voice-Chat für jeden Mumble-Server",
    description:
      "Mumcord ist ein freier Desktop-Client im Discord-Stil für Mumble-Server: Kanäle folgen, KI-Rauschunterdrückung, Push-to-Talk auch unter Wayland. Für Linux, Windows und macOS. Open Source, ohne Telemetrie.",
  },
  nav: {
    features: "Funktionen",
    how: "So funktioniert's",
    roadmap: "Roadmap",
    download: "Download",
    docs: "Doku",
    skip: "Zum Inhalt springen",
    langSwitch: "English",
    menu: "Menü",
  },
  hero: {
    kicker: "Alpha · Open Source · MIT",
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
      "Stand: Epic 1, Stufe 1a — der Alltags-Client. Was noch fehlt, steht ehrlich in der Roadmap.",
    items: [
      {
        id: "follow",
        title: "Kanälen folgen",
        body:
          "Lies den Chat eines Kanals, ohne beizutreten. Gefolgte Kanäle zeigen ungelesene Nachrichten als Badge. Einfacher Klick liest, Doppelklick tritt bei.",
      },
      {
        id: "audio",
        title: "Klarer Klang, von Haus aus",
        body:
          "KI-Rauschunterdrückung, Echounterdrückung und automatische Verstärkung sind an. Die Bitrate folgt dem Netz: runter bei Paketverlust, wieder hoch, wenn es sich erholt.",
      },
      {
        id: "trust",
        title: "Zertifikate, verständlich",
        body:
          "Beim ersten Verbinden siehst du den Fingerabdruck des Servers und entscheidest. Ändert er sich später, stoppt Mumcord mit einer klaren Warnung.",
      },
      {
        id: "identity",
        title: "Deine Identität bleibt deine",
        body:
          "Das Client-Zertifikat liegt im sicheren Speicher deines Systems. Import aus dem offiziellen Mumble-Client per PKCS#12, Export jederzeit.",
      },
      {
        id: "chat",
        title: "Chat mit Markdown",
        body:
          "Fett, kursiv, Code, Links. Bilder einfügen oder reinziehen — sie werden auf das Limit des Servers skaliert. Alles vom Server wird bereinigt.",
      },
      {
        id: "people",
        title: "Lautstärke pro Person",
        body:
          "0 bis 200 %, lokal stummschalten. Gemerkt am Zertifikat der Person — auch nach einer Umbenennung.",
      },
      {
        id: "reconnect",
        title: "Kommt zurück, wo du warst",
        body:
          "Nach einem Verbindungsabbruch stellt Mumcord Kanal, Stumm/Taub-Status und gefolgte Kanäle wieder her.",
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
      { src: "wizard-2-microphone", caption: "Mikrofontest, der dir deine eigene Stimme vorspielt." },
      { src: "follow-unread-badge", caption: "Gefolgte Kanäle mit Badge für Ungelesenes." },
      { src: "dialog-certificate-trust", caption: "Vertrauen beim ersten Kontakt, mit Fingerabdruck." },
      { src: "settings-03-voice-dark", caption: "Sprachaktivierung oder Push-to-Talk." },
      { src: "settings-02-audio-dark", caption: "Geräte wechseln ohne neu zu verbinden." },
      { src: "main-light", caption: "Helles Design, vollwertig." },
      { src: "settings-06-language-dark", caption: "Deutsch, Englisch, Spanisch." },
    ],
  },
  roadmap: {
    label: "05 — Wohin es geht",
    title: "Ehrlich: das hier ist eine Alpha.",
    body: "Die Roadmap ist ein Vorschlag und kann sich ändern. Mobile Apps und eine Web-Version sind nicht geplant. Serverseitig wird nie etwas nötig sein.",
    now: "jetzt",
    steps: [
      { tag: "Epic 1 · 1a", title: "Alltags-Client", body: "Alles auf dieser Seite. Test-Builds, unsigniert.", now: true },
      { tag: "Epic 1 · 1b", title: "Positional Audio & Overlay", body: "Mumble Link mit den offiziellen Spiel-Plugins, schwebendes Overlay." },
      { tag: "Epic 2", title: "Mehrere Server gleichzeitig", body: "Auf allen Servern mitlesen, auf einem sprechen." },
      { tag: "Epic 3", title: "Komfort", body: "Globale Hotkeys, Tray-Menü, Desktop-Benachrichtigungen, Flüstern, Server-Browser." },
      { tag: "Epic 4", title: "Admin", body: "ACLs, Banns, Kanalverwaltung." },
      { tag: "Epic 5", title: "Auslieferung", body: "Signierte Installer, Auto-Update, Absturzberichte nur mit Zustimmung." },
    ],
  },
  download: {
    label: "06 — Holen",
    title: "Mumcord herunterladen",
    latest: "Neueste Version",
    prerelease: "Vorabversion",
    published: "veröffentlicht am",
    notes: "Release-Notes",
    allReleases: "Alle Releases",
    checksums: "SHA256SUMS prüfen",
    noRelease:
      "Es gibt noch kein offizielles Release. Unsignierte Test-Builds entstehen bei jedem Push über GitHub Actions — einloggen, den letzten erfolgreichen Lauf „Test builds“ öffnen und das Artefakt für dein System laden.",
    testBuilds: "Test-Builds auf GitHub Actions",
    howTo: "Installationsanleitung",
    platforms: {
      windows: { name: "Windows", sub: "10 / 11 · Installer (.exe)", warn: "SmartScreen warnt vor unbekanntem Herausgeber: „Weitere Informationen“ → „Trotzdem ausführen“." },
      macos: { name: "macOS", sub: "Apple Silicon & Intel · .dmg", warn: "Gatekeeper blockiert beim ersten Start: Rechtsklick → „Öffnen“ oder unter Datenschutz & Sicherheit erlauben." },
      linux: { name: "Linux", sub: "X11 & Wayland · AppImage", warn: "chmod +x Mumcord_*.AppImage — braucht WebKitGTK 4.1 und einen Secret-Service-Schlüsselbund." },
    },
    unsigned: "Builds sind derzeit unsigniert. Signierte Installer kommen mit Epic 5.",
    source: "Lieber selbst bauen? Rust, Node 24, ein Befehl.",
    sourceLink: "Bauanleitung im Wiki",
  },
  footer: {
    tagline: "Moderner Voice-Chat für Mumble-Server.",
    disclaimer:
      "Mumcord ist mit Mumble kompatibel, aber weder mit dem Mumble-Projekt verbunden noch von ihm unterstützt. „Mumble“ ist der Name dieses Projekts; Mumcord verwendet nicht das Mumble-Logo.",
    project: "Projekt",
    legal: "Rechtliches",
    source: "Quellcode",
    wiki: "Wiki",
    issues: "Fehler melden",
    releases: "Releases",
    license: "MIT-Lizenz",
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
