// Step-by-step guide for hosting a standard Mumble server with Docker Compose. The compose file
// was tested against mumblevoip/mumble-server v1.5.735 (the version Mumcord's own tests use).
// Body strings may contain inline HTML (<code>, <strong>, <a>); they are written here, never user input.
import { localized } from "../i18n";
import { bundles } from "../i18n/locales";
import type { GuideText } from "../i18n/bundle";
import { buildCompose, buildEnv, DEFAULTS } from "./compose";

// The compose and env files carry German or English comments; the other languages use English.
type Lang = "de" | "en";

export { IMAGE } from "./compose";
export const IMAGE_DOCS = "https://github.com/mumble-voip/mumble-docker";
export const MUMBLE_CLIENT = "https://www.mumble.info/downloads/";

export interface Snippet {
  file?: string;
  code: string;
}

export interface Step {
  id: string;
  title: string;
  body: string[];
  code?: Snippet[];
  after?: string[];
}

export interface Configurator {
  title: string;
  intro: string;
  jump: string;
  server: string;
  features: string;
  name: string;
  welcome: string;
  users: string;
  /** Label and hint per option of ServerOptions. */
  options: Record<"password" | "bigImages" | "longText" | "relay" | "webhook" | "music" | "history", [string, string]>;
  quality: { label: string; hint: string; standard: string; good: string; best: string };
  setup: string;
  download: string;
  regenerate: string;
  secrets: string;
  after: string;
  notes: Record<"ports" | "portsRelay" | "relay" | "webhook" | "music" | "history" | "more", string>;
  modeCommand: string;
  needsMumbot: string;
  /** Titles of the one-command steps (STEP_IDS in compose.ts). */
  steps: Record<"folder" | "compose" | "env" | "configs" | "start" | "show", string>;
  copyAll: string;
  modeFiles: string;
  advanced: string;
  pluginLimit: string;
  pluginBurst: string;
  pluginHint: string;
}

export interface Guide {
  title: string;
  description: string;
  label: string;
  intro: string;
  facts: { value: string; label: string }[];
  stepsTitle: string;
  /** Short label of the hero button that jumps to the steps. */
  stepsCta: string;
  steps: Step[];
  troubleTitle: string;
  trouble: { q: string; a: string }[];
  copy: string;
  copied: string;
  more: string;
  configurator: Configurator;
}

const compose = (lang: Lang) => buildCompose(lang, DEFAULTS[lang]);
const env = (lang: Lang) => buildEnv(lang, DEFAULTS[lang]);

