import type { Dict } from "./de";

export const en: Dict = {
  lang: "en",
  locale: "en_US",
  meta: {
    title: "Mumcord — modern voice chat for any Mumble server",
    description:
      "Mumcord is a free, Discord-style desktop client for Mumble servers: follow channels, notifications, AI noise suppression, push-to-talk even on Wayland. For Linux, Windows and macOS. Open source, no telemetry.",
  },
  nav: {
    features: "Features",
    how: "How it works",
    roadmap: "Roadmap",
    download: "Download",
    docs: "Docs",
    changelog: "Changelog",
    server: "Server",
    skip: "Skip to content",
    langSwitch: "Deutsch",
    menu: "Menu",
  },
  hero: {
    kicker: "Alpha · Open source · AGPL",
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
    "Light & dark",
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
    intro: "As of version 0.2.0, with 0.3.0 completing Epic 1 soon. What's missing is listed honestly in the roadmap.",
    all: "All features with screenshots",
    items: [
      {
        id: "follow",
        title: "Follow channels",
        body:
          "Click the eye and you read along in a channel without joining it — or follow all of them from the server menu. Unread messages show up as a count, in your own channel too.",
      },
      {
        id: "audio",
        title: "Clear sound out of the box",
        body:
          "AI noise suppression, echo cancellation and automatic gain are on. The bitrate follows your network: down when packets get lost, back up when it recovers. For music there's a music quality switch with up to 510 kbit/s, and you can set the voice activation threshold by hand.",
      },
      {
        id: "trust",
        title: "Certificates, made readable",
        body:
          "On first connect you see the server's fingerprint and decide. If it changes later, Mumcord stops with a clear warning.",
      },
      {
        id: "chat",
        title: "Discord-style chat",
        body:
          "Avatars, grouped messages and Markdown with a formatting toolbar and shortcuts. @mentions with autocomplete and their own sound, code with syntax highlighting. A compact layout for busy channels; the channel description and welcome message are pinned on top.",
      },
      {
        id: "media",
        title: "Links you can see",
        body:
          "Link previews, YouTube, Twitch and Spotify cards that load only on click, and external images right in the chat, with an image viewer and zoom. GIF favorites by right-click. All of it can be switched off and never loads from local network addresses.",
      },
      {
        id: "notify",
        title: "Notifications, your way",
        body:
          "New messages as a small in-app pop-up, a system notification, both or off. Plus short, quiet sounds per event — including when you join and hang up.",
      },
      {
        id: "crowd",
        title: "Big servers stay tidy",
        body:
          "Search with Ctrl+K, jump to your channel, stacked avatars from six people on. Tested with 1000 people in 305 channels — smooth at 60 fps.",
      },
      {
        id: "people",
        title: "Right-click people",
        body:
          "Profile, mute for me, volume from 0 to 200 %, private message. Remembered by the person's certificate — even after they rename. A profile preview shows on hover.",
      },
      {
        id: "reconnect",
        title: "Back where you were",
        body:
          "After a dropout Mumcord restores your channel, mute/deafen state and followed channels. After a restart it offers to rejoin your last voice channel.",
      },
      {
        id: "identity",
        title: "Your identity stays yours",
        body:
          "The client certificate lives in your system's secure storage. Import from the official Mumble client via PKCS#12, export any time.",
      },
      {
        id: "setup",
        title: "Ready in a minute",
        body:
          "The setup wizard only asks for identity, microphone and talk mode. If you like, Mumcord opens mumble:// links and starts when you log in.",
      },
      {
        id: "a11y",
        title: "Built for everyone",
        body:
          "Keyboard operation, screen-reader labels, light and dark themes, system scaling. From 0.3.0 all 24 official EU languages, switch without a restart.",
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
      { src: "wizard-1-identity", caption: "Set up in about a minute: identity, microphone, talk mode." },
      { src: "wizard-4-talk-mode", caption: "Voice activation or push-to-talk, mumble:// links and start at login." },
      { src: "follow-unread-badge", caption: "Follow channels with the eye, unread messages as a count." },
      { src: "notification-toast", caption: "A small pop-up announces new messages from other channels." },
      { src: "chat-compact", caption: "Compact chat layout: time, name and message on one line." },
      { src: "channel-avatar-stack", caption: "Crowded channels show a stack of avatars instead of a long list." },
      { src: "person-menu", caption: "Right-click: mute, volume, private message." },
      { src: "search", caption: "Ctrl+K searches channels and people." },
      { src: "banner-rejoin", caption: "After a restart, back into your last voice channel." },
      { src: "dialog-certificate-trust", caption: "Trust on first contact, with the fingerprint." },
      { src: "settings-08-sounds-notifications-dark", caption: "Sounds and notifications, set per event." },
      { src: "settings-02-audio-dark", caption: "Switch devices without reconnecting." },
      { src: "main-light", caption: "A light theme that's fully there." },
      { src: "settings-07-language-dark", caption: "24 official EU languages, each in its own name." },
    ],
  },
  roadmap: {
    label: "05 — Where it's going",
    title: "Honestly: this is an alpha.",
    body: "The roadmap is a proposal and may change. Mobile apps and a web version are not planned. Nothing server-side will ever be required.",
    now: "now",
    all: "The full roadmap in detail",
    steps: [
      { tag: "Epic 1", title: "The everyday client", now: true, body: "Since 0.1.0 the everyday client: wizard, servers, channels, voice, chat and following. 0.2.0 brought more chat: link previews, YouTube, Twitch and Spotify cards, images with an image viewer, @mentions, GIF favorites and code highlighting. 0.3.0 completes Epic 1: positional audio (beta), an in-game overlay on Linux and a window overlay on Windows, “Now gaming”, shared chat history between Mumcord users, friends, “Join channel”, full-size images and all 24 official EU languages." },
      { tag: "Epic 2", title: "Several servers and your own themes", body: "Read along on all of them, talk on one. Plus custom themes with colours and presets, shareable as text: the chat shows a preview card, one click imports the theme." },
      { tag: "Epic 3", title: "Comfort", body: "Global hotkeys, full tray menu, import from the official client, whisper, server browser." },
      { tag: "Epic 4", title: "Admin", body: "ACLs, bans, channel management." },
      { tag: "Epic 5", title: "Distribution", body: "Signed installers, auto-update, opt-in crash reports, package listings." },
      { tag: "Epic 6", title: "GIF search", body: "Search for GIFs without shipping an API key in the app that anyone could extract. How exactly is still to be decided." },
    ],
  },
  download: {
    label: "06 — Get it",
    title: "Download Mumcord",
    latest: "Latest version",
    prerelease: "Pre-release",
    published: "published on",
    notes: "What's new",
    allReleases: "All releases",
    checksums: "Verify SHA256SUMS",
    noRelease:
      "The first release isn't published yet. Releases are built from version tags, tested on fresh machines and then appear on GitHub — this page picks them up automatically.",
    testBuilds: "Releases on GitHub",
    howTo: "Installation guide",
    platforms: {
      windows: { name: "Windows", sub: "10 / 11 · installer (.exe)", warn: "SmartScreen warns about an unknown publisher: “More info” → “Run anyway”." },
      macos: { name: "macOS", sub: "Universal, Apple Silicon & Intel · .dmg", warn: "Gatekeeper blocks the first launch: right-click → “Open”, or allow it under Privacy & Security." },
      linux: { name: "Linux", sub: "X11 & Wayland · AppImage", warn: "chmod +x Mumcord_*.AppImage — needs WebKitGTK 4.1 and a Secret Service keyring." },
    },
    unsigned: "Builds are unsigned for now. Signing for Windows and macOS is prepared and starts once the certificates are set up.",
    source: "Rather build it yourself? Rust, Node 24, one command.",
    sourceLink: "Build guide in the wiki",
  },
  changelog: {
    title: "Changelog",
    description: "What changed in each Mumcord version — from the first alpha on.",
    label: "Versions",
    intro: "What changes for you in each version. The technical details are in the releases on GitHub.",
    released: "released",
    upcoming: "coming up",
    upcomingNote: "This version isn't published yet. Once the release appears on GitHub, the download shows up here.",
    download: "Download",
    onGithub: "Release on GitHub",
    known: "Known limitations",
    githubOnly: "For this version there are only the release notes on GitHub.",
  },
  footer: {
    tagline: "Modern voice chat for Mumble servers.",
    disclaimer:
      "Mumcord is compatible with Mumble, but not affiliated with or endorsed by the Mumble project. “Mumble” is the name of that project; Mumcord does not use the Mumble logo.",
    project: "Project",
    legal: "Legal",
    source: "Source code",
    wiki: "Wiki",
    issues: "All issues",
    releases: "Releases",
    idea: "Request a feature",
    bug: "Report a bug",
    features: "Features",
    roadmap: "Roadmap",
    changelog: "Changelog",
    server: "Host a server",
    license: "License (AGPL-3.0)",
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
