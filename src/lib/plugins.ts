// Mumcord plugins (0.6.0): the official plugins from the Mumcord/plugins repo, how they are installed
// and kept safe, and how to build your own. Texts follow the plugin repo's README and docs.
import { localized } from "../i18n";
import { bundles } from "../i18n/locales";

export const PLUGINS_REPO = "Mumcord/plugins";
export const PLUGINS_REPO_URL = `https://github.com/${PLUGINS_REPO}`;
export const pluginSource = (id: string) => `${PLUGINS_REPO_URL}/tree/main/${id}`;
export const pluginDoc = (file: string) => `${PLUGINS_REPO_URL}/blob/main/${file}`;
export const EVESHIPFIT_URL = "https://github.com/EVEShipFit";
export const PLUGIN_DOCS_URL = "https://mumcord.github.io/plugins/docs/";
export const PLUGIN_WIKI_URL = `${PLUGINS_REPO_URL}/wiki`;
/** Opens the plugin's details in Mumcord 0.6.0 or newer; the install is still confirmed there. */
export const pluginInstall = (id: string) => `mumcord://plugins/${id}`;
/** The plugin's page in the docs, the fallback when the mumcord:// link opens nothing. */
export const pluginPage = (id: string) => `${PLUGIN_DOCS_URL}plugins/${id}/`;
export const pluginDocPage = (slug: string) => `${PLUGIN_DOCS_URL}${slug}/`;
export const PLUGIN_SDK = 'mumcord-plugin-sdk = "0.6"';

export type PluginId = "poll" | "dice" | "echolings" | "mumbot-music" | "eve-fit" | "whiteboard";
export const PLUGIN_IDS: PluginId[] = ["poll", "dice", "echolings", "mumbot-music", "eve-fit", "whiteboard"];
/** Shown as "coming soon" until its release is confirmed. */
export const PLUGIN_SOON: Partial<Record<PluginId, boolean>> = { whiteboard: true };

export const PLUGIN_QUICKSTART = `cargo install mumcord-plugin
mumcord-plugin new my-plugin
cd my-plugin
mumcord-plugin build
mumcord-plugin test`;

export const PLUGIN_DOCS = [
  { key: "start", slug: "getting-started" },
  { key: "api", slug: "api" },
  { key: "manifest", slug: "manifest" },
  { key: "permissions", slug: "permissions" },
  { key: "building", slug: "building" },
  { key: "testing", slug: "testing" },
  { key: "publishing", slug: "publishing" },
  { key: "repos", slug: "third-party-repositories" },
] as const;
export type DocKey = (typeof PLUGIN_DOCS)[number]["key"];

/** Screenshots from Mumcord 0.6.0 (src/assets/shots/plugin-<shot>-dark|light.png). */
export const PLUGIN_SHOTS = [
  { key: "browse", shot: "plugin-browse", light: true },
  { key: "permissions", shot: "plugin-install-permissions", light: true },
  { key: "progress", shot: "plugin-install-progress", light: true },
  { key: "poll", shot: "plugin-poll-card", light: true },
  { key: "vote", shot: "plugin-poll-vote", light: true },
  { key: "echolings", shot: "plugin-echolings-profile", light: true },
  { key: "snackrace", shot: "plugin-snackrace", light: false },
  { key: "eveCard", shot: "plugin-evefit-card", light: true },
  { key: "eveWheel", shot: "plugin-evefit-wheel", light: true },
  { key: "eveCargo", shot: "plugin-evefit-cargo", light: true },
] as const;
export type ShotKey = (typeof PLUGIN_SHOTS)[number]["key"];

/** An example EFT fitting for the EVE Fit illustration. */
export const EFT_SAMPLE = `[Rifter, Evening patrol]
Damage Control II
200mm Steel Plates II

1MN Afterburner II
Warp Scrambler II

200mm AutoCannon II
200mm AutoCannon II
200mm AutoCannon II`;

interface Card {
  title: string;
  body: string;
}