const source: Record<Lang, Guide> = {
  de: {
    title: "Eigenen Mumble-Server betreiben",
    description:
      "Schritt für Schritt zum eigenen Mumble-Server mit Docker Compose: Installation, docker-compose.yml, Ports, Einladungslinks, Updates und Backups.",
    label: "Anleitung",
    intro:
      "Mumcord braucht keinen besonderen Server: Ein ganz normaler Mumble-Server reicht. Mit Docker steht deiner in etwa 15 Minuten, auch wenn du so etwas noch nie gemacht hast.",
    facts: [
      { value: "64738", label: "Port, TCP und UDP" },
      { value: "1 Kern", label: "und 512 MB RAM reichen für Dutzende Leute" },
      { value: "0 €", label: "Open Source; nur der Rechner kostet" },
    ],
    stepsTitle: "In acht Schritten, plus einem optionalen",
    stepsCta: "Schritt für Schritt",
    steps: [
      {
        id: "rechner",
        title: "Einen Rechner aussuchen",
        body: [
          "Am einfachsten ist ein kleiner Linux-Server bei einem Hoster (ein „VPS“ für ein paar Euro im Monat). Er läuft rund um die Uhr und hat eine feste Adresse. Ein Rechner zu Hause oder ein Raspberry Pi geht auch; dann musst du im Router einen Port freigeben (Schritt 5).",
          "Mumble braucht kaum Leistung. Wichtiger ist die Leitung: Pro Person fallen beim Sprechen etwa 40–100 kbit/s an.",
        ],
      },
      {
        id: "docker",
        title: "Docker installieren",
        body: [
          "Melde dich per SSH auf dem Server an. Unter Linux installiert dieser Befehl Docker samt Compose. Auf Windows und macOS nimmst du stattdessen <a href=\"https://docs.docker.com/get-started/get-docker/\" rel=\"noopener\">Docker Desktop</a>.",
        ],
        code: [{ code: "curl -fsSL https://get.docker.com | sudo sh\ndocker compose version" }],
        after: ["Erscheint eine Versionsnummer, ist alles bereit."],
      },
      {
        id: "dateien",
        title: "Ordner und Passwort anlegen",
        body: [
          "Lege einen Ordner an und erzeuge ein zufälliges Passwort für den Admin-Zugang <code>SuperUser</code>:",
        ],
        code: [
          { code: "mkdir -p ~/mumble && cd ~/mumble\nopenssl rand -base64 24" },
          { file: ".env", code: env("de") },
        ],
        after: [
          "Speichere die zweite Datei als <code>.env</code> und setze das erzeugte Passwort ein (zum Beispiel mit <code>nano .env</code>). Soll nicht jeder mit der Adresse auf den Server kommen, trag bei <code>SERVER_PASSWORD</code> ein Passwort ein, das du deinen Leuten gibst. Danach schützt <code>chmod 600 .env</code> die Datei vor anderen Nutzern des Rechners.",
        ],
      },
      {
        id: "compose",
        title: "Die docker-compose.yml",
        body: [
          "Diese Datei kommt als <code>docker-compose.yml</code> in denselben Ordner. Ändere Servername und Willkommenstext nach Lust und Laune, der Rest passt so.",
        ],
        code: [{ file: "docker-compose.yml", code: compose("de") }],
        after: [
          "Die beiden letzten Einstellungen sind für Mumcord gedacht: Eingefügte Bilder dürfen größer sein, und lange Nachrichten werden nicht abgeschnitten. Alle weiteren Einstellungen gehen nach demselben Muster <code>MUMBLE_CONFIG_…</code>, siehe die <a href=\"https://github.com/mumble-voip/mumble-docker\" rel=\"noopener\">Doku des Images</a>.",
        ],
      },
      {
        id: "starten",
        title: "Starten und Port freigeben",
        body: ["Server starten und kurz ins Log schauen:"],
        code: [{ code: "docker compose up -d\ndocker compose logs -f   # Strg+C beendet nur die Anzeige" }],
        after: [
          "Steht dort <code>Server listening on 0.0.0.0:64738</code>, läuft er. Jetzt muss der Port <strong>64738 für TCP und UDP</strong> von außen erreichbar sein:",
          "<strong>Server mit Firewall</strong> (zum Beispiel ufw): <code>sudo ufw allow 64738/tcp</code> und <code>sudo ufw allow 64738/udp</code>. Manche Hoster haben zusätzlich eine Firewall im Kundenmenü.",
          "<strong>Rechner zu Hause:</strong> Im Router eine Portweiterleitung für 64738 TCP und UDP auf diesen Rechner einrichten.",
        ],
      },
      {
        id: "verbinden",
        title: "Mit Mumcord verbinden",
        body: [
          "Klicke in Mumcord in der Server-Leiste auf <strong>+</strong> und gib die IP-Adresse oder den Namen deines Servers ein. Schöner als eine IP ist ein eigener Name: Lege bei deinem Domain-Anbieter einen A-Eintrag an, etwa <code>voice.example.org</code>, der auf die IP zeigt.",
          "Beim ersten Verbinden zeigt Mumcord den Fingerabdruck des Zertifikats. Das ist normal, denn der Server hat sich beim ersten Start selbst eines erstellt. Bestätige ihn einmal; ändert er sich später unerwartet, warnt Mumcord dich.",
        ],
      },
      {
        id: "einladen",
        title: "Leute einladen",
        body: [
          "Schick deinen Leuten einen Link. Ein Klick darauf öffnet Mumcord (oder einen anderen Mumble-Client) und verbindet direkt; mit einem Kanalnamen am Ende landet man gleich im richtigen Kanal:",
        ],
        code: [{ code: "mumble://voice.example.org\nmumble://voice.example.org/Zocken" }],
        after: [
          "Wer Mumcord noch nicht hat, findet es auf <a href=\"/#download\">mumcord.app</a>. Ein Server-Passwort schickst du am besten getrennt vom Link.",
        ],
      },
      {
        id: "kanaele",
        title: "Kanäle und Rechte einrichten",
        body: [
          "Kanäle anlegen und Rechte verteilen kommt in Mumcord erst mit Epic 4. Bis dahin nimmst du dafür einmal den offiziellen <a href=\"https://www.mumble.info/downloads/\" rel=\"noopener\">Mumble-Client</a>:",
        ],
        after: [
          "1. Mit dem Benutzernamen <code>SuperUser</code> und dem Passwort aus der <code>.env</code> verbinden.",
          "2. Rechtsklick auf den obersten Kanal → <strong>Hinzufügen</strong>, für jeden Kanal, den du willst.",
          "3. Damit du nicht jedes Mal SuperUser brauchst: Verbinde dich mit Mumcord unter deinem Namen und klicke unten links auf deinen Namen → <strong>Auf diesem Server registrieren</strong>. Danach als SuperUser im obersten Kanal → <strong>Bearbeiten</strong> → <strong>Gruppen</strong> → Gruppe <code>admin</code> deinen Namen hinzufügen.",
        ],
      },
      {
        id: "relay",
        title: "Optional: ein Relay für direkte Verbindungen",
        body: [
          "Damit Bildschirm teilen und Bilder in voller Größe auch klappen, wenn sich zwei Leute nicht direkt erreichen, oder damit niemand die IP-Adresse des anderen sieht, kannst du neben dem Server das Relay <a href=\"/mumpeer\">mumpeer</a> betreiben. Der Inhalt bleibt Ende-zu-Ende verschlüsselt.",
          "Mumcord nutzt das Relay ab Version 0.5.0. Den Rest erledigt der Relay-Bot <code>mumbot peer</code>: Er kündigt das Relay an und vergibt die Tokens.",
          "Im Ordner des Servers ein gemeinsames Secret in die <code>.env</code> schreiben und die beiden Beispiel-Konfigurationen holen. In <code>mumpeer.toml</code> bei <code>public_host</code> die Adresse deines Servers eintragen, in <code>bot.toml</code> den Fingerabdruck deines Mumble-Servers. Dann die Dienste unten in der <code>docker-compose.yml</code> unter <code>services:</code> ergänzen und <code>mumpeer-data:</code> und <code>mumbot-data:</code> unter <code>volumes:</code>.",
        ],
        code: [
          { code: "echo \"PEER_API_SECRET=$(openssl rand -hex 32)\" >> .env\ncurl -fsSL -o mumpeer.toml https://raw.githubusercontent.com/Mumcord/mumbot/main/examples/peer-with-relay/mumpeer.example.toml\ncurl -fsSL -o bot.toml https://raw.githubusercontent.com/Mumcord/mumbot/main/examples/peer-with-relay/bot.example.toml" },
          { file: "docker-compose.yml", code: "  mumpeer:\n    image: ghcr.io/mumcord/mumpeer:0.1.0\n    restart: unless-stopped\n    environment:\n      MUMPEER_API_SECRET: ${PEER_API_SECRET:?PEER_API_SECRET}\n    ports: [\"443:443/udp\", \"443:443/tcp\"]\n    volumes:\n      - ./mumpeer.toml:/config/mumpeer.toml:ro\n      - mumpeer-data:/var/lib/mumpeer\n  mumbot:\n    image: ghcr.io/mumcord/mumbot:0.2.0\n    command: [\"peer\"]\n    restart: unless-stopped\n    depends_on: [mumble-server, mumpeer]\n    network_mode: \"service:mumpeer\"\n    environment:\n      MUMBOT_CONFIG: /config/bot.toml\n      MUMBOT_PEER_API_SECRET: ${PEER_API_SECRET:?PEER_API_SECRET}\n      SERVER_PASSWORD: ${SERVER_PASSWORD:-}\n    volumes:\n      - ./bot.toml:/config/bot.toml:ro\n      - mumbot-data:/data\n    healthcheck:\n      disable: true" },
        ],
        after: [
          "Mit <code>docker compose up -d</code> starten und zusätzlich UDP und TCP auf Port 443 öffnen. Läuft dort schon ein Webserver, nimm in <code>mumpeer.toml</code> andere Ports. Die API bleibt zwischen Relay und Bot.",
          "Beim ersten Start steht der Fingerabdruck des Relays im Log. Der Bot kündigt ihn an, sonst muss nichts geteilt werden. Mehr dazu auf der Seite zu <a href=\"/mumpeer\">mumpeer</a>.",
        ],
      },
    ],
    troubleTitle: "Pflege und Probleme",
    trouble: [
      {
        q: "Wie aktualisiere ich den Server?",
        a: "Trag in der <code>docker-compose.yml</code> bei <code>image:</code> die neue Version ein (die Liste steht auf <a href=\"https://hub.docker.com/r/mumblevoip/mumble-server/tags\" rel=\"noopener\">Docker Hub</a>) und führe <code>docker compose pull</code> und dann <code>docker compose up -d</code> aus. Kanäle und Registrierungen bleiben erhalten.",
      },
      {
        q: "Wie mache ich ein Backup?",
        a: "Alles Wichtige liegt im Volume <code>mumble_data</code>. Kurz anhalten, einpacken, weiterlaufen lassen: <code>docker compose stop</code>, dann <code>docker run --rm -v mumble_data:/data -v \"$PWD\":/backup alpine tar czf /backup/mumble-backup.tar.gz -C /data .</code> und zum Schluss <code>docker compose start</code>.",
      },
      {
        q: "Niemand kommt auf den Server.",
        a: "Fast immer ist der Port zu. Prüfe mit <code>docker compose ps</code>, ob der Container läuft, und dann Firewall, Hoster-Firewall und Router (Schritt 5). Läuft dein Server zu Hause, kann es sein, dass du von innen die öffentliche Adresse nicht erreichst; teste dann mit der lokalen IP.",
      },
      {
        q: "Verbinden klappt, aber die Sprache ist verzögert.",
        a: "Dann ist meist nur TCP offen, nicht UDP. Mumcord weicht dann automatisch auf TCP aus. Das funktioniert, ist aber langsamer. Gib auch UDP 64738 frei.",
      },
      {
        q: "Ich habe das SuperUser-Passwort vergessen.",
        a: "Trag in der <code>.env</code> ein neues ein und führe <code>docker compose up -d</code> aus. Der Server übernimmt es bei jedem Start.",
      },
    ],
    copy: "Kopieren",
    copied: "Kopiert",
    more: "Mehr Hilfe gibt es im Wiki und in den Issues auf GitHub.",
    configurator: {
      title: "Konfigurator",
      intro: "Häkchen setzen, Namen eintragen, fertig: Daraus entstehen deine `docker-compose.yml` und `.env`. Alles passiert in deinem Browser, nichts wird gesendet.",
      steps: {
        folder: "Ordner anlegen",
        compose: "docker-compose.yml laden",
        env: "Passwörter erzeugen (.env)",
        configs: "Konfigurationen für Bots und Relay holen",
        start: "Starten",
        show: "Passwörter anzeigen und notieren",
      },
      copyAll: "Alles auf einmal kopieren",
      needsMumbot: "Webhook, Relay-Bot, Musik und Verlauf laufen zusammen als ein Mumbot mit Modulen. Das kommt mit Mumbot 0.2.0.",
      modeCommand: "Ein Befehl",
      modeFiles: "Dateien selbst anlegen",
      advanced: "Erweitert",
      pluginLimit: "Versteckte Pakete pro Sekunde",
      pluginBurst: "Davon kurz hintereinander",
      pluginHint: "Plugin-Daten, über die Mumcord-Clients Bilder, Chatverlauf und Watch-Party austauschen. Was darüber hinausgeht, verwirft der Server ohne Meldung. Standard: 4 pro Sekunde, kurz bis 15. Mumcord bleibt mit 3 und 10 darunter, mehr Spielraum hilft vor allem anderen Plugins.",
      jump: "Lieber klicken? Zum Konfigurator",
      server: "Server",
      features: "Funktionen",
      name: "Name des Servers",
      welcome: "Willkommenstext",
      users: "Höchstens gleichzeitig",
      quality: {
        label: "Höchste Bitrate",
        hint: "Wie viel eine Person höchstens senden darf. Standard reicht für Sprache, Gut für Musik mit Mumcords Musikqualität, Beste für Hi-Fi und gemeinsames Musizieren. Mehr Bitrate braucht mehr Upload am Server.",
        standard: "Standard",
        good: "Gut",
        best: "Beste",
      },
      options: {
        password: [
          "Server-Passwort",
          "Nur wer das Passwort kennt, kommt rein"
        ],
        bigImages: [
          "Große Bilder",
          "Bilder im Chat bis 1 MB statt 128 KB"
        ],
        longText: [
          "Lange Nachrichten",
          "Bis 10 000 statt 5000 Zeichen"
        ],
        relay: [
          "mumpeer-Relay",
          "Bildschirm teilen und große Bilder auch hinter CGNAT, ohne dass jemand deine IP sieht"
        ],
        webhook: [
          "Mumbot-Webhook",
          "Meldungen aus Monitoring oder CI in einen Kanal"
        ],
        music: ["Mumbot-Musik", "MP3s per HTTP in einen Sprachkanal spielen, mit Warteschlange"],
        history: ["Mumbot-Verlauf", "Hebt Kanal-Chat für Mumcord-Nutzer auf, die weg waren. Private Nachrichten nie"]
      },
      setup: "Ordner und Konfigurationen",
      download: "Herunterladen",
      regenerate: "Neue Passwörter",
      secrets: "Die Passwörter in der `.env` hat gerade dein Browser erzeugt. Sie stehen nirgends sonst, heb sie gut auf.",
      after: "Danach",
      notes: {
        ports: "Öffne Port 64738 für TCP und UDP.",
        portsRelay: "Öffne zusätzlich Port 443 für TCP und UDP.",
        relay: "In `mumpeer.toml` bei `public_host` die Adresse deines Servers eintragen, in `bot.toml` den Fingerabdruck deines Mumble-Servers.",
        webhook: "In `bot.toml` einen API-Schlüssel und die erlaubten Kanäle festlegen. Dann schreibt etwa `curl` an `http://127.0.0.1:8080/message` in den Kanal.",
        more: "Die Schritte unten erklären jeden Teil im Detail.",
        music: "MP3s in den Ordner `media` legen und in `bot.toml` einen API-Schlüssel festlegen. Dann spielt eine Anfrage an `http://127.0.0.1:8081` sie im Kanal.",
        history: "In `bot.toml` festlegen, wie lange der Bot den Chat aufhebt. Er braucht Leserechte in den Kanälen."
      }
    },
  },
  en: {
    title: "Host your own Mumble server",
    description:
      "Step by step to your own Mumble server with Docker Compose: installation, docker-compose.yml, ports, invite links, updates and backups.",
    label: "Guide",
    intro:
      "Mumcord doesn't need a special server: a plain Mumble server is all it takes. With Docker yours is up in about 15 minutes, even if you've never done this before.",
    facts: [
      { value: "64738", label: "port, TCP and UDP" },
      { value: "1 core", label: "and 512 MB RAM handle dozens of people" },
      { value: "€0", label: "open source; you only pay for the machine" },
    ],
    stepsTitle: "In eight steps, plus an optional one",
    stepsCta: "Step by step",
    steps: [
      {
        id: "machine",
        title: "Pick a machine",
        body: [
          "The easiest choice is a small Linux server from a hosting provider (a “VPS” for a few euros a month). It runs around the clock and has a fixed address. A computer at home or a Raspberry Pi works too; then you have to open a port on your router (step 5).",
          "Mumble needs very little power. The connection matters more: each person talking uses about 40–100 kbit/s.",
        ],
      },
      {
        id: "docker",
        title: "Install Docker",
        body: [
          "Log in to the server over SSH. On Linux this command installs Docker including Compose. On Windows and macOS use <a href=\"https://docs.docker.com/get-started/get-docker/\" rel=\"noopener\">Docker Desktop</a> instead.",
        ],
        code: [{ code: "curl -fsSL https://get.docker.com | sudo sh\ndocker compose version" }],
        after: ["If you see a version number, you're ready."],
      },
      {
        id: "files",
        title: "Create a folder and a password",
        body: ["Create a folder and generate a random password for the admin account <code>SuperUser</code>:"],
        code: [
          { code: "mkdir -p ~/mumble && cd ~/mumble\nopenssl rand -base64 24" },
          { file: ".env", code: env("en") },
        ],
        after: [
          "Save the second file as <code>.env</code> and paste in the generated password (for example with <code>nano .env</code>). If not everyone with the address should get in, set a <code>SERVER_PASSWORD</code> that you give to your people. Then <code>chmod 600 .env</code> keeps other users of the machine out of the file.",
        ],
      },
      {
        id: "compose",
        title: "The docker-compose.yml",
        body: [
          "This file goes into the same folder as <code>docker-compose.yml</code>. Change the server name and welcome text as you like; the rest is fine as it is.",
        ],
        code: [{ file: "docker-compose.yml", code: compose("en") }],
        after: [
          "The last two settings are there for Mumcord: pasted images may be larger, and long messages aren't cut off. Every other setting follows the same <code>MUMBLE_CONFIG_…</code> pattern, see the <a href=\"https://github.com/mumble-voip/mumble-docker\" rel=\"noopener\">image documentation</a>.",
        ],
      },
      {
        id: "start",
        title: "Start it and open the port",
        body: ["Start the server and take a quick look at the log:"],
        code: [{ code: "docker compose up -d\ndocker compose logs -f   # Ctrl+C only stops the output" }],
        after: [
          "Once it says <code>Server listening on 0.0.0.0:64738</code>, it's running. Now port <strong>64738 for TCP and UDP</strong> has to be reachable from outside:",
          "<strong>Server with a firewall</strong> (for example ufw): <code>sudo ufw allow 64738/tcp</code> and <code>sudo ufw allow 64738/udp</code>. Some providers also have a firewall in their customer panel.",
          "<strong>Computer at home:</strong> set up port forwarding on your router for 64738 TCP and UDP to this computer.",
        ],
      },
      {
        id: "connect",
        title: "Connect with Mumcord",
        body: [
          "In Mumcord, click <strong>+</strong> in the server bar and enter your server's IP address or name. A name is nicer than an IP: create an A record at your domain provider, such as <code>voice.example.org</code>, pointing to the IP.",
          "On first connect Mumcord shows the certificate's fingerprint. That's expected: the server created its own certificate on first start. Confirm it once; if it changes unexpectedly later, Mumcord warns you.",
        ],
      },
      {
        id: "invite",
        title: "Invite people",
        body: [
          "Send your people a link. Clicking it opens Mumcord (or any other Mumble client) and connects right away; add a channel name at the end to land in the right channel:",
        ],
        code: [{ code: "mumble://voice.example.org\nmumble://voice.example.org/Gaming" }],
        after: [
          "Anyone who doesn't have Mumcord yet finds it at <a href=\"/en#download\">mumcord.app</a>. Send a server password separately from the link.",
        ],
      },
      {
        id: "channels",
        title: "Set up channels and permissions",
        body: [
          "Creating channels and handing out permissions comes to Mumcord with Epic 4. Until then, use the official <a href=\"https://www.mumble.info/downloads/\" rel=\"noopener\">Mumble client</a> once:",
        ],
        after: [
          "1. Connect with the username <code>SuperUser</code> and the password from <code>.env</code>.",
          "2. Right-click the top channel → <strong>Add</strong>, for every channel you want.",
          "3. So you don't need SuperUser every time: connect with Mumcord under your own name and click your name at the bottom left → <strong>Register on this server</strong>. Then, as SuperUser, top channel → <strong>Edit</strong> → <strong>Groups</strong> → add your name to the <code>admin</code> group.",
        ],
      },
      {
        id: "relay",
        title: "Optional: a relay for direct connections",
        body: [
          "So screen sharing and full-size images also work when two people cannot reach each other directly, or so nobody sees the other's IP address, you can run the <a href=\"/en/mumpeer\">mumpeer</a> relay next to the server. The content stays end-to-end encrypted.",
          "Mumcord uses the relay from version 0.5.0. The relay bot <code>mumbot peer</code> does the rest: it announces the relay and hands out the tokens.",
          "In the server's folder, write a shared secret into <code>.env</code> and fetch the two example configs. Put your server's address under <code>public_host</code> in <code>mumpeer.toml</code>, and your Mumble server's fingerprint in <code>bot.toml</code>. Then add the services below to <code>docker-compose.yml</code> under <code>services:</code>, and <code>mumpeer-data:</code> and <code>mumbot-data:</code> under <code>volumes:</code>.",
        ],
        code: [
          { code: "echo \"PEER_API_SECRET=$(openssl rand -hex 32)\" >> .env\ncurl -fsSL -o mumpeer.toml https://raw.githubusercontent.com/Mumcord/mumbot/main/examples/peer-with-relay/mumpeer.example.toml\ncurl -fsSL -o bot.toml https://raw.githubusercontent.com/Mumcord/mumbot/main/examples/peer-with-relay/bot.example.toml" },
          { file: "docker-compose.yml", code: "  mumpeer:\n    image: ghcr.io/mumcord/mumpeer:0.1.0\n    restart: unless-stopped\n    environment:\n      MUMPEER_API_SECRET: ${PEER_API_SECRET:?PEER_API_SECRET}\n    ports: [\"443:443/udp\", \"443:443/tcp\"]\n    volumes:\n      - ./mumpeer.toml:/config/mumpeer.toml:ro\n      - mumpeer-data:/var/lib/mumpeer\n  mumbot:\n    image: ghcr.io/mumcord/mumbot:0.2.0\n    command: [\"peer\"]\n    restart: unless-stopped\n    depends_on: [mumble-server, mumpeer]\n    network_mode: \"service:mumpeer\"\n    environment:\n      MUMBOT_CONFIG: /config/bot.toml\n      MUMBOT_PEER_API_SECRET: ${PEER_API_SECRET:?PEER_API_SECRET}\n      SERVER_PASSWORD: ${SERVER_PASSWORD:-}\n    volumes:\n      - ./bot.toml:/config/bot.toml:ro\n      - mumbot-data:/data\n    healthcheck:\n      disable: true" },
        ],
        after: [
          "Start with <code>docker compose up -d</code> and open UDP and TCP on port 443 as well. If a web server already runs there, choose other ports in <code>mumpeer.toml</code>. The API stays between relay and bot.",
          "On first start the relay's fingerprint shows in the log. The bot announces it, nothing else needs to be shared. More on the <a href=\"/en/mumpeer\">mumpeer</a> page.",
        ],
      },
    ],
    troubleTitle: "Upkeep and problems",
    trouble: [
      {
        q: "How do I update the server?",
        a: "Put the new version after <code>image:</code> in <code>docker-compose.yml</code> (see the list on <a href=\"https://hub.docker.com/r/mumblevoip/mumble-server/tags\" rel=\"noopener\">Docker Hub</a>), then run <code>docker compose pull</code> and <code>docker compose up -d</code>. Channels and registrations are kept.",
      },
      {
        q: "How do I make a backup?",
        a: "Everything that matters lives in the <code>mumble_data</code> volume. Pause, pack, resume: <code>docker compose stop</code>, then <code>docker run --rm -v mumble_data:/data -v \"$PWD\":/backup alpine tar czf /backup/mumble-backup.tar.gz -C /data .</code> and finally <code>docker compose start</code>.",
      },
      {
        q: "Nobody can reach the server.",
        a: "Almost always the port is closed. Check with <code>docker compose ps</code> that the container runs, then the firewall, the provider's firewall and your router (step 5). If the server is at home, you may not reach the public address from inside your own network; test with the local IP then.",
      },
      {
        q: "Connecting works, but voice lags.",
        a: "Usually only TCP is open, not UDP. Mumcord then falls back to TCP on its own. That works but is slower. Open UDP 64738 as well.",
      },
      {
        q: "I forgot the SuperUser password.",
        a: "Put a new one in <code>.env</code> and run <code>docker compose up -d</code>. The server applies it on every start.",
      },
    ],
    copy: "Copy",
    copied: "Copied",
    more: "More help is in the wiki and the issues on GitHub.",
    configurator: {
      title: "Configurator",
      intro: "Tick the boxes, enter a name, done: you get your `docker-compose.yml` and `.env`. Everything happens in your browser, nothing is sent anywhere.",
      steps: {
        folder: "Create a folder",
        compose: "Fetch docker-compose.yml",
        env: "Make the passwords (.env)",
        configs: "Fetch the bot and relay configs",
        start: "Start",
        show: "Show the passwords and note them",
      },
      copyAll: "Copy everything at once",
      needsMumbot: "Webhook, relay bot, music and history run together as one Mumbot with modules. That comes with Mumbot 0.2.0.",
      modeCommand: "One command",
      modeFiles: "Create the files yourself",
      advanced: "Advanced",
      pluginLimit: "Hidden packets per second",
      pluginBurst: "Of those in a quick burst",
      pluginHint: "Plugin data that Mumcord clients use for images, chat history and the watch party. The server silently drops anything above it. Default: 4 per second, briefly up to 15. Mumcord stays below with 3 and 10, more room mainly helps other plugins.",
      jump: "Rather click? To the configurator",
      server: "Server",
      features: "Features",
      name: "Server name",
      welcome: "Welcome text",
      users: "At most at once",
      quality: {
        label: "Highest bitrate",
        hint: "The most a person may send. Standard is enough for speech, Good for music with Mumcord's music quality, Best for hi-fi and playing music together. More bitrate needs more upload on the server.",
        standard: "Standard",
        good: "Good",
        best: "Best",
      },
      options: {
        password: [
          "Server password",
          "Only people who know the password get in"
        ],
        bigImages: [
          "Large images",
          "Images in chat up to 1 MB instead of 128 KB"
        ],
        longText: [
          "Long messages",
          "Up to 10,000 instead of 5000 characters"
        ],
        relay: [
          "mumpeer relay",
          "Screen sharing and large images even behind CGNAT, without anyone seeing your IP"
        ],
        webhook: [
          "Mumbot webhook",
          "Messages from monitoring or CI into a channel"
        ],
        music: ["Mumbot music", "Play MP3s into a voice channel over HTTP, with a queue"],
        history: ["Mumbot history", "Keeps channel chat for Mumcord users who were away. Never private messages"]
      },
      setup: "Folder and configs",
      download: "Download",
      regenerate: "New passwords",
      secrets: "Your browser just made the passwords in `.env`. They exist nowhere else, keep them safe.",
      after: "Then",
      notes: {
        ports: "Open port 64738 for TCP and UDP.",
        portsRelay: "Also open port 443 for TCP and UDP.",
        relay: "Put your server's address under `public_host` in `mumpeer.toml`, and your Mumble server's fingerprint in `bot.toml`.",
        webhook: "Set an API key and the allowed channels in `bot.toml`. Then `curl` to `http://127.0.0.1:8080/message` posts into the channel.",
        more: "The steps below explain every part in detail.",
        music: "Put MP3s into the `media` folder and set an API key in `bot.toml`. Then a request to `http://127.0.0.1:8081` plays them in the channel.",
        history: "Set in `bot.toml` how long the bot keeps the chat. It needs read access to the channels."
      }
    },
  },
};

