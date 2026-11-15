// Mumcord's own signed package repository at packages.mumcord.app (Mumcord/mumcord#620).
// Every command is copied from docs/package-repository.md in Mumcord/mumcord; never write new ones here.
import { localized } from "../i18n";
import { bundles } from "../i18n/locales";
import { REPO_URL } from "./release";

export const PACKAGES_URL = "https://packages.mumcord.app";
export const FREEBSD_INSTALL_COMMAND = `fetch -qo - ${REPO_URL}/releases/latest/download/install.sh | sh`;

export type RepoSystem = "apt" | "dnf" | "zypper" | "pacman" | "pkg";
export const REPO_SYSTEMS: RepoSystem[] = ["apt", "dnf", "zypper", "pacman", "pkg"];

export const SIGNING_KEY = {
  name: "Mumcord Package Signing <packages@mumcord.app>",
  fingerprint: "A409 6249 A499 587C 9AEF  13E7 F022 C81D 47D2 BBEB",
  validUntil: "2031-11-15",
  url: `${PACKAGES_URL}/mumcord.asc`,
  freebsdUrl: `${PACKAGES_URL}/mumcord.pub`,
  freebsdSha256: "9c03cc83f882d84192c8489d070c519ac2ec190c7eb61a53161913d330aeafa6",
};

/** The steps per system: code blocks in order, each with an optional file caption. */
export const REPO_STEPS: Record<RepoSystem, { file: string; code: string }[]> = {
  apt: [
    {
      file: "Terminal",
      code: `sudo install -d -m 0755 /etc/apt/keyrings
sudo curl -fsSLo /etc/apt/keyrings/mumcord.asc https://packages.mumcord.app/mumcord.asc
sudo curl -fsSLo /etc/apt/sources.list.d/mumcord.sources https://packages.mumcord.app/mumcord.sources
sudo apt update
sudo apt install mumcord`,
    },
  ],
  dnf: [
    {
      file: "Terminal",
      code: `sudo rpm --import https://packages.mumcord.app/mumcord.asc
sudo curl -fsSLo /etc/yum.repos.d/mumcord.repo https://packages.mumcord.app/mumcord.repo
sudo dnf install mumcord`,
    },
  ],
  zypper: [
    {
      file: "Terminal",
      code: `sudo rpm --import https://packages.mumcord.app/mumcord.asc
sudo zypper addrepo https://packages.mumcord.app/mumcord.repo
sudo zypper refresh
sudo zypper install mumcord`,
    },
  ],
  pacman: [
    {
      file: "Terminal",
      code: `curl -fsSLO https://packages.mumcord.app/mumcord.asc
sudo pacman-key --add mumcord.asc
sudo pacman-key --lsign-key A4096249A499587C9AEF13E7F022C81D47D2BBEB`,
    },
    { file: "/etc/pacman.conf", code: "[mumcord]\nServer = https://packages.mumcord.app/arch/$arch" },
    { file: "Terminal", code: "sudo pacman -Syu mumcord-bin" },
  ],
  pkg: [
    {
      file: "Terminal",
      code: `mkdir -p /usr/local/etc/pkg/keys /usr/local/etc/pkg/repos
fetch -o /usr/local/etc/pkg/keys/mumcord.pub https://packages.mumcord.app/mumcord.pub
fetch -o /usr/local/etc/pkg/repos/mumcord.conf https://packages.mumcord.app/mumcord.conf
pkg update
pkg install mumcord`,
    },
  ],
};

/** Removing the repository again, per system. pacman's first step is a hand edit (text only). */
export const REPO_REMOVE: Record<RepoSystem, string> = {
  apt: "sudo rm /etc/apt/sources.list.d/mumcord.sources /etc/apt/keyrings/mumcord.asc",
  dnf: "sudo rm /etc/yum.repos.d/mumcord.repo",
  zypper: "sudo zypper removerepo mumcord",
  pacman: "sudo pacman-key --delete A4096249A499587C9AEF13E7F022C81D47D2BBEB",
  pkg: "rm /usr/local/etc/pkg/repos/mumcord.conf /usr/local/etc/pkg/keys/mumcord.pub",
};

export interface PackageRepoText {
  title: string;
  badge: string;
  lead: string;
  stableOnly: string;
  scriptTitle: string;
  scriptBody: string;
  linux: string;
  freebsd: string;
  manualTitle: string;
  manualBody: string;
  /** Per system: name, an optional line before the steps, and notes between or after the code blocks (by index). */
  systems: Record<RepoSystem, { name: string; before?: string; notes: string[] }>;
  keyTitle: string;
  keyName: string;
  keyFingerprint: string;
  keyValid: string;
  keyDownload: string;
  keyFreebsd: string;
  keyCheck: string;
  removeTitle: string;
  removePacman: string;
  removeScript: string;
  copy: string;
  copied: string;
  failed: string;
}

