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

// ── Hero window: tilted at rest, flattens as you scroll into it ──────
const tilt = document.querySelector<HTMLElement>("[data-tilt]");
let ticking = false;
const onScroll = () => {
  ticking = false;
  header?.classList.toggle("is-scrolled", scrollY > 8);
  if (tilt && !reduced) {
    const p = Math.min(1, Math.max(0, scrollY / (innerHeight * 0.6)));
    tilt.style.setProperty("--tilt", `${(14 * (1 - p)).toFixed(2)}deg`);
    tilt.style.setProperty("--tilt-scale", (0.94 + 0.06 * p).toFixed(3));
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

// ── Copy buttons on code blocks (server guide) ───────────────────────
for (const btn of document.querySelectorAll<HTMLButtonElement>("[data-copy]")) {
  const label = btn.textContent;
  btn.addEventListener("click", async () => {
    const code = btn.closest("figure")?.querySelector("code")?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      return;
    }
    btn.textContent = btn.dataset.copied ?? label;
    btn.classList.add("is-done");
    setTimeout(() => {
      btn.textContent = label;
      btn.classList.remove("is-done");
    }, 1600);
  });
}