export interface PluginsPageText {
  label: string;
  title: string;
  description: string;
  intro: string;
  badge: string;
  ctaPlugins: string;
  ctaDev: string;
  pills: string[];
  listTitle: string;
  listBody: string;
  source: string;
  soon: string;
  install: string;
  pluginPage: string;
  installNote: string;
  galleryLabel: string;
  galleryTitle: string;
  galleryBody: string;
  dark: string;
  light: string;
  shots: Record<ShotKey, { caption: string; alt: string }>;
  sdkNote: string;
  docsAll: string;
  wiki: string;
  plugins: Record<PluginId, { name: string; tagline: string; points: string[] }>;
  mock: {
    pollQuestion: string;
    pollOptions: string[];
    pollVotes: string;
    pollLive: string;
    pollPlain: string;
    pollPlainVote: string;
    rollWitness: string;
    rollHistory: string;
    echoStats: string[];
    musicNow: string;
    musicTrack: string;
    musicArtist: string;
    musicQueue: string;
    musicQueueItems: string[];
    musicAdd: string;
    musicMenu: string;
    evePasted: string;
    eveCopy: string;
  };
  eveNotice: string;
  eveCredit: string;
  bridgeTitle: string;
  bridgeBody: string;
  bridgeMumcord: string;
  bridgeMumble: string;
  bridgeNote: string;
  installTitle: string;
  installBody: string;
  steps: Card[];
  stripLabel: string;
  stripChannels: string[];
  safeTitle: string;
  safeBody: string;
  safe: { sandbox: Card; permissions: Card; signed: Card; server: Card; off: Card; langs: Card };
  devLabel: string;
  devTitle: string;
  devBody: string;
  cliTitle: string;
  cli: { cmd: string; body: string }[];
  docsTitle: string;
  docs: Record<DocKey, string>;
  submitTitle: string;
  submitBody: string;
  checksTitle: string;
  checks: string[];
  rulesTitle: string;
  rules: string[];
  policy: string;
  ownRepoTitle: string;
  ownRepoBody: string;
  licenceTitle: string;
  licenceBody: string;
  peopleTitle: string;
  endTitle: string;
  endBody: string;
  endRepo: string;
  copy: string;
  copied: string;
}