const source: Record<"de" | "en", PackageRepoText> = {
  de: {
    title: "Paketquelle",
    badge: "Empfohlen für Linux und FreeBSD",
    lead: "Einmal eingerichtet, aktualisiert sich Mumcord mit dem normalen Update deines Systems: `apt upgrade`, `dnf upgrade`, `zypper update`, `pacman -Syu` oder `pkg upgrade`.",
    stableOnly: "Die Paketquelle enthält nur stabile Versionen, immer die neueste. Release-Kandidaten landen dort nicht.",
    scriptTitle: "Am einfachsten: das Installationsskript",
    scriptBody: "Es fragt, wie du Mumcord installieren willst: über die Paketquelle (Standard), als heruntergeladenes Paket oder als AppImage, und richtet die Paketquelle für dich ein.",
    linux: "Linux",
    freebsd: "FreeBSD",
    manualTitle: "Von Hand einrichten",
    manualBody: "Dasselbe wie das Skript, Schritt für Schritt für dein System.",
    systems: {
      apt: {
        name: "Debian, Ubuntu, Linux Mint (APT)",
        notes: ["Der Schlüssel gilt nur für diese Paketquelle (`Signed-By:` in `mumcord.sources`), nicht für dein ganzes System; `apt-key` brauchst du nicht. Für amd64 und arm64."],
      },
      dnf: { name: "Fedora (DNF)", notes: ["Pakete und Metadaten der Paketquelle sind signiert (`gpgcheck=1`, `repo_gpgcheck=1`)."] },
      zypper: { name: "openSUSE (zypper)", notes: [] },
      pacman: {
        name: "Arch Linux (pacman)",
        notes: [
          "Dann das hier ans Ende von `/etc/pacman.conf`:",
          "Und installieren:",
          "Das Paket heißt wie das AUR-Paket `mumcord-bin`, eine Installation aus dem AUR wechselt beim nächsten `pacman -Syu` von selbst zur Paketquelle.",
        ],
      },
      pkg: { name: "FreeBSD 15.x (pkg)", before: "Als root:", notes: ["Die Abhängigkeiten kommen wie gewohnt aus der offiziellen FreeBSD-Paketquelle."] },
    },
    keyTitle: "Signaturschlüssel",
    keyName: "Name",
    keyFingerprint: "Fingerabdruck",
    keyValid: "Gültig bis",
    keyDownload: "Download",
    keyFreebsd: "FreeBSD (pkg) nutzt einen eigenen RSA-Schlüssel",
    keyCheck: "Vergleich den Fingerabdruck, bevor du dem Schlüssel vertraust, zum Beispiel mit `gpg --show-keys mumcord.asc`.",
    removeTitle: "Paketquelle entfernen",
    removePacman: "den Block `[mumcord]` aus `/etc/pacman.conf` löschen, dann",
    removeScript: "`install.sh --uninstall` erledigt das ebenfalls.",
    copy: "Kopieren",
    copied: "Kopiert!",
    failed: "Kopieren ging nicht. Markier den Befehl und kopier ihn von Hand.",
  },
  en: {
    title: "Package repository",
    badge: "Recommended for Linux and FreeBSD",
    lead: "Once it is added, Mumcord updates with your system's normal update tool: `apt upgrade`, `dnf upgrade`, `zypper update`, `pacman -Syu` or `pkg upgrade`.",
    stableOnly: "The repository holds stable releases only, always the newest. Release candidates are not published there.",
    scriptTitle: "The easiest way: the install script",
    scriptBody: "It asks how you want to install Mumcord: through the package repository (the default), as a downloaded package or as an AppImage, and sets up the repository for you.",
    linux: "Linux",
    freebsd: "FreeBSD",
    manualTitle: "Set it up by hand",
    manualBody: "The same as the script, step by step for your system.",
    systems: {
      apt: {
        name: "Debian, Ubuntu, Linux Mint (APT)",
        notes: ["The key is used only for this repository (`Signed-By:` in `mumcord.sources`), not for your whole system; `apt-key` is not needed. Works on amd64 and arm64."],
      },
      dnf: { name: "Fedora (DNF)", notes: ["Both the packages and the repository metadata are signed (`gpgcheck=1`, `repo_gpgcheck=1`)."] },
      zypper: { name: "openSUSE (zypper)", notes: [] },
      pacman: {
        name: "Arch Linux (pacman)",
        notes: [
          "Then add this to the end of `/etc/pacman.conf`:",
          "And install:",
          "The package has the same name as the AUR package `mumcord-bin`, so an AUR install switches to the repository by itself on the next `pacman -Syu`.",
        ],
      },
      pkg: { name: "FreeBSD 15.x (pkg)", before: "As root:", notes: ["Its dependencies come from the official FreeBSD repository as usual."] },
    },
    keyTitle: "Signing key",
    keyName: "Name",
    keyFingerprint: "Fingerprint",
    keyValid: "Valid until",
    keyDownload: "Download",
    keyFreebsd: "FreeBSD's pkg uses its own RSA key",
    keyCheck: "Compare the fingerprint before you trust the key, e.g. with `gpg --show-keys mumcord.asc`.",
    removeTitle: "Remove the repository",
    removePacman: "remove the `[mumcord]` block from `/etc/pacman.conf`, then",
    removeScript: "`install.sh --uninstall` does this for you as well.",
    copy: "Copy",
    copied: "Copied!",
    failed: "Copying didn't work. Select the command and copy it by hand.",
  },
};

/** Translations fill in per key; a missing system or note falls back to English. */
export const packageRepo = localized(source, (l) => {
  const tr = bundles[l]?.packageRepo;
  if (!tr) return source.en;
  const { systems, ...words } = tr;
  return {
    ...source.en,
    ...words,
    systems: Object.fromEntries(REPO_SYSTEMS.map((s) => [s, { ...source.en.systems[s], ...systems?.[s] }])) as PackageRepoText["systems"],
  };
});

export type PackageRepoBundle = Partial<Omit<PackageRepoText, "systems">> & {
  systems?: Partial<Record<RepoSystem, Partial<PackageRepoText["systems"][RepoSystem]>>>;
};
