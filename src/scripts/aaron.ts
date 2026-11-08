// Aaron, the mascot (src/components/Aaron.astro): eyes follow the pointer, it talks while the
// push-to-talk demo is live, and the download Aaron points at the download button.

export {};

const reduce = matchMedia("(prefers-reduced-motion: reduce)");

interface Rig {
  svg: SVGSVGElement;
  visible: boolean;
  lookAt(x: number, y: number): void;
  pointAt(x: number, y: number): void;
  setPointing(on: boolean): void;
  setTalking(on: boolean): void;
}

// The rig from the mascot proposals: eyes, a face that turns a little, two pointing arms with
// an elbow, and a slight lean toward what Aaron points at.
function attach(svg: SVGSVGElement): Rig {
  const toLocal = (el: Element, x: number, y: number) =>
    new DOMPoint(x, y).matrixTransform((el as SVGGraphicsElement).getScreenCTM()!.inverse());
  const eyes = Array.from(svg.querySelectorAll<SVGGElement>(".m-pupil")).map((p) => {
    const w = p.closest(".m-eye")!.querySelector<SVGEllipseElement>(".m-white")!;
    return { p, w, cx: +w.getAttribute("cx")!, cy: +w.getAttribute("cy")!, r: +(p.dataset.r ?? 3), x: 0, y: 0, tx: 0, ty: 0 };
  });
  const arms = Array.from(svg.querySelectorAll<SVGGElement>(".m-arm-point"));
  const lean = svg.querySelector<SVGGElement>(".m-lean");
  const face = svg.querySelector<SVGGElement>(".m-face");
  let raf = 0;
  let talk = 0;
  let lastLook: [number, number] | null = null;
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
  const rig: Rig = {
    svg,
    visible: true,
    lookAt(x, y) {
      lastLook = [x, y];
      for (const e of eyes) {
        const l = toLocal(e.w, x, y);
        const dx = l.x - e.cx;
        const dy = l.y - e.cy;
        const d = Math.hypot(dx, dy) || 1;
        const s = Math.min(1, d / 40) * e.r;
        e.tx = (dx / d) * s;
        e.ty = (dy / d) * s;
      }
      if (face && eyes.length > 1) {
        // The face slides a little toward the gaze, which reads as the head turning.
        const k = +(face.dataset.shift ?? 0) / eyes[0].r;
        const mx = (eyes[0].tx + eyes[1].tx) / 2;
        const my = (eyes[0].ty + eyes[1].ty) / 2;
        face.style.transform = `translate(${(mx * k).toFixed(2)}px,${(my * k * 0.6).toFixed(2)}px)`;
      }
      if (!raf) raf = requestAnimationFrame(tick);
    },
    pointAt(x, y) {
      if (!arms.length) return;
      const c = toLocal(arms[0].parentNode as Element, x, y);
      // Targets on Aaron's right-hand side get the right arm.
      const right = arms.length > 1 && c.x > 100;
      svg.classList.toggle("point-r", right);
      const arm = arms.find((a) => (a.dataset.side === "r") === right) ?? arms[0];
      const ox = +arm.dataset.ox!;
      const oy = +arm.dataset.oy!;
      const up = +(arm.dataset.up ?? 55);
      const l = toLocal(arm.parentNode as Element, x, y);
      let a = (Math.atan2(l.y - oy, l.x - ox) * 180) / Math.PI - (right ? 0 : 180);
      a = ((a + 540) % 360) - 180;
      a = right ? Math.max(-up, Math.min(55, a)) : Math.max(-55, Math.min(up, a));
      let u = a;
      if (arm.dataset.ex) {
        // Steep targets: the upper arm stops rising and the forearm bends up from the elbow.
        const s = right ? -1 : 1;
        u = s * Math.min(s * a, 6);
        arm.querySelectorAll<SVGGElement>(".m-forearm").forEach((g) => {
          g.style.transformOrigin = `${arm.dataset.ex}px ${arm.dataset.ey}px`;
          g.style.transform = `rotate(${(a - u).toFixed(1)}deg)`;
        });
      }
      arm.style.transformOrigin = `${ox}px ${oy}px`;
      arm.style.transform = `rotate(${u.toFixed(1)}deg)`;
      if (lean) {
        const d = Math.hypot(l.x - ox, l.y - oy) || 1;
        lean.style.transformOrigin = `${lean.dataset.fx}px ${lean.dataset.fy}px`;
        lean.style.transform = svg.classList.contains("is-pointing") ? `rotate(${((6 * (l.x - ox)) / d).toFixed(2)}deg)` : "";
      }
    },
    setPointing(on) {
      svg.classList.toggle("is-pointing", on);
      if (!on && lean) lean.style.transform = "";
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
  return rig;
}

const centre = (el: Element) => {
  const r = el.getBoundingClientRect();
  return [r.left + r.width / 2, r.top + r.height / 2] as const;
};

const rigs = Array.from(document.querySelectorAll<HTMLElement>("[data-aaron]")).map((host) => {
  const rig = attach(host.querySelector("svg")!);
  const role = host.dataset.aaron;
  if (role === "ptt") {
    // Talks exactly while the push-to-talk demo is live.
    const demo = host.closest<HTMLElement>("[data-ptt]");
    if (demo) new MutationObserver(() => rig.setTalking(demo.classList.contains("is-live"))).observe(demo, { attributes: true, attributeFilter: ["class"] });
  }
  if (role === "hero") {
    // Now and then Aaron says something, and every other time points at the download button.
    const target = document.querySelector("[data-aaron-hero-target]");
    let n = 0;
    const talk = () => {
      if (rig.visible && !reduce.matches && !document.hidden) {
        const point = !!target && n++ % 2 === 0;
        rig.setTalking(true);
        if (point) {
          rig.setPointing(true);
          rig.pointAt(...centre(target!));
        }
        setTimeout(() => {
          rig.setTalking(false);
          rig.setPointing(false);
        }, 2200 + Math.random() * 1600);
      }
      setTimeout(talk, 6000 + Math.random() * 5000);
    };
    setTimeout(talk, 1800);
  }
  if (role === "download") {
    // Points at its target (the download button next to it) and keeps pointing there.
    rig.setPointing(true);
    const aim = () => {
      const btn = host.closest("section, footer")?.querySelector("[data-aaron-target]") ?? document.querySelector("[data-aaron-target]");
      if (btn) rig.pointAt(...centre(btn));
    };
    addEventListener("scroll", aim, { passive: true });
    addEventListener("resize", aim);
    document.querySelectorAll("[data-dl-tab]").forEach((t) => t.addEventListener("click", () => requestAnimationFrame(aim)));
    aim();
  }
  return rig;
});

if (rigs.length) {
  // Only Aarons on screen follow the pointer, so a long page stays cheap.
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