const en: PluginsPageText = {
  label: "Plugins",
  title: "Small extras for big evenings",
  description:
    "Mumcord 0.6.0 adds plugins: polls, dice, a pet made of sound and a remote for your music bot. Safe, signed, and no server changes needed.",
  intro:
    "Mumcord 0.6.0 adds plugins: small, safe extras on top of voice chat. They run inside Mumcord, need no server changes and work on any standard Mumble server. People on the official Mumble client see a plain text line where it matters and nothing else.",
  badge: "New in Mumcord 0.6.0",
  ctaPlugins: "Meet the plugins",
  ctaDev: "Build your own",
  pills: ["Sandboxed", "Signed", "No server changes", "24 languages"],
  listTitle: "The first plugins",
  listBody: "Nothing comes preinstalled. Pick what your group enjoys and leave the rest.",
  source: "Source",
  soon: "Coming soon",
  install: "Install in Mumcord",
  pluginPage: "Plugin page",
  installNote: "The install buttons open the plugin in Mumcord 0.6.0 or newer, where you confirm the install. If nothing opens, the plugin page has the details.",
  galleryLabel: "Screenshots",
  galleryTitle: "See them in Mumcord",
  galleryBody: "Straight from Mumcord 0.6.0, in the dark and the light theme.",
  dark: "Dark",
  light: "Light",
  shots: {
    browse: { caption: "Browse the official plugins right in Settings.", alt: "Mumcord Settings, Plugins, Browse tab listing five official plugins (Echolings, Dice roller, EVE fit, Mumbot Music and Poll), each with an icon and an Install button." },
    permissions: { caption: "Every plugin says up front what it may do.", alt: "Install prompt for EVE fit listing its permissions with Required labels, an optional switch and a box that lists what the plugin never gets." },
    progress: { caption: "Signed packages are checked before they install.", alt: "EVE fit install prompt with a progress bar reading “Checking signature…” above the permission list." },
    poll: { caption: "A poll replaces its chat message with a live card.", alt: "Mumcord chat in which Bob’s poll “Which map tonight?” shows as a card with vote bars: Glacier 2 votes, Harbor and Canyon 0." },
    vote: { caption: "Vote in the side sheet; everyone sees the count update.", alt: "Poll side sheet open next to the chat with the options and Glacier selected." },
    echolings: { caption: "Echolings: a pet that grows while you hang out together.", alt: "Bob’s profile card with his Echoling “Moss”, its bond and streak chips and a “Pat Moss” button; pet badges show next to names in the channel tree." },
    snackrace: { caption: "Race your friends’ Echolings to the snack.", alt: "Snack Race in progress with lanes for You and Bob, the moving snack zone and a Hop! button." },
    eveCard: { caption: "Paste an EVE Online fit and it becomes a neat card.", alt: "Chat card for an Algos fit “Evening Roam” pasted by Carol, with slot chips, drones and cargo counts, and Copy fitting and Open buttons." },
    eveWheel: { caption: "Open shows the full fitting wheel and statistics.", alt: "EVE fit dialog with the Algos ship render inside the fitting wheel, module icons and capacitor, offense, defense, targeting, navigation and drone statistics." },
    eveCargo: { caption: "Drone bay, cargo hold and the CCP notice.", alt: "The lower part of the EVE fit dialog: drone bay with Hammerhead II and Hobgoblin II, cargo hold with charges and repair paste, and CCP’s copyright notice at the bottom." },
  },
  sdkNote: "The tool and the SDK are on crates.io. In your Cargo.toml:",
  docsAll: "All docs",
  wiki: "Wiki",
  plugins: {
    poll: {
      name: "Poll",
      tagline: "Ask the channel a question with up to ten options and watch the votes come in live.",
      points: [
        "2 to 10 options, live vote bars in a chat card",
        "No Mumcord? Vote by typing `!poll 1`, `!poll 2` … in chat",
        "Results are shown when the poll closes",
      ],
    },
    dice: {
      name: "Dice roller",
      tagline: "`/roll d20` or `2d6+3`, with fair rolls that others can witness and verify.",
      points: [
        "Advantage and disadvantage, drop lowest or highest, up to 20 dice",
        "Other Mumcord users in the channel witness each roll, so nobody can cheat",
        "A roll history you can expand",
      ],
    },
    echolings: {
      name: "Echolings",
      tagline: "A little creature made of sound that grows while you hang out with friends.",
      points: [
        "5 species, 4 growth stages, 3 colours",
        "Grows from time spent together in voice and chat",
        "Never dies, never nags",
      ],
    },
    "mumbot-music": {
      name: "Mumbot Music",
      tagline: "A remote for your Mumbot music bot.",
      points: [
        "Right-click the bot → “Configure bot”",
        "Now playing, skip, volume, the queue and adding tracks",
        "Needs a Mumbot on the server: an ordinary Mumble user, no server change",
      ],
    },
    "eve-fit": {
      name: "EVE Fit",
      tagline: "Paste an EVE Online fitting in chat and everyone sees a ship card.",
      points: [
        "Spots EFT fits pasted in chat and shows a card with ship and modules",
        "Opens the full fitting view offline, right inside Mumcord",
        "A “Copy fitting” button, and it’s free",
      ],
    },
    whiteboard: {
      name: "Whiteboard",
      tagline: "One shared, endless board for everyone in the voice channel.",
      points: [
        "Pen, highlighter, shapes, arrows, sticky notes and text, with everyone’s cursor and strokes live",
        "Present with a laser pointer while the others follow your view",
        "Export as PNG, SVG, PDF or a board file, or post a picture to the chat",
        "Travels through the server’s relay; the host decides who may draw",
      ],
    },
  },
  mock: {
    pollQuestion: "What do we play tonight?",
    pollOptions: ["Deep Rock Galactic", "Valheim", "Something new"],
    pollVotes: "7 votes",
    pollLive: "Live",
    pollPlain: "Poll: What do we play tonight? 1) Deep Rock Galactic 2) Valheim 3) Something new",
    pollPlainVote: "!poll 2",
    rollWitness: "Witnessed by 3 in the channel",
    rollHistory: "History",
    echoStats: ["5 species", "4 stages", "3 colours"],
    musicNow: "Now playing",
    musicTrack: "Midnight Raid",
    musicArtist: "Lo-fi for late sessions",
    musicQueue: "Queue",
    musicQueueItems: ["Boss Music, Volume 2", "Campfire Loop"],
    musicAdd: "Add track",
    musicMenu: "Configure bot",
    evePasted: "pasted by Maya",
    eveCopy: "Copy fitting",
  },
  eveNotice:
    "EVE Online and all related logos and images are trademarks or registered trademarks of CCP hf. Mumcord is not affiliated with CCP hf.",
  eveCredit: "The fitting view builds on eveship.fit by the EVEShipFit project.",
  bridgeTitle: "Nobody gets left out",
  bridgeBody:
    "Plugins need no server changes and work on any standard Mumble server. Friends on the official Mumble client see a plain text line where it matters, and nothing else.",
  bridgeMumcord: "In Mumcord",
  bridgeMumble: "In the official Mumble client",
  bridgeNote: "An illustration: the exact wording comes from each plugin.",
  installTitle: "Installed in a minute",
  installBody: "Plugins live in the settings, and you see what each one may do before it’s on your machine.",
  steps: [
    { title: "Browse", body: "Settings → Plugins → Browse." },
    { title: "Check", body: "Pick a plugin and review its permissions." },
    { title: "Install", body: "Its icon appears in the plugins strip under the channel tree." },
  ],
  stripLabel: "Plugins",
  stripChannels: ["Lobby", "Raid night", "AFK"],
  safeTitle: "Safe by design",
  safeBody: "A plugin is a guest in your app. These are the house rules.",
  safe: {
    sandbox: {
      title: "A strict sandbox",
      body: "Each plugin is a small WebAssembly program in a strict sandbox. No raw network or file access; Mumcord draws the interface from built-in building blocks.",
    },
    permissions: {
      title: "Permissions you can see",
      body: "Listed before you install. Optional ones can be turned off any time, and updates that need more wait for your approval.",
    },
    signed: {
      title: "Signed, end to end",
      body: "The registry and every package are signed with minisign, and Mumcord checks them before installing. A kill switch can turn off a bad version everywhere.",
    },
    server: { title: "No server changes", body: "Works against an unmodified Mumble server. Nothing to install for the admin." },
    off: {
      title: "One switch to stop them all",
      body: "Nothing is preinstalled. “Turn off all plugins” in Settings → Plugins or the command palette (Ctrl+Shift+P) stops every plugin at once.",
    },
    langs: { title: "In your language", body: "Available in all 24 Mumcord languages." },
  },
  devLabel: "For developers",
  devTitle: "Build your own",
  devBody:
    "Plugins are written in Rust and compiled to WebAssembly (component model, interface `mumcord:plugin@1.0.0`). The repo holds the template, the docs and the source of every official plugin.",
  cliTitle: "One tool for the whole way",
  cli: [
    { cmd: "new", body: "Creates a plugin from the template." },
    { cmd: "build", body: "Builds it reproducibly." },
    { cmd: "check", body: "Checks the package." },
    { cmd: "test", body: "Runs test scenarios against a mock host." },
    { cmd: "serve-registry", body: "Serves a local registry to try it in Mumcord (Developer mode in Settings → Plugins)." },
  ],
  docsTitle: "Docs",
  docs: {
    start: "Getting started",
    api: "API",
    manifest: "Manifest",
    permissions: "Permissions",
    building: "Building",
    testing: "Testing",
    publishing: "Publishing",
    repos: "Your own repository",
  },
  submitTitle: "Into the official registry",
  submitBody:
    "Open a pull request in Mumcord/plugins that adds `plugins/<id>/`. It needs one maintainer approval and a green CI.",
  checksTitle: "What CI checks",
  checks: ["Schema check", "Reproducible rebuild", "Author signature", "Permission diff", "Mock-host load test", "Licence scan"],
  rulesTitle: "The rules",
  rules: ["An OSI-approved licence", "A reproducible build", "No ads, tracking, payments or loot boxes"],
  policy: "Review policy",
  ownRepoTitle: "Or run your own",
  ownRepoBody: "Anyone can run their own plugin repository. Users add it in Settings → Plugins.",
  licenceTitle: "Licences",
  licenceBody: "Official plugins are AGPL-3.0. The template, the docs and the SDK are Apache-2.0.",
  peopleTitle: "Made by",
  endTitle: "Got an idea for a plugin?",
  endBody: "Everything is open: the template, the docs and every official plugin.",
  endRepo: "Open the plugin repo",
  copy: "Copy",
  copied: "Copied",
};

