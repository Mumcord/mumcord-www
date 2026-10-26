// All page motion in one place. Everything degrades to a static page without JS,
// and reduced-motion users get the content without the choreography.

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.add("js");

// ── Reveal on scroll, staggered per parent ───────────────────────────
const revealables = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
const siblingIndex = new Map<Element, number>();
for (const el of revealables) {
  const parent = el.parentElement!;
  const i = siblingIndex.get(parent) ?? 0;
  siblingIndex.set(parent, i + 1);
  el.style.setProperty("--d", `${Math.min(i, 6) * 0.08}s`);
}
if (reduced) {
  revealables.forEach((el) => el.classList.add("is-in"));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  revealables.forEach((el) => io.observe(el));
}

// ── Header: glass once scrolled, mobile menu ─────────────────────────
const header = document.querySelector<HTMLElement>("[data-header]");
const nav = document.getElementById("site-nav");
const toggle = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
const setMenu = (open: boolean) => {
  toggle?.setAttribute("aria-expanded", String(open));
  nav?.classList.toggle("is-open", open);
};
toggle?.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
nav?.addEventListener("click", (e) => {
  if ((e.target as HTMLElement).closest("a")) setMenu(false);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenu(false);
});

// ── Header menus: hover opens them for mice (CSS), click or Enter everywhere ──
const menus = [...document.querySelectorAll<HTMLElement>("[data-menu]")];
const setOpen = (item: HTMLElement, open: boolean) => {
  item.classList.toggle("is-open", open);
  item.querySelector("button")?.setAttribute("aria-expanded", String(open));
};
for (const item of menus) {
  const button = item.querySelector("button");
  button?.addEventListener("click", () => {
    const open = !item.classList.contains("is-open");
    menus.forEach((m) => m !== item && setOpen(m, false));
    item.classList.remove("is-closed");
    setOpen(item, open);
  });
  item.addEventListener("focusout", (e) => {
    if (!item.contains(e.relatedTarget as Node | null)) setOpen(item, false);
  });
  item.addEventListener("pointerleave", () => item.classList.remove("is-closed"));
}
document.addEventListener("click", (e) => {
  menus.forEach((m) => !m.contains(e.target as Node) && setOpen(m, false));
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const open = menus.find((m) => m.classList.contains("is-open") || m.matches(":hover"));
  if (!open) return;
  setOpen(open, false);
  open.classList.add("is-closed");
  open.querySelector("button")?.focus();
});

// ── Hero window: tilted at rest, flattens as you scroll into it ──────
const tilt = document.querySelector<HTMLElement>("[data-tilt]");
let ticking = false;
let lastTilt = -1;
const onScroll = () => {
  ticking = false;
  header?.classList.toggle("is-scrolled", scrollY > 8);
  if (tilt && !reduced) {
    // Set the transform itself, not inherited custom properties: those restyle the whole window
    // subtree on every scrolled frame. Past the end of the tilt nothing changes any more.
    const p = Math.min(1, Math.max(0, scrollY / (innerHeight * 0.6)));
    if (p !== lastTilt) {
      lastTilt = p;
      tilt.style.transform = `rotateX(${(14 * (1 - p)).toFixed(2)}deg) scale(${(0.94 + 0.06 * p).toFixed(3)})`;
    }
  }
};
addEventListener("scroll", () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(onScroll);
  }
}, { passive: true });
onScroll();

