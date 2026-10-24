import type { Dict } from "./de";

export const en: Dict = {
  lang: "en",
  locale: "en_US",
  meta: {
    title: "Mumcord — modern voice chat for any Mumble server",
    description:
      "Mumcord is a free, Discord-style desktop client for Mumble servers: follow channels, AI noise suppression, push-to-talk even on Wayland. For Linux, Windows and macOS. Open source, no telemetry.",
  },
  nav: {
    features: "Features",
    how: "How it works",
    roadmap: "Roadmap",
    download: "Download",
    docs: "Docs",
    skip: "Skip to content",
    langSwitch: "Deutsch",
    menu: "Menu",
  },
  hero: {
    kicker: "Alpha · Open source · MIT",
    titleA: "Your Mumble server.",
    titleB: "Finally cosy.",
    lead:
      "Mumcord is a Discord-style desktop client that speaks the Mumble protocol. Server bar, channels, chat and member list — on any standard Mumble server. Nothing changes on the server.",
    ctaDownload: "Download",
    ctaSource: "Source on GitHub",
    meta: "Linux · Windows · macOS",
    shotAlt: "Mumcord main window: server bar, channel tree, chat and member list (dark theme, demo data)",
    talking: "talking",
  },
  ticker: [
    "No server changes",
    "Mumble 1.4 and newer",
    "Encrypted voice",
    "No telemetry",
    "Linux X11 & Wayland",
    "Windows 10/11",
    "macOS",
    "English · Deutsch · Español",
    "WCAG 2.2 AA target",
  ],
  ptt: {
    label: "01 — Push-to-talk",
    title: "Hold the key. Start talking.",
    body:
      "Keys and mouse buttons, even while a game has focus. On Wayland through the global-shortcuts portal — or in compatibility mode, like TeamSpeak.",
    hint: "Hold space or press the key",
    idle: "Muted",
    live: "You're talking",
    keyLabel: "Space",
    note: "Just an animation. This page never touches your microphone.",
  },
  features: {
    label: "02 — What Mumcord does today",
    title: "Everything an evening session needs.",
    intro: "As of Epic 1, stage 1a — the everyday client. What's missing is listed honestly in the roadmap.",
    items: [
      {
        id: "follow",
        title: "Follow channels",
        body:
          "Read a channel's chat without joining it. Followed channels show unread messages as a badge. Single click reads, double click joins.",
      },
      {
        id: "audio",
        title: "Clean sound out of the box",
        body:
          "AI noise suppression, echo cancellation and automatic gain are on. Bitrate follows the network: down when packets drop, back up when it recovers.",
      },
      {
        id: "trust",
        title: "Certificates, made clear",
        body:
          "On first connect you see the server's fingerprint and decide. If it changes later, Mumcord stops with a clear warning.",
      },
      {
        id: "identity",
        title: "Your identity stays yours",
        body:
          "The client certificate lives in your system's secure storage. Import from the official Mumble client via PKCS#12, export any time.",
      },
      {
        id: "chat",
        title: "Chat with Markdown",
        body:
          "Bold, italic, code, links. Paste or drop images — they're scaled to the server's limit. Everything from the server is sanitized.",
      },
      {
        id: "people",
        title: "Volume per person",
        body: "0 to 200 %, local mute. Remembered by the person's certificate — even after a rename.",
      },
      {
        id: "reconnect",
        title: "Back where you were",
        body: "After a dropped connection Mumcord restores your channel, mute/deafen state and followed channels.",
      },
      {
        id: "a11y",
        title: "Built for everyone",
        body:
          "Keyboard operation, screen-reader labels, light and dark themes, system scaling. English, German and Spanish — switch without a restart.",
      },
    ],
    followDemo: {
      channel: "Raid planning",
      unread: "new",
      message: "Priya: Wednesday, 8 pm?",
      following: "Following",
    },
    noise: { before: "Without", after: "With noise suppression" },
    fingerprint: "SHA-256 fingerprint",
    trustQuestion: "Trust this server?",
    trustYes: "Trust",
    trustNo: "Cancel",
  },
  how: {
    label: "03 — Just a client",
    title: "Nothing to install on the server. Ever.",
    body:
      "Mumcord speaks the standard Mumble protocol. Your server stays as it is; friends on the official Mumble client sit in the same channel as you.",
    server: "Mumble server",
    serverSub: "murmur / mumble-server, unmodified",
    you: "You, on Mumcord",
    friend: "Friends, on Mumble",
    channelTls: "TLS · control & chat",
    channelUdp: "OCB2-AES · voice over UDP, TCP fallback",
    linkTitle: "mumble:// links open directly",
    linkBody: "Click in the browser, Mumcord starts, offers to save the server and jumps into the channel.",
    facts: [
      { k: "64738", v: "default port, nothing else" },
      { k: "1.4+", v: "full features, older servers best effort" },
      { k: "0", v: "lines of server code" },
    ],
  },
  gallery: {
    label: "04 — Take a tour",
    title: "A window that feels familiar.",
    items: [
      { src: "wizard-1-identity", caption: "Setup in about a minute: identity, microphone, talk mode." },
      { src: "wizard-2-microphone", caption: "A mic test that plays your own voice back." },
      { src: "follow-unread-badge", caption: "Followed channels with an unread badge." },
      { src: "dialog-certificate-trust", caption: "Trust on first use, with fingerprint." },
      { src: "settings-03-voice-dark", caption: "Voice activation or push-to-talk." },
      { src: "settings-02-audio-dark", caption: "Switch devices without reconnecting." },
      { src: "main-light", caption: "Light theme, fully supported." },
      { src: "settings-06-language-dark", caption: "English, German, Spanish." },
    ],
  },
  roadmap: {
    label: "05 — Where it's going",
    title: "Honestly: this is an alpha.",
    body: "The roadmap is a proposal and may change. Mobile apps and a web version are not planned. Nothing server-side will ever be required.",
    now: "now",
    steps: [
      { tag: "Epic 1 · 1a", title: "Everyday client", body: "Everything on this page. Unsigned test builds.", now: true },
      { tag: "Epic 1 · 1b", title: "Positional audio & overlay", body: "Mumble Link with the official game plugins, floating overlay." },
      { tag: "Epic 2", title: "Several servers at once", body: "Read along on all of them, talk on one." },
      { tag: "Epic 3", title: "Comfort", body: "Global hotkeys, tray menu, desktop notifications, whisper, server browser." },
      { tag: "Epic 4", title: "Admin", body: "ACLs, bans, channel management." },
      { tag: "Epic 5", title: "Distribution", body: "Signed installers, auto-update, opt-in crash reports." },
    ],
  },
  download: {
    label: "06 — Get it",
    title: "Download Mumcord",
    latest: "Latest version",
    prerelease: "Pre-release",
    published: "published on",
    notes: "Release notes",
    allReleases: "All releases",
    checksums: "Verify SHA256SUMS",
    noRelease:
      "There's no official release yet. Unsigned test builds are produced on every push by GitHub Actions — log in, open the latest successful “Test builds” run and grab the artifact for your system.",
    testBuilds: "Test builds on GitHub Actions",
    howTo: "Installation guide",
    platforms: {
      windows: { name: "Windows", sub: "10 / 11 · installer (.exe)", warn: "SmartScreen warns about an unknown publisher: “More info” → “Run anyway”." },
      macos: { name: "macOS", sub: "Apple Silicon & Intel · .dmg", warn: "Gatekeeper blocks the first launch: right-click → “Open”, or allow it under Privacy & Security." },
      linux: { name: "Linux", sub: "X11 & Wayland · AppImage", warn: "chmod +x Mumcord_*.AppImage — needs WebKitGTK 4.1 and a Secret Service keyring." },
    },
    unsigned: "Builds are unsigned for now. Signed installers arrive with Epic 5.",
    source: "Rather build it yourself? Rust, Node 24, one command.",
    sourceLink: "Build guide in the wiki",
  },
  footer: {
    tagline: "Modern voice chat for Mumble servers.",
    disclaimer:
      "Mumcord is compatible with Mumble, but not affiliated with or endorsed by the Mumble project. “Mumble” is the name of that project; Mumcord does not use the Mumble logo.",
    project: "Project",
    legal: "Legal",
    source: "Source code",
    wiki: "Wiki",
    issues: "Report a bug",
    releases: "Releases",
    license: "MIT License",
    imprint: "Legal notice",
    privacy: "Privacy",
    noTracking: "This site sets no cookies and loads nothing from third parties.",
    by: "A project by",
  },
  notFound: {
    title: "Channel not found",
    body: "Nobody's here. Maybe the server was renamed — or the link never existed.",
    back: "Back to the lobby",
  },
};
