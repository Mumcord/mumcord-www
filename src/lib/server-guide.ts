// Step-by-step guide for hosting a standard Mumble server with Docker Compose. The compose file
// was tested against mumblevoip/mumble-server v1.5.735 (the version Mumcord's own tests use).
// Body strings may contain inline HTML (<code>, <strong>, <a>); they are written here, never user input.
import type { Lang } from "../i18n";

export const IMAGE = "mumblevoip/mumble-server:v1.5.735";
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

export interface Guide {
  title: string;
  description: string;
  label: string;
  intro: string;
  facts: { value: string; label: string }[];
  stepsTitle: string;
  steps: Step[];
  troubleTitle: string;
  trouble: { q: string; a: string }[];
  copy: string;
  copied: string;
  more: string;
}

const compose = (lang: Lang) => {
  const c =
    lang === "de"
      ? {
          head: "Mumble-Server für Mumcord und jeden anderen Mumble-Client",
          image: "feste Version; zum Aktualisieren hier erhöhen",
          tcp: "Verbindung und Chat",
          udp: "Sprache",
          data: "Kanäle, Registrierungen und Zertifikat",
          secrets: "Passwörter kommen aus der Datei .env daneben, nie direkt hier rein.",
          missing: "SUPERUSER_PASSWORD fehlt in .env",
          password: "leer = jeder mit der Adresse darf rein",
          name: "Unser Server",
          nameNote: "Name des obersten Kanals",
          welcome: "Willkommen! Sag Hallo im Chat.",
          welcomeNote: "steht in Mumcord oben im Chat",
          users: "höchstens so viele gleichzeitig",
          images: "Bilder im Chat bis 1 MB (Standard: 128 KB)",
          text: "längere Nachrichten (Standard: 5000 Zeichen)",
        }
      : {
          head: "Mumble server for Mumcord and any other Mumble client",
          image: "pinned version; raise it here to update",
          tcp: "connection and chat",
          udp: "voice",
          data: "channels, registrations and certificate",
          secrets: "Passwords come from the .env file next to this one, never straight in here.",
          missing: "SUPERUSER_PASSWORD is missing in .env",
          password: "empty = anyone with the address can join",
          name: "Our Server",
          nameNote: "name of the top channel",
          welcome: "Welcome! Say hi in the chat.",
          welcomeNote: "pinned at the top of the chat in Mumcord",
          users: "at most this many at once",
          images: "images in chat up to 1 MB (default: 128 KB)",
          text: "longer messages (default: 5000 characters)",
        };
  return `# ${c.head}
name: mumble

services:
  mumble-server:
    image: ${IMAGE}   # ${c.image}
    restart: unless-stopped
    ports:
      - "64738:64738/tcp"   # ${c.tcp}
      - "64738:64738/udp"   # ${c.udp}
    volumes:
      - data:/data          # ${c.data}
    environment:
      # ${c.secrets}
      MUMBLE_SUPERUSER_PASSWORD: \${SUPERUSER_PASSWORD:?${c.missing}}
      MUMBLE_CONFIG_SERVER_PASSWORD: \${SERVER_PASSWORD:-}   # ${c.password}
      MUMBLE_CONFIG_REGISTER_NAME: "${c.name}"              # ${c.nameNote}
      MUMBLE_CONFIG_WELCOME_TEXT: "${c.welcome}"   # ${c.welcomeNote}
      MUMBLE_CONFIG_USERS: "50"                             # ${c.users}
      MUMBLE_CONFIG_IMAGE_MESSAGE_LENGTH: "1048576"         # ${c.images}
      MUMBLE_CONFIG_TEXT_MESSAGE_LENGTH: "10000"            # ${c.text}

volumes:
  data:
`;
};

const env = (lang: Lang) =>
  lang === "de"
    ? `# Bleibt auf dem Server. Nie in Git, Chats oder Screenshots teilen.
SUPERUSER_PASSWORD=hier-das-zufallspasswort-einfuegen
SERVER_PASSWORD=
`
    : `# Stays on the server. Never share it in Git, chats or screenshots.
SUPERUSER_PASSWORD=paste-the-random-password-here
SERVER_PASSWORD=
`;

export const guides: Record<Lang, Guide> = {
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
    stepsTitle: "In acht Schritten",
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
    stepsTitle: "In eight steps",
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
  },
};