// ── Push-to-talk demo ────────────────────────────────────────────────
const ptt = document.querySelector<HTMLElement>("[data-ptt]");
if (ptt) {
  const key = ptt.querySelector<HTMLButtonElement>("[data-ptt-key]")!;
  const bars = Array.from(ptt.querySelectorAll<HTMLElement>(".ptt-wave i"));
  const idle = ptt.querySelector<HTMLElement>("[data-ptt-idle]")!;
  const live = ptt.querySelector<HTMLElement>("[data-ptt-live]")!;
  let on = false;
  let level = 0;
  let raf = 0;
  let t = 0;
  let inView = false;

  const frame = () => {
    t += 1;
    level += ((on ? 1 : 0) - level) * 0.12;
    // A fake voice: a slow syllable envelope times per-bar jitter, centred.
    const syllable = 0.55 + 0.45 * Math.abs(Math.sin(t * 0.07) * Math.sin(t * 0.023 + 1));
    bars.forEach((b, i) => {
      const centre = 1 - Math.abs(i - bars.length / 2) / (bars.length / 2);
      const a = 0.04 + level * syllable * (0.25 + 0.75 * centre) * (0.45 + Math.random() * 0.55);
      b.style.setProperty("--a", a.toFixed(3));
    });
    ptt.style.setProperty("--live-amt", level.toFixed(3));
    if (on || level > 0.01) raf = requestAnimationFrame(frame);
    else raf = 0;
  };
  const set = (value: boolean) => {
    if (on === value) return;
    on = value;
    ptt.classList.toggle("is-live", on);
    idle.hidden = on;
    live.hidden = !on;
    if (!raf) raf = requestAnimationFrame(frame);
  };

  key.addEventListener("pointerdown", (e) => {
    key.setPointerCapture(e.pointerId);
    set(true);
  });
  key.addEventListener("pointerup", () => set(false));
  key.addEventListener("pointercancel", () => set(false));
  key.addEventListener("contextmenu", (e) => e.preventDefault());

  // Holding space anywhere works while the demo is on screen; typing in a field never triggers it.
  new IntersectionObserver(([e]) => (inView = e.isIntersecting), { threshold: 0.5 }).observe(ptt);
  const typing = (el: EventTarget | null) =>
    el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
  addEventListener("keydown", (e) => {
    if (e.code !== "Space" || typing(e.target)) return;
    if (!inView && document.activeElement !== key) return;
    e.preventDefault();
    set(true);
  });
  addEventListener("keyup", (e) => {
    if (e.code === "Space") set(false);
  });
  addEventListener("blur", () => set(false));
}

// ── Follow demo: unread badge ticks up, toast slides in ──────────────
const follow = document.querySelector<HTMLElement>("[data-follow-demo]");
if (follow && !reduced) {
  const badge = follow.querySelector<HTMLElement>("[data-badge]")!;
  const toast = follow.querySelector<HTMLElement>("[data-toast]")!;
  let count = 3;
  let timer = 0;
  const tick = () => {
    count = count >= 9 ? 1 : count + 1;
    badge.textContent = String(count);
    badge.classList.remove("bump");
    void badge.offsetWidth;
    badge.classList.add("bump");
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1800);
  };
  new IntersectionObserver(([e]) => {
    clearInterval(timer);
    if (e.isIntersecting) timer = window.setInterval(tick, 2600);
  }).observe(follow);
}

// ── Fingerprint: scramble into place once ────────────────────────────
const fp = document.querySelector<HTMLElement>("[data-scramble]");
if (fp && !reduced) {
  const target = fp.dataset.scramble!;
  const hex = "0123456789ABCDEF";
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    let frame = 0;
    const run = () => {
      frame += 1;
      const settled = Math.floor(frame / 1.6);
      fp.textContent = Array.from(target, (c, i) =>
        c === ":" || i < settled ? c : hex[Math.floor(Math.random() * 16)],
      ).join("");
      if (settled < target.length) requestAnimationFrame(run);
    };
    run();
  }, { threshold: 0.6 });
  io.observe(fp);
}

// ── mumble:// link typing ────────────────────────────────────────────
const typed = document.querySelector<HTMLElement>("[data-type]");
if (typed) {
  const text = typed.dataset.type!;
  if (reduced) typed.textContent = text;
  else {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      let i = 0;
      const step = () => {
        typed.textContent = text.slice(0, ++i);
        if (i < text.length) setTimeout(step, 28 + Math.random() * 60);
      };
      step();
    }, { threshold: 0.8 });
    io.observe(typed);
  }
}

