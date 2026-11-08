// Mimo, the mascot (src/components/Mimo.astro): eyes follow the pointer, it talks while the
// push-to-talk demo is live, and the download Mimo points at the download button.

export {};

const reduce = matchMedia("(prefers-reduced-motion: reduce)");

interface Rig {
  svg: SVGSVGElement;
  visible: boolean;
  lookAt(x: number, y: number): void;
  pointAt(x: number, y: number): void;
  setTalking(on: boolean): void;
}

function attach(svg: SVGSVGElement): Rig {
  const toLocal = (el: SVGGraphicsElement, x: number, y: number) =>
    new DOMPoint(x, y).matrixTransform(el.getScreenCTM()!.inverse());
  const eyes = Array.from(svg.querySelectorAll<SVGGElement>(".m-pupil")).map((p) => {
    const w = p.closest(".m-eye")!.querySelector<SVGEllipseElement>(".m-white")!;
    return { p, w, cx: +w.getAttribute("cx")!, cy: +w.getAttribute("cy")!, r: +(p.dataset.r ?? 3), x: 0, y: 0, tx: 0, ty: 0 };
  });
  const arm = svg.querySelector<SVGGElement>(".m-arm-point");
  let raf = 0;
  let talk = 0;
  const tick = () => {
    raf = 0;
    let moving = false;
    for (const e of eyes) {
      const k = reduce.matches ? 1 : 0.25;
      e.x += (e.tx - e.x) * k;
      e.y += (e.ty - e.y) * k;
      if (Math.abs(e.tx - e.x) + Math.abs(e.ty - e.y) > 0.02) moving = true;
      e.p.setAttribute("transform", `translate(${e.x.toFixed(2)} ${e.y.toFixed(2)})`);
    }
    if (moving) raf = requestAnimationFrame(tick);
  };
  return {
    svg,
    visible: true,
    lookAt(x, y) {
      for (const e of eyes) {
        const l = toLocal(e.w, x, y);
        const dx = l.x - e.cx;
        const dy = l.y - e.cy;
        const d = Math.hypot(dx, dy) || 1;
        const s = Math.min(1, d / 40) * e.r;
        e.tx = (dx / d) * s;
        e.ty = (dy / d) * s;
      }
      if (!raf) raf = requestAnimationFrame(tick);
    },
    pointAt(x, y) {
      if (!arm) return;
      const ox = +arm.dataset.ox!;
      const oy = +arm.dataset.oy!;
      const l = toLocal(arm.parentNode as SVGGraphicsElement, x, y);
      let a = (Math.atan2(l.y - oy, l.x - ox) * 180) / Math.PI - 180;
      a = ((a + 540) % 360) - 180;
      a = Math.max(-55, Math.min(55, a));
      arm.setAttribute("transform", `rotate(${a.toFixed(1)} ${ox} ${oy})`);
    },
    setTalking(on) {
      svg.classList.toggle("is-talking", on);
      svg.parentElement?.classList.toggle("is-talking", on);
      clearInterval(talk);
      if (!on) return;
      if (reduce.matches) {
        svg.style.setProperty("--amp", "0.8");
        return;
      }
      let t = 0;
      talk = window.setInterval(() => {
        t += 1;
        const syllable = Math.abs(Math.sin(t * 0.9)) * 0.7 + Math.random() * 0.3;
        svg.style.setProperty("--amp", (0.25 + syllable * 0.75).toFixed(2));
      }, 90);
    },
  };
}

const rigs = Array.from(document.querySelectorAll<HTMLElement>("[data-mimo]")).map((host) => {
  const rig = attach(host.querySelector("svg")!);
  const role = host.dataset.mimo;
  if (role === "ptt") {
    // Talks exactly while the push-to-talk demo is live.
    const demo = host.closest<HTMLElement>("[data-ptt]");
    if (demo) new MutationObserver(() => rig.setTalking(demo.classList.contains("is-live"))).observe(demo, { attributes: true, attributeFilter: ["class"] });
  }
  if (role === "hero") {
    // Now and then Mimo says something: a few seconds of talking, then a pause.
    const talk = () => {
      if (rig.visible && !reduce.matches && !document.hidden) {
        rig.setTalking(true);
        setTimeout(() => rig.setTalking(false), 2200 + Math.random() * 1600);
      }
      setTimeout(talk, 6000 + Math.random() * 5000);
    };
    setTimeout(talk, 1800);
  }
  if (role === "download") {
    // Points at its target (the download button next to it) and keeps pointing there.
    rig.svg.classList.add("is-pointing");
    const aim = () => {
      const btn = document.querySelector<HTMLElement>("[data-mimo-target]") ?? document.querySelector<HTMLElement>(".dl-btn[data-main]");
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      rig.pointAt(r.left + r.width / 2, r.top + r.height / 2);
    };
    addEventListener("scroll", aim, { passive: true });
    addEventListener("resize", aim);
    document.querySelectorAll("[data-dl-tab]").forEach((t) => t.addEventListener("click", () => requestAnimationFrame(aim)));
    aim();
  }
  return rig;
});

if (rigs.length) {
  // Only Mimos on screen follow the pointer, so a long page stays cheap.
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      const r = rigs.find((g) => g.svg === en.target);
      if (r) r.visible = en.isIntersecting;
    }
  });
  rigs.forEach((r) => io.observe(r.svg));
  addEventListener(
    "pointermove",
    (e) => {
      for (const r of rigs) if (r.visible) r.lookAt(e.clientX, e.clientY);
    },
    { passive: true },
  );
}