// Words from the translation; the code snippets always come from English.
// Links to English pages in the English text point to the reader's own language instead.
const relink = (lang: string, list: string[]) => list.map((s) => s.replaceAll('href="/en#', `href="/${lang}#`).replaceAll('href="/en/', `href="/${lang}/`));

const mergeGuide = (lang: string, en: Guide, tr: GuideText | undefined): Guide => {
  if (!tr) return { ...en, steps: en.steps.map((s) => ({ ...s, body: relink(lang, s.body), after: s.after && relink(lang, s.after) })) };
  const { steps: _steps, configurator: cfg, ...words } = tr;
  return {
    ...en,
    ...words,
    // Parts of the configurator added after a translation was made come from English.
    configurator: {
      ...en.configurator,
      ...cfg,
      options: { ...en.configurator.options, ...cfg?.options },
      quality: { ...en.configurator.quality, ...cfg?.quality },
      notes: { ...en.configurator.notes, ...cfg?.notes },
      steps: { ...en.configurator.steps, ...cfg?.steps },
    },
    steps: en.steps.map((s) => {
      const ts = tr.steps.find((x) => x.id === s.id);
      const body = ts?.body ?? s.body;
      const after = s.after && (ts?.after ?? s.after);
      return { ...s, title: ts?.title ?? s.title, body: relink(lang, body), after: after && relink(lang, after) };
    }),
  };
};

export const guides = localized(source, (l) => mergeGuide(l, source.en, bundles[l]?.server));