// ── Diagram: stop SMIL packets for reduced motion ────────────────────
if (reduced) document.querySelectorAll<SVGSVGElement>("svg.dg").forEach((s) => s.pauseAnimations());

// ── Gallery buttons ──────────────────────────────────────────────────
const strip = document.querySelector<HTMLElement>("[data-gallery]");
const scrollStrip = (dir: number) => {
  if (!strip) return;
  const card = strip.querySelector("li");
  const w = card ? card.getBoundingClientRect().width + 20 : 400;
  strip.scrollBy({ left: dir * w, behavior: reduced ? "auto" : "smooth" });
};
document.querySelector("[data-gallery-prev]")?.addEventListener("click", () => scrollStrip(-1));
document.querySelector("[data-gallery-next]")?.addEventListener("click", () => scrollStrip(1));

// ── Highlight the visitor's platform in the download section ─────────
const ua = navigator.userAgent;
const mine = /Windows/.test(ua) ? "windows" : /Mac OS X|Macintosh/.test(ua) && !/iPhone|iPad/.test(ua) ? "macos" : /Linux|X11/.test(ua) && !/Android/.test(ua) ? "linux" : null;
if (mine) document.querySelector(`[data-platform="${mine}"]`)?.classList.add("is-mine");

// ── Screenshot lightbox (features page) ──────────────────────────────
const lightbox = document.querySelector<HTMLDialogElement>("[data-lightbox-dialog]");
const shots = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-lightbox]"));
if (lightbox && shots.length) {
  const img = lightbox.querySelector<HTMLImageElement>("[data-lightbox-img]")!;
  const caption = lightbox.querySelector<HTMLElement>("[data-lightbox-caption]")!;
  let current = 0;
  const show = (i: number) => {
    current = (i + shots.length) % shots.length;
    const a = shots[current];
    img.src = a.href;
    img.alt = a.dataset.alt ?? "";
    caption.textContent = a.dataset.caption ?? "";
  };
  for (const [i, a] of shots.entries()) {
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      show(i);
      lightbox.showModal();
    });
  }
  lightbox.querySelector("[data-lightbox-close]")?.addEventListener("click", () => lightbox.close());
  lightbox.querySelector("[data-lightbox-prev]")?.addEventListener("click", () => show(current - 1));
  lightbox.querySelector("[data-lightbox-next]")?.addEventListener("click", () => show(current + 1));
  // A click on the picture or the dark area around it closes, like most image viewers.
  lightbox.addEventListener("click", (e) => {
    if (!(e.target as Element).closest(".lb-btn")) lightbox.close();
  });
  lightbox.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
  lightbox.addEventListener("close", () => shots[current].focus());
}

// ── Feature filter (features page) ───────────────────────────────────
const filterBar = document.querySelector<HTMLElement>("[data-filter-bar]");
if (filterBar) {
  const buttons = Array.from(filterBar.querySelectorAll<HTMLButtonElement>("[data-filter]"));
  const features = Array.from(document.querySelectorAll<HTMLElement>("[data-feature]"));
  const groups = Array.from(document.querySelectorAll<HTMLElement>("[data-feature-group]"));
  const empty = document.querySelector<HTMLElement>("[data-filter-empty]");
  const apply = (filter: string) => {
    for (const b of buttons) b.setAttribute("aria-pressed", String(b.dataset.filter === filter));
    for (const el of features) {
      const match =
        filter === "all" ||
        (filter === "beta" && el.hasAttribute("data-beta")) ||
        (filter.startsWith("v") && el.dataset.since === filter.slice(1));
      el.hidden = !match;
      // Filtered rows must show at once, not wait for the scroll reveal.
      if (match) el.classList.add("is-in");
    }
    for (const g of groups) g.hidden = !g.querySelector("[data-feature]:not([hidden])");
    if (empty) empty.hidden = features.some((el) => !el.hidden);
  };
  for (const b of buttons) b.addEventListener("click", () => apply(b.dataset.filter ?? "all"));
}

