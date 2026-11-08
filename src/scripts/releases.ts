// Live release data from /api/site (the crash service behind mumcord.app): releases newer than
// this build show up without a rebuild, and versions without a hand-written changelog entry get
// one written from the GitHub release notes. Every step fails quietly: the built page stays.

interface Asset { name: string; url: string; size: number; platform: string; kind: string; arch: string }
interface Release { version: string; name: string; url: string; publishedAt: string; prerelease: boolean; assets: Asset[] }
interface Entry { generated: boolean; summary?: string; groups?: { title: string; items: string[] }[]; known?: string[]; notes?: string }

export {};

const API = "/api/site";
const newer = (a: string, b: string) => a.localeCompare(b, "en", { numeric: true }) > 0;
const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(0)} MB`;

let releasesP: Promise<Release[]> | undefined;
const releases = () =>
  (releasesP ??= fetch(`${API}/releases`)
    .then((r) => (r.ok ? r.json() : { releases: [] }))
    .then((j: { releases: Release[] }) => j.releases)
    .catch(() => []));

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

// ── Changelog ────────────────────────────────────────────────────────
const cl = document.querySelector<HTMLElement>("[data-cl]");
if (cl) {
  const d = cl.dataset;
  const list = cl.querySelector<HTMLOListElement>(".cl-list")!;
  const date = (iso: string) => new Intl.DateTimeFormat(d.intl, { dateStyle: "long" }).format(new Date(iso));

  const links = (r: Release) => {
    const p = el("p", "cl-links");
    const a = el("a", "btn btn-small", d.download);
    a.href = d.downloadHref!;
    const g = el("a", "text-link", `${d.github} →`);
    g.href = r.url;
    g.rel = "noopener";
    p.append(a, " ", g);
    return p;
  };

  const fill = async (main: HTMLElement, version: string) => {
    const res = await fetch(`${API}/changelog/${encodeURIComponent(version)}?lang=${d.lang}`).catch(() => null);
    if (!res?.ok) return;
    const e = (await res.json()) as Entry;
    const keep = main.querySelector(".cl-links");
    main.replaceChildren();
    if (e.generated) {
      if (e.summary) main.append(el("p", "cl-summary", e.summary));
      for (const g of e.groups ?? []) {
        const s = el("section", "cl-group");
        const ul = el("ul");
        for (const i of g.items) ul.append(el("li", undefined, i));
        s.append(el("h2", undefined, g.title), ul);
        main.append(s);
      }
      if (e.known?.length) {
        const s = el("section", "cl-group cl-known");
        const ul = el("ul");
        for (const i of e.known) ul.append(el("li", undefined, i));
        s.append(el("h2", undefined, d.known), ul);
        main.append(s);
      }
      main.append(el("p", "cl-auto", d.autoNote));
    } else if (e.notes) {
      main.append(el("pre", "cl-notes", e.notes));
    }
    if (keep) main.append(keep);
  };

  releases().then((rs) => {
    const shown = new Set(Array.from(list.querySelectorAll<HTMLElement>("[data-version]"), (li) => li.dataset.version!));
    // Releases this build doesn't know yet go on top.
    for (const r of [...rs].reverse()) {
      if (shown.has(r.version)) continue;
      const li = el("li", "cl-entry");
      li.id = `v${r.version}`;
      li.dataset.version = r.version;
      const side = el("div", "cl-side");
      const v = el("a", "cl-version", `v${r.version}`);
      v.href = `#v${r.version}`;
      const dt = el("p", "cl-date", `${d.released} `);
      dt.append(el("time", undefined, date(r.publishedAt)));
      side.append(v, dt);
      const main = el("div", "cl-main");
      main.dataset.clAuto = r.version;
      main.append(links(r));
      li.append(side, main);
      list.prepend(li);
    }
    // Announced versions that came out since the build: date and download instead of "upcoming".
    for (const li of list.querySelectorAll<HTMLElement>("[data-cl-upcoming]")) {
      const r = rs.find((x) => x.version === li.dataset.version);
      if (!r) continue;
      const dt = li.querySelector(".cl-date");
      if (dt) {
        dt.replaceChildren(`${d.released} `, el("time", undefined, date(r.publishedAt)));
      }
      li.querySelector(".cl-links")?.replaceWith(links(r));
    }
    for (const main of list.querySelectorAll<HTMLElement>("[data-cl-auto]")) fill(main, main.dataset.clAuto!);
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  });
}

// ── Download card: a release newer than the build swaps in its files ──
const spots = document.querySelectorAll<HTMLElement>("[data-dl-spot][data-version]");
if (spots.length) {
  releases().then((rs) => {
    const r = rs[0];
    if (!r) return;
    for (const spot of spots) {
      if (!newer(r.version, spot.dataset.version!)) continue;
      spot.dataset.version = r.version;
      spot.querySelectorAll("[data-dl-ver]").forEach((n) => (n.textContent = r.version));
      for (const a of spot.querySelectorAll<HTMLAnchorElement>("[data-kind][data-arch][data-platform]")) {
        const f = r.assets.find((x) => x.platform === a.dataset.platform && x.kind === a.dataset.kind && x.arch === a.dataset.arch);
        if (!f) continue;
        a.href = f.url;
        a.dataset.name = f.name;
        const size = a.querySelector("[data-size]");
        if (size) size.textContent = mb(f.size);
      }
      spot.querySelectorAll<HTMLElement>("[data-dl-file]").forEach((p) => {
        const main = p.parentElement?.querySelector<HTMLElement>(".dl-btn[data-main]");
        if (main?.dataset.name) p.textContent = main.dataset.name;
      });
    }
  });
}