const de: PluginsPageText = {
  label: "Plugins",
  title: "Kleine Extras für große Abende",
  description:
    "Mumcord 0.6.0 bringt Plugins: Umfragen, Würfel, ein Wesen aus Klang und eine Fernbedienung für den Musikbot. Sicher, signiert und ohne Änderungen am Server.",
  intro:
    "Mumcord 0.6.0 bringt Plugins: kleine, sichere Extras zum Sprachchat. Sie laufen in Mumcord, brauchen keine Änderung am Server und funktionieren auf jedem normalen Mumble-Server. Wer den offiziellen Mumble-Client nutzt, sieht an den passenden Stellen eine schlichte Textzeile und sonst nichts.",
  badge: "Neu in Mumcord 0.6.0",
  ctaPlugins: "Die Plugins ansehen",
  ctaDev: "Selbst eins bauen",
  pills: ["Sandbox", "Signiert", "Keine Server-Änderung", "24 Sprachen"],
  listTitle: "Die ersten Plugins",
  listBody: "Nichts ist vorinstalliert. Nimm, was deiner Runde Spaß macht, und lass den Rest weg.",
  source: "Quellcode",
  soon: "Bald",
  install: "In Mumcord installieren",
  pluginPage: "Plugin-Seite",
  installNote: "Die Installieren-Knöpfe öffnen das Plugin in Mumcord 0.6.0 oder neuer, dort bestätigst du die Installation. Öffnet sich nichts, findest du alles auf der Plugin-Seite.",
  galleryLabel: "Screenshots",
  galleryTitle: "So sehen sie in Mumcord aus",
  galleryBody: "Direkt aus Mumcord 0.6.0, im dunklen und im hellen Theme.",
  dark: "Dunkel",
  light: "Hell",
  shots: {
    browse: { caption: "Die offiziellen Plugins direkt in den Einstellungen durchsuchen.", alt: "Mumcord-Einstellungen, Plugins, Reiter Durchsuchen mit fünf offiziellen Plugins (Echolinge, Würfel, EVE Fit, Mumbot Music und Umfrage), jedes mit Symbol und Installieren-Knopf." },
    permissions: { caption: "Jedes Plugin sagt vorher, was es darf.", alt: "Installationsdialog von EVE Fit mit seinen Berechtigungen, als „Erforderlich“ markiert, einem optionalen Schalter und einem Kasten, was das Plugin nie bekommt." },
    progress: { caption: "Signierte Pakete werden vor der Installation geprüft.", alt: "Installationsdialog von EVE Fit mit Fortschrittsbalken „Signatur wird geprüft…“ über der Liste der Berechtigungen." },
    poll: { caption: "Eine Umfrage ersetzt ihre Chatnachricht durch eine Live-Karte.", alt: "Mumcord-Chat, in dem Bobs Umfrage „Which map tonight?“ als Karte mit Balken erscheint: Glacier 2 Stimmen, Harbor und Canyon 0." },
    vote: { caption: "Abstimmen in der Seitenleiste, alle sehen den Stand sofort.", alt: "Seitenleiste der Umfrage neben dem Chat mit den Antworten, Glacier ist ausgewählt." },
    echolings: { caption: "Echolinge: ein Wesen, das wächst, während ihr zusammen abhängt.", alt: "Bobs Profilkarte mit seinem Echoling „Moss“, Chips für Bindung und Serie und einem Knopf „Pat Moss“; Abzeichen neben den Namen im Kanalbaum." },
    snackrace: { caption: "Lass die Echolinge deiner Freunde um den Snack rennen.", alt: "Laufendes Snack Race mit Bahnen für dich und Bob, der wandernden Snack-Zone und einem Hop!-Knopf." },
    eveCard: { caption: "Füg ein EVE-Online-Fitting ein, und es wird zur Karte.", alt: "Chatkarte für ein Algos-Fitting „Evening Roam“, eingefügt von Carol, mit Slots, Drohnen und Fracht sowie den Knöpfen „Copy fitting“ und „Open“." },
    eveWheel: { caption: "Öffnen zeigt das ganze Fitting-Rad mit allen Werten.", alt: "EVE-Fit-Dialog mit dem Algos im Fitting-Rad, Modul-Symbolen und Werten zu Kondensator, Angriff, Verteidigung, Zielerfassung, Navigation und Drohnen." },
    eveCargo: { caption: "Drohnenhangar, Frachtraum und der CCP-Hinweis.", alt: "Unterer Teil des EVE-Fit-Dialogs: Drohnenhangar mit Hammerhead II und Hobgoblin II, Frachtraum mit Munition und Reparaturpaste, darunter der Copyright-Hinweis von CCP." },
  },
  sdkNote: "Werkzeug und SDK liegen auf crates.io. In deiner Cargo.toml:",
  docsAll: "Alle Docs",
  wiki: "Wiki",
  plugins: {
    poll: {
      name: "Umfrage",
      tagline: "Stell dem Channel eine Frage mit bis zu zehn Antworten und sieh die Stimmen live eintrudeln.",
      points: [
        "2 bis 10 Antworten, live wachsende Balken in einer Chat-Karte",
        "Ohne Mumcord? Abstimmen mit `!poll 1`, `!poll 2` … im Chat",
        "Das Ergebnis kommt, sobald die Umfrage endet",
      ],
    },
    dice: {
      name: "Würfel",
      tagline: "`/roll d20` oder `2d6+3`, mit fairen Würfen, die andere bezeugen und prüfen können.",
      points: [
        "Vorteil und Nachteil, niedrigste oder höchste Würfel streichen, bis zu 20 Würfel",
        "Andere Mumcord-Nutzer im Channel bezeugen jeden Wurf, schummeln geht nicht",
        "Ein Wurfverlauf zum Aufklappen",
      ],
    },
    echolings: {
      name: "Echolinge",
      tagline: "Ein kleines Wesen aus Klang, das wächst, während ihr zusammen abhängt.",
      points: [
        "5 Arten, 4 Wachstumsstufen, 3 Farben",
        "Wächst mit der gemeinsamen Zeit in Sprache und Chat",
        "Stirbt nie, nervt nie",
      ],
    },
    "mumbot-music": {
      name: "Mumbot Music",
      tagline: "Eine Fernbedienung für deinen Mumbot-Musikbot.",
      points: [
        "Rechtsklick auf den Bot → „Bot einrichten“",
        "Was gerade läuft, Überspringen, Lautstärke, Warteschlange und Titel hinzufügen",
        "Braucht einen Mumbot auf dem Server: ein ganz normaler Mumble-Nutzer, keine Server-Änderung",
      ],
    },
    "eve-fit": {
      name: "EVE Fit",
      tagline: "Ein EVE-Online-Fitting in den Chat kopieren, und alle sehen eine Schiffskarte.",
      points: [
        "Erkennt EFT-Fittings im Chat und zeigt eine Karte mit Schiff und Modulen",
        "Öffnet die volle Fitting-Ansicht offline, direkt in Mumcord",
        "Mit „Fitting kopieren“-Knopf, und kostenlos",
      ],
    },
    whiteboard: {
      name: "Whiteboard",
      tagline: "Eine gemeinsame, endlose Tafel für alle im Sprachkanal.",
      points: [
        "Stift, Textmarker, Formen, Pfeile, Zettel und Text, mit Cursor und Strichen aller live",
        "Präsentieren mit Laserpointer, während die anderen deiner Ansicht folgen",
        "Export als PNG, SVG, PDF oder Board-Datei, oder als Bild in den Chat",
        "Läuft über das Relay des Servers, und der Host bestimmt, wer zeichnen darf",
      ],
    },
  },
  mock: {
    pollQuestion: "Was spielen wir heute Abend?",
    pollOptions: ["Deep Rock Galactic", "Valheim", "Mal was Neues"],
    pollVotes: "7 Stimmen",
    pollLive: "Live",
    pollPlain: "Umfrage: Was spielen wir heute Abend? 1) Deep Rock Galactic 2) Valheim 3) Mal was Neues",
    pollPlainVote: "!poll 2",
    rollWitness: "Bezeugt von 3 im Channel",
    rollHistory: "Verlauf",
    echoStats: ["5 Arten", "4 Stufen", "3 Farben"],
    musicNow: "Läuft gerade",
    musicTrack: "Midnight Raid",
    musicArtist: "Lo-Fi für lange Abende",
    musicQueue: "Warteschlange",
    musicQueueItems: ["Boss Music, Volume 2", "Campfire Loop"],
    musicAdd: "Titel hinzufügen",
    musicMenu: "Bot einrichten",
    evePasted: "eingefügt von Maya",
    eveCopy: "Fitting kopieren",
  },
  eveNotice:
    "EVE Online and all related logos and images are trademarks or registered trademarks of CCP hf. Mumcord is not affiliated with CCP hf.",
  eveCredit: "Die Fitting-Ansicht baut auf eveship.fit vom EVEShipFit-Projekt auf.",
  bridgeTitle: "Niemand bleibt außen vor",
  bridgeBody:
    "Plugins brauchen keine Änderung am Server und laufen auf jedem normalen Mumble-Server. Freunde mit dem offiziellen Mumble-Client sehen an den passenden Stellen eine schlichte Textzeile, sonst nichts.",
  bridgeMumcord: "In Mumcord",
  bridgeMumble: "Im offiziellen Mumble-Client",
  bridgeNote: "Eine Illustration: Den genauen Wortlaut bestimmt das jeweilige Plugin.",
  installTitle: "In einer Minute installiert",
  installBody: "Plugins findest du in den Einstellungen, und du siehst, was eins darf, bevor es auf deinem Rechner landet.",
  steps: [
    { title: "Stöbern", body: "Einstellungen → Plugins → Durchsuchen." },
    { title: "Prüfen", body: "Plugin aussuchen und seine Berechtigungen ansehen." },
    { title: "Installieren", body: "Sein Symbol erscheint in der Plugin-Leiste unter dem Channel-Baum." },
  ],
  stripLabel: "Plugins",
  stripChannels: ["Lobby", "Raid-Abend", "AFK"],
  safeTitle: "Sicher gebaut",
  safeBody: "Ein Plugin ist Gast in deiner App. Das sind die Hausregeln.",
  safe: {
    sandbox: {
      title: "Eine strenge Sandbox",
      body: "Jedes Plugin ist ein kleines WebAssembly-Programm in einer strengen Sandbox. Kein direkter Netz- oder Dateizugriff; die Oberfläche baut Mumcord aus eigenen Bausteinen.",
    },
    permissions: {
      title: "Berechtigungen, die du siehst",
      body: "Vor der Installation aufgelistet. Optionale lassen sich jederzeit abschalten, und Updates, die mehr wollen, warten auf dein Okay.",
    },
    signed: {
      title: "Durchgehend signiert",
      body: "Die Registry und jedes Paket sind mit minisign signiert, Mumcord prüft vor der Installation. Ein Notschalter kann eine fehlerhafte Version überall abschalten.",
    },
    server: { title: "Keine Server-Änderung", body: "Läuft gegen einen unveränderten Mumble-Server. Der Admin muss nichts installieren." },
    off: {
      title: "Ein Schalter für alle",
      body: "Nichts ist vorinstalliert. „Alle Plugins ausschalten“ in Einstellungen → Plugins oder in der Befehlspalette (Strg+Umschalt+P) stoppt alle auf einmal.",
    },
    langs: { title: "In deiner Sprache", body: "In allen 24 Sprachen von Mumcord." },
  },
  devLabel: "Für Entwickler",
  devTitle: "Selbst eins bauen",
  devBody:
    "Plugins schreibst du in Rust, gebaut wird zu WebAssembly (Component Model, Schnittstelle `mumcord:plugin@1.0.0`). Im Repo liegen die Vorlage, die Doku und der Quellcode aller offiziellen Plugins.",
  cliTitle: "Ein Werkzeug für den ganzen Weg",
  cli: [
    { cmd: "new", body: "Legt ein Plugin aus der Vorlage an." },
    { cmd: "build", body: "Baut es reproduzierbar." },
    { cmd: "check", body: "Prüft das Paket." },
    { cmd: "test", body: "Spielt Testszenarien gegen einen Mock-Host durch." },
    { cmd: "serve-registry", body: "Stellt eine lokale Registry bereit, um es in Mumcord auszuprobieren (Entwicklermodus in Einstellungen → Plugins)." },
  ],
  docsTitle: "Doku",
  docs: {
    start: "Erste Schritte",
    api: "API",
    manifest: "Manifest",
    permissions: "Berechtigungen",
    building: "Bauen",
    testing: "Testen",
    publishing: "Veröffentlichen",
    repos: "Eigenes Repository",
  },
  submitTitle: "In die offizielle Registry",
  submitBody: "Öffne einen Pull Request in Mumcord/plugins, der `plugins/<id>/` hinzufügt. Er braucht ein Okay von einem Maintainer und eine grüne CI.",
  checksTitle: "Was die CI prüft",
  checks: ["Schema-Prüfung", "Reproduzierbarer Neubau", "Signatur des Autors", "Berechtigungs-Diff", "Lasttest im Mock-Host", "Lizenz-Scan"],
  rulesTitle: "Die Regeln",
  rules: ["Eine OSI-anerkannte Lizenz", "Ein reproduzierbarer Build", "Keine Werbung, kein Tracking, keine Zahlungen, keine Lootboxen"],
  policy: "Review-Richtlinie",
  ownRepoTitle: "Oder ein eigenes betreiben",
  ownRepoBody: "Jeder kann ein eigenes Plugin-Repository betreiben. Nutzer fügen es in Einstellungen → Plugins hinzu.",
  licenceTitle: "Lizenzen",
  licenceBody: "Die offiziellen Plugins stehen unter AGPL-3.0, Vorlage, Doku und SDK unter Apache-2.0.",
  peopleTitle: "Gebaut von",
  endTitle: "Eine Idee für ein Plugin?",
  endBody: "Alles ist offen: die Vorlage, die Doku und jedes offizielle Plugin.",
  endRepo: "Zum Plugin-Repo",
  copy: "Kopieren",
  copied: "Kopiert",
};

// Translations replace texts key by key; anything missing stays English.
const merge = <T,>(base: T, tr: unknown): T => {
  if (tr === undefined || tr === null) return base;
  if (Array.isArray(base) || typeof base !== "object" || base === null) return (typeof tr === typeof base ? tr : base) as T;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const k of Object.keys(out)) out[k] = merge(out[k], (tr as Record<string, unknown>)[k]);
  return out as T;
};

export const pluginsPage = localized({ de, en }, (l) => merge(en, (bundles[l] as unknown as Record<string, unknown> | undefined)?.plugins));