// ── Cards: a soft light follows the pointer ──────────────────────────
for (const card of document.querySelectorAll<HTMLElement>("[data-spot]")) {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
}

// ── Features page: mark the section you are in ───────────────────────
const tocLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-toc] a"));
if (tocLinks.length && "IntersectionObserver" in window) {
  const byId = new Map(tocLinks.map((a) => [a.hash.slice(1), a]));
  const spy = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        for (const a of tocLinks) a.classList.toggle("is-active", a === byId.get(e.target.id));
        // Keep the active link visible in the bar on narrow screens, without moving the page.
        const link = byId.get(e.target.id);
        const bar = link?.parentElement;
        if (link && bar) bar.scrollTo({ left: link.offsetLeft - bar.clientWidth / 2 + link.clientWidth / 2, behavior: "smooth" });
      }
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  for (const id of byId.keys()) {
    const el = document.getElementById(id);
    if (el) spy.observe(el);
  }
}

// ── Home theme tour: scrolling through the section flips the stack ───
const tourEl = document.querySelector<HTMLElement>("[data-theme-tour]");
if (tourEl) {
  const count = Number(getComputedStyle(tourEl).getPropertyValue("--n")) || 1;
  const names = [...tourEl.querySelectorAll<HTMLElement>("[data-tour-name]")];
  const dots = [...tourEl.querySelectorAll<HTMLElement>("[data-tour-dot]")];
  let shown = -1;
  const update = () => {
    const r = tourEl.getBoundingClientRect();
    const run = r.height - innerHeight;
    const p = run > 0 ? Math.min(1, Math.max(0, -r.top / run)) * (count - 1) : 0;
    tourEl.style.setProperty("--p", p.toFixed(3));
    const active = Math.round(p);
    if (active !== shown) {
      shown = active;
      names.forEach((n, i) => n.classList.toggle("is-on", i === active));
      dots.forEach((d, i) => d.classList.toggle("is-on", i === active));
    }
  };
  let queued = false;
  addEventListener(
    "scroll",
    () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        update();
      });
    },
    { passive: true },
  );
  addEventListener("resize", update);
  update();
}

// ── Themes page: light/dark switch per card, copy the share message ──
// In this bundled file, not inline in the page: the site's CSP blocks inline scripts.
const toast = document.querySelector<HTMLElement>("[data-toast]");
let hide = 0;
const say = (text: string) => {
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add("is-on");
  clearTimeout(hide);
  hide = window.setTimeout(() => toast.classList.remove("is-on"), 2200);
};
for (const card of document.querySelectorAll<HTMLElement>("[data-theme-card]")) {
  for (const b of card.querySelectorAll<HTMLButtonElement>("[data-mode-button]")) {
    b.addEventListener("click", () => {
      card.dataset.mode = b.dataset.modeButton;
      card.querySelectorAll("[data-mode-button]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    });
  }
}
// Every copy button: copies its data-copy text, or else the code of the <figure> it sits in.
for (const b of document.querySelectorAll<HTMLButtonElement>("[data-copy]")) {
  b.addEventListener("click", async () => {
    const text = b.dataset.copy || b.closest("figure")?.querySelector("pre code")?.textContent || "";
    try {
      await navigator.clipboard.writeText(text);
      b.classList.add("is-copied");
      setTimeout(() => b.classList.remove("is-copied"), 1600);
      say(b.dataset.copied ?? "");
    } catch {
      say(b.dataset.failed ?? "");
    }
  });
}

// ── Looping animations pause while their section is off screen ───────
// Many demos loop forever (pulsing rings, spinning glows); off screen they only cost frames.
const sleeper = new IntersectionObserver(
  (entries) => {
    for (const e of entries) e.target.toggleAttribute("data-offscreen", !e.isIntersecting);
  },
  { rootMargin: "200px 0px" },
);
for (const el of document.querySelectorAll("main section, footer")) {
  if (!el.parentElement?.closest("section")) sleeper.observe(el);
}
