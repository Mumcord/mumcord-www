// Picks the download for the visitor's system: OS from the user agent (or Client Hints),
// processor from Client Hints or the WebGL renderer, Linux distro from the user agent.
// Everything is a guess, so the other systems and files always stay one click away.

type Os = "windows" | "macos" | "linux" | "freebsd";
type Arch = "x86_64" | "arm64";

interface UaData {
  platform?: string;
  mobile?: boolean;
  getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string }>;
}

const ua = navigator.userAgent;
const uaData = (navigator as Navigator & { userAgentData?: UaData }).userAgentData;
const plat = `${uaData?.platform ?? ""} ${navigator.platform} ${ua}`;

const mobile = !!uaData?.mobile || /Android|iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
const os: Os | null = mobile
  ? null
  : /Win/i.test(plat)
    ? "windows"
    : /Mac/i.test(plat)
      ? "macos"
      : /FreeBSD/i.test(plat)
        ? "freebsd"
        : /Linux|X11|CrOS/i.test(plat)
        ? "linux"
        : null;

function glRenderer(): string {
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    const ext = gl?.getExtension("WEBGL_debug_renderer_info");
    return gl && ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
  } catch {
    return "";
  }
}

async function detectArch(): Promise<Arch | null> {
  if (/aarch64|arm64|armv8/i.test(`${navigator.platform} ${ua}`)) return "arm64";
  try {
    const v = await uaData?.getHighEntropyValues?.(["architecture"]);
    if (v?.architecture === "arm") return "arm64";
    if (v?.architecture === "x86") return "x86_64";
  } catch {
    /* hints refused */
  }
  // Every Mac browser says "Intel Mac OS X"; the GPU name tells Apple Silicon apart.
  if (os === "macos") {
    const r = glRenderer();
    if (/Apple M\d/i.test(r)) return "arm64";
    if (/Intel|AMD|Radeon|NVIDIA/i.test(r)) return "x86_64";
  }
  return null;
}

const distro = /Ubuntu|Debian|Mint|Pop!_OS|elementary/i.test(ua) ? "deb" : /Fedora|openSUSE|SUSE|Red Hat/i.test(ua) ? "rpm" : null;

function select(spot: HTMLElement, p: Os) {
  spot.dataset.os = p;
  for (const tab of spot.querySelectorAll<HTMLElement>("[data-dl-tab]")) {
    tab.setAttribute("aria-selected", String(tab.dataset.dlTab === p));
  }
  for (const d of spot.querySelectorAll<HTMLElement>("[data-dl-detected]")) {
    d.hidden = !os || d.closest<HTMLElement>("[data-for]")?.dataset.for !== os;
  }
}

function setArch(spot: HTMLElement, arch: Arch) {
  for (const box of spot.querySelectorAll<HTMLElement>(".dl-buttons")) {
    const btns = Array.from(box.querySelectorAll<HTMLElement>(".dl-btn[data-arch]"));
    const match = btns.find((b) => b.dataset.arch === arch);
    if (!match || btns.length < 2) continue;
    for (const b of btns) b.toggleAttribute("data-main", b === match);
    box.prepend(match);
    const file = box.parentElement?.querySelector<HTMLElement>("[data-dl-file]");
    if (file && match.dataset.name) file.textContent = match.dataset.name;
  }
}

const spots = document.querySelectorAll<HTMLElement>("[data-dl-spot]");
for (const spot of spots) {
  for (const tab of spot.querySelectorAll<HTMLAnchorElement>("[data-dl-tab]")) {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      select(spot, tab.dataset.dlTab as Os);
    });
  }
  const hash = location.hash.slice(1);
  // FreeBSD has a tab only when the release ships its package; without one its visitors start on Linux.
  const has = (p: string) => !!spot.querySelector(`[data-dl-tab="${p}"]`);
  const wanted = has(hash) ? hash : os && has(os) ? os : os === "freebsd" ? "linux" : "windows";
  select(spot, wanted as Os);
  if (mobile) spot.querySelector<HTMLElement>("[data-dl-mobile]")!.hidden = false;
  if (distro) spot.querySelectorAll(`[data-for="linux"] .dl-alts li[data-kind="${distro}"]`).forEach((li) => li.classList.add("is-rec"));
}

// The full file list: the visitor's system first and highlighted.
if (os) {
  const card = document.querySelector<HTMLElement>(`[data-file-card="${os}"]`);
  if (card) {
    card.classList.add("is-mine");
    card.parentElement?.prepend(card);
  }
}

if (os) {
  detectArch().then((arch) => {
    if (!arch) return;
    for (const spot of spots) {
      setArch(spot, arch);
      // A Linux package for the other processor is never the recommended one.
      spot.querySelectorAll<HTMLElement>(".dl-alts li.is-rec").forEach((li) => {
        if (li.dataset.arch !== arch) li.classList.remove("is-rec");
      });
    }
    // Highlight the visitor's row in the full file table too.
    document.querySelectorAll<HTMLElement>(`[data-file-os="${os}"][data-file-arch="${arch}"], [data-file-os="${os}"][data-file-arch="universal"]`).forEach((r) => r.classList.add("is-mine"));
  });
}
