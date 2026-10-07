(function () {
  "use strict";

  const S = window.SITE || {};
  const page = document.body.dataset.page;
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // 图片加载失败时换成虚线占位框，提示该放什么图
  window.addEventListener("error", (e) => {
    const t = e.target;
    if (t && t.tagName === "IMG" && "ph" in t.dataset) {
      const d = document.createElement("div");
      d.className = t.className + " ph";
      d.textContent = t.dataset.ph;
      t.replaceWith(d);
    }
  }, true);

  const pic = (src, cls, hint) => src
    ? `<img class="${cls}" src="${esc(src)}" alt="" data-ph="${esc(hint)}">`
    : `<div class="${cls} ph">${esc(hint)}</div>`;

  const icon = (p, cls = "icon") => p.iconImg
    ? pic(p.iconImg, cls, (p.name || "?")[0])
    : `<div class="${cls}">${esc(p.icon || (p.name || "?")[0])}</div>`;

  // 价格数字包一层 data-count，滚动到时会从 0 跳到这个数
  const num = (n) => `<b data-count="${n}">${n}</b>`;
  const priceText = (pl) => (pl.price === 0 ? "免费" : `¥${num(pl.price)}`);
  const minPrice = (p) => {
    const ps = (p.plans || []).map((x) => x.price).filter((x) => x > 0);
    return ps.length ? Math.min(...ps) : null;
  };

  // 区块标题：背后一行空心大英文 + 中文标题
  const head = (ghost, title, sub = "") => `<div class="sec-head" data-p>
    <span class="ghost" aria-hidden="true">${ghost}</span>
    <h2>${title}</h2>${sub ? `<p>${esc(sub)}</p>` : ""}
  </div>`;

  const marquee = (items) => {
    if (!items || !items.length) return "";
    const row = items.map((t) => `<span>${esc(t)}</span><i>✦</i>`).join("");
    return `<div class="marquee" aria-hidden="true"><div class="track">${row}${row}${row}${row}</div></div>`;
  };

  const sticker = (status) => status
    ? `<span class="sticker ${status === "在售" ? "" : "alt"}">${esc(status)}</span>` : "";

  const posts = () => (S.posts || []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));

  /* ---------- 通用：导航、页脚、联系方式、复制 ---------- */

  function renderChrome() {
    const base = page === "home" ? "" : "index.html";
    const type = new URLSearchParams(location.search).get("type");
    const links = [
      [`${base}#products`, "软件"],
      S.showOpenSource && [`${base}#opensource`, "开源"],
      ["posts.html?type=教程", "教程", page === "posts" && type === "教程"],
      ["posts.html?type=公告", "公告", page === "posts" && type === "公告"],
      [`${base}#custom`, "定制"],
      [`${base}#contact`, "联系"],
    ].filter(Boolean);
    $("#nav").innerHTML = `<div class="wrap nav">
      <a class="brand" href="${base || "#"}">${esc(S.name)}<i>✦</i></a>
      <nav>${links.map(([h, t, on]) => `<a href="${h}" class="${on ? "on" : ""}">${t}</a>`).join("")}</nav>
    </div>`;
    $("#footer").innerHTML = `<div class="band" data-p="enter">
      <div class="wrap foot">
        <div class="foot-big" aria-hidden="true">THANK YOU ✦</div>
        <div class="foot-row">
          <span>© ${new Date().getFullYear()} ${esc(S.name)} · 一个人的软件铺子</span>
          ${S.showOpenSource && S.github ? `<a href="https://github.com/${esc(S.github)}" target="_blank" rel="noopener">GitHub ↗</a>` : ""}
        </div>
      </div>
    </div>`;
  }

  const crow = (k, v) => `<div class="crow"><span>${k}</span><b>${esc(v)}</b>
    <button class="copy" data-copy="${esc(v)}">复制</button></div>`;

  function contactHTML() {
    const c = S.contact || {};
    const rows = [];
    if (c.wechat) rows.push(crow("微信", c.wechat));
    if (c.qq) rows.push(crow("QQ", c.qq));
    if (c.qqGroup) rows.push(crow("QQ 群", c.qqGroup));
    if (c.email) rows.push(`<div class="crow"><span>邮箱</span><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></div>`);
    return `<div class="contact">
      ${c.wechatQr ? `<figure>${pic(c.wechatQr, "qr", "微信二维码\n" + c.wechatQr)}<figcaption>扫码加微信</figcaption></figure>` : ""}
      <div class="crows">${rows.join("")}</div>
    </div>`;
  }

  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1600);
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    toast("已复制 ✦");
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-copy]");
    if (b) copy(b.dataset.copy);
  });

  /* ---------- 卡片 ---------- */

  function cardHTML(p) {
    const m = minPrice(p);
    return `<a class="card pcard" href="product.html?id=${encodeURIComponent(p.id)}">
      ${sticker(p.status)}
      <div class="pc-top">${icon(p)}<h3>${esc(p.name)}</h3></div>
      <p>${esc(p.summary)}</p>
      <div class="tags">${(p.tags || []).map((t) => `<span>${esc(t)}</span>`).join("")}</div>
      <div class="pc-foot"><span class="price">${m != null ? `¥${num(m)}<small>起</small>` : "FREE"}</span><span class="go">→</span></div>
    </a>`;
  }

  function postCard(x) {
    return `<a class="card post" href="post.html?id=${encodeURIComponent(x.id)}">
      ${x.cover ? pic(x.cover, "thumb", x.cover) : ""}
      <div class="post-meta"><span class="ptype" data-type="${esc(x.type)}">${esc(x.type)}</span><time>${esc(x.date)}</time></div>
      <h3>${esc(x.title)}</h3>
      <p>${esc(x.summary)}</p>
      <span class="more">阅读全文 →</span>
    </a>`;
  }

  /* ---------- 首页 ---------- */

  function renderHome() {
    document.title = S.name || "我的小铺";
    const cu = S.custom || {};
    const sp = S.sponsor || {};
    const lab = S.lab || [];
    const products = S.products || [];
    const latest = posts().slice(0, 3);
    $("#app").innerHTML = `
    <section class="hero wrap" data-p="out" data-tone="cream">
      <i class="star s1" aria-hidden="true"></i><i class="star s2" aria-hidden="true"></i><i class="blob" aria-hidden="true"></i>
      <div class="hero-text">
        <span class="kicker">✦ INDIE SOFTWARE SHOP ✦</span>
        <h1 class="mega" data-split>${esc(S.name)}</h1>
        <p class="tagline"><span>${esc(S.tagline)}</span></p>
        <p class="intro">${esc(S.intro)}</p>
        <div class="actions">
          <a class="btn primary" href="#products">逛逛软件 →</a>
          <a class="btn" href="#custom">找我定制</a>
        </div>
      </div>
      <div class="avatar-wrap">
        <svg class="ring" viewBox="0 0 200 200" aria-hidden="true">
          <defs><path id="ring-path" d="M100,100 m-86,0 a86,86 0 1,1 172,0 a86,86 0 1,1 -172,0"/></defs>
          <text><textPath href="#ring-path" textLength="535" lengthAdjust="spacing">✦ INDIE DEV ✦ 独立开发者 ✦ MADE BY HAND ✦ 先试后买 </textPath></text>
        </svg>
        ${pic(S.avatar, "avatar", (S.name || "我")[0])}
        <span class="sticker big">NEW!!</span>
      </div>
    </section>

    ${marquee(S.marquee)}

    <section id="products" class="hscroll" data-tone="lilac">
      <div class="hs-sticky">
        <div class="wrap">${head("SHOP", "软件", "都能先免费试用，满意再买")}<div class="hs-bar"><i></i></div></div>
        <div class="hs-track">
          <div class="hs-panel hs-intro"><b>${products.length}</b><span>款软件<br>正在出摊</span><em>继续往下滚 ↓</em></div>
          ${products.map(cardHTML).join("")}
          <a class="hs-panel hs-end" href="#custom"><span>没找到想要的？</span><b>找我定制 →</b></a>
        </div>
      </div>
    </section>

    ${latest.length ? `<section id="news" class="wrap section" data-tone="butter">
      ${head("NEWS", "最新动态", "教程、更新、新软件上架")}
      <div class="grid">${latest.map(postCard).join("")}</div>
      <div class="see-all"><a class="btn" href="posts.html">全部文章 →</a></div>
    </section>` : ""}

    ${S.showOpenSource ? `<section id="opensource" class="band" data-tone="butter">
      <div class="wrap section">
        ${head("CODE", "开源", "免费拿去用，顺手点个 Star")}
        <div id="repos" class="grid"><div class="note">正在加载 GitHub 仓库…</div></div>
      </div>
    </section>` : ""}

    ${lab.length ? `<section id="lab" class="wrap section" data-tone="mint">
      ${head("LAB", "实验室", "小实验和半成品，好玩为主")}
      <div class="grid">${lab.map((x) => `<a class="card lab" href="${esc(x.link || "#")}">
        ${x.cover ? pic(x.cover, "thumb", x.cover) : ""}
        <h3>${esc(x.name)}</h3><p>${esc(x.desc)}</p></a>`).join("")}</div>
    </section>` : ""}

    <section id="custom" class="wrap section" data-tone="pink">
      ${head("CUSTOM", "定制开发", cu.intro)}
      <div class="grid services">${(cu.services || []).map((s, i) =>
        `<div class="card"><b class="num">${String(i + 1).padStart(2, "0")}</b><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p></div>`).join("")}</div>
      ${cu.steps ? `<ol class="flow">${cu.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>` : ""}
      <div class="actions"><a class="btn primary" href="#contact">聊聊你的需求 →</a></div>
    </section>

    <section id="sponsor" class="wrap section" data-tone="lilac">
      ${head("LOVE", "赞助")}
      <div class="card sponsor">
        <i class="star s3" aria-hidden="true"></i>
        <div class="sp-text">
          <p>${esc(sp.intro)}</p>
          <div class="actions">
            ${sp.afdian ? `<a class="btn primary" href="${esc(sp.afdian)}" target="_blank" rel="noopener">在爱发电赞助 ♥</a>` : ""}
            ${S.pay?.usdt?.address ? `<button class="btn" data-copy="${esc(S.pay.usdt.address)}">复制 USDT 地址（${esc(S.pay.usdt.network)}）</button>` : ""}
          </div>
        </div>
        ${sp.wechatReward ? `<figure>${pic(sp.wechatReward, "qr", "微信赞赏码\n" + sp.wechatReward)}<figcaption>微信赞赏</figcaption></figure>` : ""}
      </div>
    </section>

    <section id="contact" class="wrap section" data-tone="cream">
      ${head("HELLO", "联系我", "买软件、定制、反馈问题都可以")}
      <div class="card">${contactHTML()}</div>
    </section>`;
    if (S.showOpenSource) loadRepos();
  }

  async function loadRepos() {
    const box = $("#repos");
    const u = S.github;
    if (!u || /your|你的/.test(u)) {
      box.innerHTML = `<div class="note">在 <code>data/site.js</code> 里填上 <code>github</code> 用户名，这里会自动显示你的开源项目。</div>`;
      return;
    }
    const key = "repos:" + u;
    let repos = null;
    try { repos = JSON.parse(sessionStorage.getItem(key)); } catch {}
    if (!repos) {
      try {
        const r = await fetch(`https://api.github.com/users/${encodeURIComponent(u)}/repos?per_page=100&sort=updated`);
        if (!r.ok) throw new Error(r.status);
        repos = await r.json();
        try { sessionStorage.setItem(key, JSON.stringify(repos)); } catch {}
      } catch {
        box.innerHTML = `<div class="note">暂时连不上 GitHub，<a href="https://github.com/${esc(u)}" target="_blank" rel="noopener">直接去我的 GitHub 主页看看 ↗</a></div>`;
        return;
      }
    }
    const hide = new Set(S.hideRepos || []);
    const pin = S.pinRepos || [];
    const rank = (r) => (pin.includes(r.name) ? pin.indexOf(r.name) : 1e6);
    const list = repos
      .filter((r) => !r.fork && !r.archived && !hide.has(r.name))
      .sort((a, b) => rank(a) - rank(b) || b.stargazers_count - a.stargazers_count)
      .slice(0, S.repoLimit || 6);
    if (!list.length) {
      box.innerHTML = `<div class="note">还没有公开的仓库。</div>`;
      return;
    }
    box.innerHTML = list.map((r) => `<a class="card repo" href="${esc(r.html_url)}" target="_blank" rel="noopener">
      <h3>${esc(r.name)}</h3><p>${esc(r.description || "暂无简介")}</p>
      <div class="meta">${r.language ? `<span>${esc(r.language)}</span>` : ""}<span>★ ${r.stargazers_count}</span><span>⑂ ${r.forks_count}</span></div>
    </a>`).join("");
  }

  /* ---------- 软件详情页 ---------- */

  function renderProduct() {
    const id = new URLSearchParams(location.search).get("id");
    const p = (S.products || []).find((x) => x.id === id);
    if (!p) {
      $("#app").innerHTML = `<section class="wrap section"><h1 class="mega">404</h1><p>没找到这个软件。</p>
        <p><a class="btn primary" href="index.html#products">← 返回全部软件</a></p></section>`;
      return;
    }
    document.title = `${p.name} · ${S.name}`;
    const media = p.bilibili
      ? `<div class="video"><iframe src="https://player.bilibili.com/player.html?bvid=${encodeURIComponent(p.bilibili)}&autoplay=0&high_quality=1" allowfullscreen loading="lazy"></iframe></div>`
      : p.cover ? pic(p.cover, "cover", "软件截图\n" + p.cover) : "";
    const plans = p.plans || [];
    const feats = (p.features || []).map((f) => (typeof f === "string" ? { title: f } : f));
    const related = posts().filter((x) => x.product === p.id);

    $("#app").innerHTML = `
    <section class="wrap phead" data-p="out" data-tone="cream">
      <i class="star s1" aria-hidden="true"></i>
      <a class="back" href="index.html#products">← 全部软件</a>
      <div class="ph-row">${icon(p, "icon lg")}${sticker(p.status)}</div>
      <h1 class="mega" data-split>${esc(p.name)}</h1>
      <p class="tagline"><span>${esc(p.summary)}</span></p>
      <div class="tags">${(p.tags || []).map((t) => `<span>${esc(t)}</span>`).join("")}</div>
      <div class="actions">
        ${plans.length ? `<a class="btn primary" href="#pricing">看价格 →</a>` : ""}
        ${(p.downloads || []).length ? `<a class="btn" href="#download">下载试用</a>` : ""}
      </div>
    </section>

    ${media ? `<section class="wrap media">${media}</section>` : ""}

    ${marquee(p.tags && p.tags.length ? p.tags.concat(feats.map((f) => f.title)) : null)}

    ${feats.length ? `<section class="wrap section" data-tone="lilac">
      ${head("WHAT", "能做什么")}
      <div class="grid feats">${feats.map((f, i) => `<div class="card"><b class="num">${String(i + 1).padStart(2, "0")}</b><h3>${esc(f.title)}</h3>${f.desc ? `<p>${esc(f.desc)}</p>` : ""}</div>`).join("")}</div>
    </section>` : ""}

    ${plans.length ? `<section id="pricing" class="wrap section" data-tone="butter">
      ${head("PRICE", "价格", "付款后发激活码，一般几分钟内回复")}
      <div class="plans">${plans.map((pl, i) => `<div class="card plan ${pl.highlight ? "hot" : ""}">
        ${pl.highlight ? `<span class="sticker big">推荐!!</span>` : ""}
        <h3>${esc(pl.name)}</h3>
        <div class="amount">${priceText(pl)}<small>${esc(pl.unit || "")}</small></div>
        <p>${esc(pl.desc)}</p>
        <button class="btn ${pl.highlight ? "primary" : ""}" data-plan="${i}">${pl.price === 0 ? "免费下载" : "立即购买 →"}</button>
      </div>`).join("")}</div>
    </section>` : ""}

    ${(p.downloads || []).length ? `<section id="download" class="wrap section" data-tone="mint">
      ${head("GET", "下载", "下载后打开软件即可开始试用")}
      <div class="actions">${p.downloads.map((d) => `<a class="btn" href="${esc(d.url)}" ${/^https?:/.test(d.url) ? 'target="_blank" rel="noopener"' : ""}>↓ ${esc(d.label)}</a>`).join("")}</div>
    </section>` : ""}

    ${related.length ? `<section class="wrap section" data-tone="mint">
      ${head("NEWS", "教程和公告")}
      <div class="grid">${related.map(postCard).join("")}</div>
    </section>` : ""}

    ${(p.changelog || []).length ? `<section class="wrap section" data-tone="cream">
      ${head("LOG", "更新日志")}
      <ul class="changelog">${p.changelog.map((c) => `<li><b>v${esc(c.version)}</b><time>${esc(c.date)}</time><span>${esc(c.notes)}</span></li>`).join("")}</ul>
    </section>` : ""}

    ${(p.faq || []).length ? `<section class="wrap section" data-tone="pink">
      ${head("FAQ", "常见问题")}
      <div class="faq">${p.faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div>
    </section>` : ""}

    <section class="wrap section" data-tone="pink">
      <div class="card cta"><div><h3>想加功能，或者需要定制？</h3><p>告诉我你的流程，我来评估。</p></div>
      <a class="btn primary" href="index.html#contact">联系我 →</a></div>
    </section>`;

    $("#app").addEventListener("click", (e) => {
      const b = e.target.closest("[data-plan]");
      if (!b) return;
      const pl = plans[+b.dataset.plan];
      if (pl.price === 0) {
        const dl = $("#download");
        if (dl) dl.scrollIntoView({ behavior: "smooth" });
      } else {
        openBuy(p, pl);
      }
    });
  }

  /* ---------- 文章列表页 ---------- */

  function renderPosts() {
    const TYPES = ["全部", "教程", "公告"];
    let type = new URLSearchParams(location.search).get("type");
    if (!TYPES.includes(type)) type = "全部";
    document.title = `教程和公告 · ${S.name}`;
    $("#app").innerHTML = `
    <section class="wrap phead" data-p="out" data-tone="cream">
      <i class="star s1" aria-hidden="true"></i>
      <span class="kicker">✦ JOURNAL ✦</span>
      <h1 class="mega" data-split>教程和公告</h1>
      <p class="tagline"><span>使用教程、版本更新、新软件上架，都写在这里</span></p>
      <div class="filters">${TYPES.map((t) => `<button data-type="${t}">${t}</button>`).join("")}</div>
    </section>
    <section class="wrap section" data-tone="lilac"><div id="post-list" class="grid"></div></section>`;

    const draw = () => {
      document.querySelectorAll(".filters button").forEach((b) => b.classList.toggle("on", b.dataset.type === type));
      document.querySelectorAll(".nav nav a").forEach((a) => a.classList.toggle("on", a.textContent === type));
      const list = posts().filter((x) => type === "全部" || x.type === type);
      $("#post-list").innerHTML = list.length
        ? list.map(postCard).join("")
        : `<div class="note">还没有${type === "全部" ? "文章" : type}。</div>`;
    };
    $(".filters").addEventListener("click", (e) => {
      const b = e.target.closest("[data-type]");
      if (!b) return;
      type = b.dataset.type;
      history.replaceState(null, "", type === "全部" ? "posts.html" : `posts.html?type=${encodeURIComponent(type)}`);
      draw();
    });
    draw();
  }

  /* ---------- 文章详情页 ---------- */

  // 极简 Markdown：标题、段落、列表、引用、代码块、图片、链接、加粗、分割线
  function md(src) {
    const lines = src.replace(/\r/g, "").split("\n");
    const inline = (s) => esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1">')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    let html = "";
    let para = [];
    let list = null;
    const flushP = () => {
      if (para.length) html += `<p>${inline(para.join(" "))}</p>`;
      para = [];
    };
    const flushL = () => {
      if (list) html += `<${list.t}>${list.items.map((x) => `<li>${inline(x)}</li>`).join("")}</${list.t}>`;
      list = null;
    };
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      let m;
      if (l.startsWith("```")) {
        flushP(); flushL();
        const buf = [];
        while (++i < lines.length && !lines[i].startsWith("```")) buf.push(lines[i]);
        html += `<pre><code>${esc(buf.join("\n"))}</code></pre>`;
      } else if (!l.trim()) {
        flushP(); flushL();
      } else if ((m = l.match(/^(#{1,3})\s+(.*)/))) {
        flushP(); flushL();
        const n = m[1].length + 1;
        html += `<h${n}>${inline(m[2])}</h${n}>`;
      } else if (/^-{3,}\s*$/.test(l)) {
        flushP(); flushL();
        html += "<hr>";
      } else if ((m = l.match(/^>\s?(.*)/))) {
        flushP(); flushL();
        html += `<blockquote>${inline(m[1])}</blockquote>`;
      } else if ((m = l.match(/^\s*([-*]|\d+\.)\s+(.*)/))) {
        flushP();
        const t = /\d/.test(m[1]) ? "ol" : "ul";
        if (!list || list.t !== t) { flushL(); list = { t, items: [] }; }
        list.items.push(m[2]);
      } else {
        flushL();
        para.push(l.trim());
      }
    }
    flushP(); flushL();
    return html;
  }

  function renderPost() {
    const id = new URLSearchParams(location.search).get("id");
    const list = posts();
    const idx = list.findIndex((x) => x.id === id);
    const x = list[idx];
    if (!x) {
      $("#app").innerHTML = `<section class="wrap section"><h1 class="mega">404</h1><p>没找到这篇文章。</p>
        <p><a class="btn primary" href="posts.html">← 全部文章</a></p></section>`;
      return;
    }
    document.title = `${x.title} · ${S.name}`;
    const prod = (S.products || []).find((p) => p.id === x.product);
    const newer = list[idx - 1];
    const older = list[idx + 1];
    $("#app").innerHTML = `
    <section class="wrap phead" data-p="out" data-tone="cream">
      <a class="back" href="posts.html?type=${encodeURIComponent(x.type)}">← 全部${esc(x.type)}</a>
      <div class="post-meta"><span class="ptype" data-type="${esc(x.type)}">${esc(x.type)}</span><time>${esc(x.date)}</time>
        ${prod ? `<a href="product.html?id=${encodeURIComponent(prod.id)}">${esc(prod.name)}</a>` : ""}</div>
      <h1 class="mega post-title">${esc(x.title)}</h1>
      ${x.summary ? `<p class="tagline"><span>${esc(x.summary)}</span></p>` : ""}
    </section>
    ${x.cover ? `<section class="wrap media">${pic(x.cover, "cover", x.cover)}</section>` : ""}
    <section class="wrap section" data-tone="lilac"><div class="post-body" id="post-body"><p class="muted">正在加载…</p></div></section>
    <nav class="wrap post-nav" data-tone="lilac">
      ${newer ? `<a href="post.html?id=${encodeURIComponent(newer.id)}"><small>← 上一篇</small><b>${esc(newer.title)}</b></a>` : ""}
      ${older ? `<a class="next" href="post.html?id=${encodeURIComponent(older.id)}"><small>下一篇 →</small><b>${esc(older.title)}</b></a>` : ""}
    </nav>
    ${prod ? `<section class="wrap section" data-tone="pink">
      <div class="card cta"><div><h3>${esc(prod.name)}</h3><p>${esc(prod.summary)}</p></div>
      <a class="btn primary" href="product.html?id=${encodeURIComponent(prod.id)}">去看看 →</a></div>
    </section>` : ""}`;

    fetch(x.file)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then((t) => { $("#post-body").innerHTML = md(t); })
      .catch(() => {
        $("#post-body").innerHTML = `<div class="note">文章加载失败。如果你是直接双击打开的网页，需要用本地服务器预览（看 README）。</div>`;
      });
  }

  /* ---------- 购买弹窗 ---------- */

  function openBuy(p, pl) {
    const pay = S.pay || {};
    const note = `${p.name}-${pl.name}`;
    const tabs = [];
    if (pay.wechat) tabs.push(["微信", `${pic(pay.wechat, "qr lg", "微信收款码\n" + pay.wechat)}
      <p class="muted">扫码付 <b>¥${pl.price}</b>，备注「${esc(note)}」</p>`]);
    if (pay.alipay) tabs.push(["支付宝", `${pic(pay.alipay, "qr lg", "支付宝收款码\n" + pay.alipay)}
      <p class="muted">扫码付 <b>¥${pl.price}</b>，备注「${esc(note)}」</p>`]);
    if (pay.afdian) tabs.push(["爱发电", `<p>在爱发电下单付款，支持微信和支付宝。</p>
      <a class="btn primary" href="${esc(pl.afdian || pay.afdian)}" target="_blank" rel="noopener">去爱发电付款 →</a>`]);
    if (pay.usdt?.address) tabs.push(["USDT", `<p>网络：<b>${esc(pay.usdt.network)}</b></p>
      <div class="addr"><code>${esc(pay.usdt.address)}</code><button class="copy" data-copy="${esc(pay.usdt.address)}">复制</button></div>
      <p class="muted">金额按当天汇率折算，转账前先跟我确认。一定要选对网络，转错无法找回。</p>`]);

    const mask = document.createElement("div");
    mask.className = "mask";
    mask.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="购买">
      <button class="x" aria-label="关闭">×</button>
      <span class="kicker">✦ CHECKOUT ✦</span>
      <h3>${esc(p.name)} · ${esc(pl.name)}</h3>
      <div class="amount">¥${pl.price}<small>${esc(pl.unit || "")}</small></div>
      <ol class="steps">
        <li>选一种方式付款</li>
        <li>把<b>付款截图</b>和软件里显示的<b>机器码</b>发给我</li>
        <li>收到激活码，粘贴到软件里就能用</li>
      </ol>
      <div class="tabs">${tabs.map(([t], i) => `<button class="${i ? "" : "on"}" data-tab="${i}">${t}</button>`).join("")}</div>
      ${tabs.map(([, h], i) => `<div class="pane" data-pane="${i}" ${i ? "hidden" : ""}>${h}</div>`).join("")}
      <h4>付完款发给我</h4>
      ${contactHTML()}
    </div>`;
    document.body.appendChild(mask);
    document.body.style.overflow = "hidden";

    const close = () => {
      mask.remove();
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    mask.addEventListener("click", (e) => {
      if (e.target === mask || e.target.closest(".x")) return close();
      const t = e.target.closest("[data-tab]");
      if (!t) return;
      mask.querySelectorAll("[data-tab]").forEach((b) => b.classList.toggle("on", b === t));
      mask.querySelectorAll("[data-pane]").forEach((d) => { d.hidden = d.dataset.pane !== t.dataset.tab; });
    });
  }

  renderChrome();
  ({ product: renderProduct, posts: renderPosts, post: renderPost }[page] || renderHome)();
})();
