/*
 * 滚动动效（纯原生 JS，不依赖任何库）
 *
 * 做了这些事：
 *  - 顶部进度条
 *  - 元素滚动到时飞入；价格数字从 0 跳到目标值
 *  - 不同区块背景色慢慢渐变（看 style.css 里的 data-tone 颜色）
 *  - 开头大字逐字掉落，往下滚时放大淡出；星星、色块视差移动
 *  - 区块背后的空心英文横向漂移
 *  - 字幕条跟着滚动方向走，滚得越快跑得越快、越歪
 *  - 一条贯穿全站的 SVG 线，随滚动一笔一笔画出来
 *  - 电脑上「软件」区变成横向长廊：竖着滚，卡片横着走
 *
 * 想关掉某个效果，删掉 refresh() 里对应那一行即可。
 */
(function () {
  "use strict";

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const root = document.documentElement;
  const main = document.querySelector("main");
  const NAV = 60;
  const SVG_NS = "http://www.w3.org/2000/svg";
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  root.classList.add("motion");

  const bar = document.createElement("div");
  bar.className = "progress";
  document.body.appendChild(bar);

  /* ---------- 大标题拆成单个字 ---------- */
  function splitTitles() {
    document.querySelectorAll(".mega[data-split]:not(.split)").forEach((el) => {
      const text = el.textContent;
      el.setAttribute("aria-label", text);
      el.innerHTML = [...text].map((c, i) =>
        `<span class="ch" aria-hidden="true" style="--i:${i}">${c === " " ? "&nbsp;" : esc(c)}</span>`).join("");
      el.classList.add("split");
    });
  }

  /* ---------- 飞入 & 数字跳动 ---------- */
  const REVEAL = ".card, .hs-panel, .sec-head, .flow li, .changelog li, .faq details, .post-body > *, .post-nav a";

  function countUp(el) {
    el.querySelectorAll("[data-count]").forEach((n) => {
      const to = +n.dataset.count;
      if (!to || n._counted) return;
      n._counted = true;
      const t0 = performance.now();
      const step = (t) => {
        const k = clamp((t - t0) / 900);
        n.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      };
      n.textContent = "0";
      requestAnimationFrame(step);
    });
  }

  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      countUp(e.target);
      revealIO.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -6% 0px", threshold: 0.1 });

  function scanReveal() {
    document.querySelectorAll(REVEAL).forEach((el) => {
      if (el.classList.contains("rv") || el.closest(".mask")) return;
      const i = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
      el.style.setProperty("--i", Math.min(i, 6));
      el.classList.add("rv");
      revealIO.observe(el);
    });
  }

  /* ---------- 背景色调 ---------- */
  const toneIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) document.body.dataset.tone = e.target.dataset.tone; });
  }, { rootMargin: "-45% 0px -45% 0px" });

  function scanTones() {
    document.querySelectorAll("[data-tone]").forEach((el) => {
      if (el._tone) return;
      el._tone = true;
      toneIO.observe(el);
    });
  }

  /* ---------- 滚动进度变量 --p ---------- */
  let pEls = [];
  const scanProgress = () => { pEls = [...document.querySelectorAll("[data-p]")]; };

  function updateProgress() {
    const vh = innerHeight;
    for (const el of pEls) {
      const r = el.getBoundingClientRect();
      let p;
      if (el.dataset.p === "out") p = clamp(-r.top / Math.max(1, r.height));
      else if (el.dataset.p === "enter") p = clamp((vh - r.top) / Math.max(1, r.height));
      else p = clamp((vh - r.top) / (vh + r.height));
      if (Math.abs((el._p ?? -1) - p) > 0.0005) {
        el._p = p;
        el.style.setProperty("--p", p.toFixed(4));
      }
    }
  }

  /* ---------- 横向长廊 ---------- */
  let galleries = [];

  function layoutGalleries() {
    galleries = [...document.querySelectorAll(".hscroll")].map((sec) => {
      const track = sec.querySelector(".hs-track");
      sec.classList.remove("pinned");
      sec.style.removeProperty("--hs-h");
      if (!track || innerWidth < 900) return null;
      sec.classList.add("pinned");
      const dist = track.scrollWidth - innerWidth;
      if (dist < 60) {
        sec.classList.remove("pinned");
        return null;
      }
      sec.style.setProperty("--hs-h", innerHeight - NAV + dist + "px");
      return { sec, track, dist };
    }).filter(Boolean);
  }

  function updateGalleries() {
    for (const g of galleries) {
      const p = clamp((NAV - g.sec.getBoundingClientRect().top) / g.dist);
      if (g._p === p) continue;
      g._p = p;
      g.track.style.setProperty("--hs-x", (-p * g.dist).toFixed(1) + "px");
      g.sec.style.setProperty("--hp", p.toFixed(4));
    }
  }

  /* ---------- 贯穿全站的 SVG 线 ---------- */
  let thread = null;

  function buildThread() {
    if (!main) return;
    let svg = main.querySelector(":scope > svg.thread");
    if (!svg) {
      svg = document.createElementNS(SVG_NS, "svg");
      svg.setAttribute("class", "thread");
      svg.setAttribute("aria-hidden", "true");
      svg.innerHTML = '<path class="th-path"/><circle class="th-dot" r="8"/>';
      main.prepend(svg);
    }
    svg.style.height = "0px";
    const W = main.clientWidth;
    const H = main.scrollHeight;
    svg.style.height = H + "px";
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

    const start = Math.min(innerHeight * 0.8, H);
    const amp = W * (W < 700 ? 0.4 : 0.44);
    const cx = W / 2;
    const seg = W < 700 ? 560 : 760;
    let side = 1;
    let y = start;
    let d = `M ${cx + amp} ${y}`;
    while (y < H - 60) {
      const ny = Math.min(H - 60, y + seg);
      const fromX = cx + amp * side;
      side = -side;
      const toX = cx + amp * side;
      d += ` C ${fromX} ${y + (ny - y) * 0.55}, ${toX} ${ny - (ny - y) * 0.55}, ${toX} ${ny}`;
      y = ny;
    }
    const path = svg.querySelector("path");
    const dot = svg.querySelector("circle");
    path.setAttribute("d", d);
    const L = path.getTotalLength();
    path.style.strokeDasharray = L;
    const samples = [];
    for (let k = 0; k <= 300; k++) {
      const pt = path.getPointAtLength((L * k) / 300);
      samples.push([(L * k) / 300, pt.x, pt.y]);
    }
    thread = { path, dot, L, samples, top: main.getBoundingClientRect().top + scrollY, _len: -1 };
  }

  function updateThread() {
    if (!thread) return;
    const target = scrollY + innerHeight * 0.62 - thread.top;
    const s = thread.samples;
    let len, x, y;
    if (target <= s[0][2]) {
      len = 0; x = s[0][1]; y = s[0][2];
    } else if (target >= s[s.length - 1][2]) {
      [len, x, y] = s[s.length - 1];
    } else {
      let lo = 0, hi = s.length - 1;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (s[mid][2] < target) lo = mid; else hi = mid;
      }
      const a = s[lo], b = s[hi];
      const k = (target - a[2]) / Math.max(1e-6, b[2] - a[2]);
      len = a[0] + (b[0] - a[0]) * k;
      x = a[1] + (b[1] - a[1]) * k;
      y = target;
    }
    if (Math.abs(len - thread._len) < 0.5) return;
    thread._len = len;
    thread.path.style.strokeDashoffset = thread.L - len;
    thread.dot.setAttribute("cx", x.toFixed(1));
    thread.dot.setAttribute("cy", y.toFixed(1));
    thread.dot.style.opacity = len > 1 ? 1 : 0;
  }

  /* ---------- 主循环：速度、字幕、进度 ---------- */
  let tracks = [];
  let lastY = scrollY;
  let v = 0;
  let dir = 1;
  let lastV = null;

  function frame() {
    const y = scrollY;
    const dy = y - lastY;
    lastY = y;
    v += (dy - v) * 0.18;
    if (Math.abs(dy) > 0.5) dir = dy > 0 ? 1 : -1;
    const vn = clamp(v / 45, -1, 1);
    const vr = Math.abs(vn) < 0.005 ? 0 : +vn.toFixed(3);
    if (vr !== lastV) {
      lastV = vr;
      root.style.setProperty("--v", vr);
    }

    for (const t of tracks) {
      const half = t.scrollWidth / 2;
      if (!half) continue;
      let x = (t._x || 0) - (0.7 + Math.abs(v) * 0.4) * dir;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      t._x = x;
      t.style.transform = `translate3d(${x.toFixed(1)}px,0,0) skewX(${(vn * -14).toFixed(2)}deg)`;
    }

    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? clamp(y / max) : 0})`;

    updateProgress();
    updateGalleries();
    updateThread();
    requestAnimationFrame(frame);
  }

  /* ---------- 初始化 & 页面内容变化时重新扫描 ---------- */
  function relayout() {
    layoutGalleries();
    buildThread();
  }

  function refresh() {
    splitTitles();
    scanReveal();
    scanTones();
    scanProgress();
    tracks = [...document.querySelectorAll(".marquee .track")];
    relayout();
  }

  const debounce = (fn, ms) => {
    let t;
    return () => { clearTimeout(t); t = setTimeout(fn, ms); };
  };

  const refreshSoon = debounce(refresh, 80);
  const relayoutSoon = debounce(relayout, 120);

  new MutationObserver((muts) => {
    const real = muts.some((m) => [...m.addedNodes].some((n) =>
      n.nodeType === 1 && !(n.classList && (n.classList.contains("ch") || n.classList.contains("thread")))));
    if (real) refreshSoon();
  }).observe(main || document.body, { childList: true, subtree: true });

  if (main && "ResizeObserver" in window) new ResizeObserver(relayoutSoon).observe(main);
  addEventListener("resize", relayoutSoon);
  if (document.fonts) document.fonts.ready.then(relayout);

  refresh();
  requestAnimationFrame(frame);
})();
