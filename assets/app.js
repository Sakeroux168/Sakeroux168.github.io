(function () {
  "use strict";

  const S = window.SITE || {};
  const MD = window.MD || { md: (s) => s };
  const page = document.body.dataset.page;
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const qs = (k) => new URLSearchParams(location.search).get(k);
  const pageId = () => document.body.dataset.id || qs("id");

  // 每个软件 / 文章 / 页面都有一个独立的静态页（由 tools/build.mjs 生成，分享到微信时标题才对）
  const softUrl = (id) => `soft-${encodeURIComponent(id)}.html`;
  const postUrl = (id) => `article-${encodeURIComponent(id)}.html`;
  const docUrl = (id) => `page-${encodeURIComponent(id)}.html`;

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

  const pic = (src, cls, hint, alt = "") => src
    ? `<img class="${cls}" src="${esc(src)}" alt="${esc(alt)}" data-ph="${esc(hint)}">`
    : `<div class="${cls} ph" aria-hidden="true">${esc(hint)}</div>`;

  const icon = (p, cls = "icon") => p.iconImg
    ? pic(p.iconImg, cls, (p.name || "?")[0], p.name)
    : `<div class="${cls}" aria-hidden="true">${esc(p.icon || (p.name || "?")[0])}</div>`;

  const SHOP = S.shop || S.name || "我的小铺";
  const WX = S.contact?.wechat || "";
  const posts = () => (S.posts || []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));

  // 价格：price 0 = 免费；null = 还没定价（开发中）
  const priceText = (pl) => (pl.price == null ? "敬请期待" : pl.price === 0 ? "免费" : `¥${pl.price}`);
  const paidPlans = (p) => (p.plans || []).filter((x) => x.price > 0);
  const hasTrial = (p) => (p.plans || []).some((x) => x.price === 0) && paidPlans(p).length > 0;
  const isDev = (p) => (p.plans || []).length > 0 && (p.plans || []).every((x) => x.price == null);
  const contactOnly = (p) => (p.downloads || []).length > 0 && p.downloads.every((d) => /#contact$/.test(d.url));

  function cardPrice(p) {
    const paid = paidPlans(p);
    if (paid.length === 1) return `¥${paid[0].price}<small>${esc(paid[0].name)}</small>`;
    if (paid.length > 1) return `¥${Math.min(...paid.map((x) => x.price))}<small>起</small>`;
    if (isDev(p)) return "敬请期待";
    return (p.plans || []).length ? "免费" : "看看";
  }

  // 区块标题：背后一行空心大字 + 中文标题
  const head = (ghost, title, sub = "") => `<div class="sec-head" data-p>
    <span class="ghost" aria-hidden="true">${ghost}</span>
    <h2>${title}</h2>${sub ? `<p>${esc(sub)}</p>` : ""}
  </div>`;

  const marquee = (items) => {
    if (!items || !items.length) return "";
    const row = items.map((t) => `<span>${esc(t)}</span><i>★</i>`).join("");
    return `<div class="marquee" aria-hidden="true"><div class="track" data-copies="4">${row}${row}${row}${row}</div></div>`;
  };

  const sticker = (status) => status
    ? `<span class="sticker ${status === "在售" ? "" : "alt"}">${esc(status)}</span>` : "";

  /* ---------- 通用：导航、页脚、悬浮微信、复制 ---------- */

  function renderChrome() {
    const base = page === "home" ? "" : "index.html";
    const type = qs("type");
    const links = [
      [`${base}#products`, "软件"],
      ["posts.html?type=教程", "教程", page === "posts" && type === "教程"],
      ["posts.html?type=公告", "公告", page === "posts" && type === "公告"],
      [`${base}#custom`, "定制"],
      [docUrl("guide"), "须知", page === "page" && pageId() === "guide"],
      S.showOpenSource && [`${base}#opensource`, "开源"],
    ].filter(Boolean);
    $("#nav").innerHTML = `<div class="wrap nav">
      <a class="brand" href="${base || "#"}">${esc(SHOP)}<i aria-hidden="true">✦</i></a>
      <nav aria-label="主导航">${links.map(([h, t, on]) => `<a href="${h}"${on ? ' class="on" aria-current="page"' : ""}>${t}</a>`).join("")}</nav>
    </div>`;

    const prods = (S.products || []).filter((p) => !isDev(p));
    $("#footer").innerHTML = `<div class="band" data-p="enter">
      <div class="wrap foot">
        <div class="foot-big" aria-hidden="true">慢走，常来 ✦</div>
        <div class="foot-cols">
          <div>
            <b class="foot-shop">${esc(SHOP)}</b>
            <p>${esc(S.name)}的小铺子，自产自销。</p>
            ${(S.promises || []).length ? `<ul class="promises">${S.promises.map((x) => `<li>✓ ${esc(x)}</li>`).join("")}</ul>` : ""}
          </div>
          <div>
            <b>软件</b>
            <ul>${prods.map((p) => `<li><a href="${softUrl(p.id)}">${esc(p.name)}</a></li>`).join("")}</ul>
          </div>
          <div>
            <b>帮助</b>
            <ul>
              ${(S.pages || []).map((d) => `<li><a href="${docUrl(d.id)}">${esc(d.title)}</a></li>`).join("")}
              <li><a href="posts.html?type=教程">使用教程</a></li>
              <li><a href="posts.html?type=公告">更新公告</a></li>
            </ul>
          </div>
          <div>
            <b>联系</b>
            ${WX ? `<p>微信 <button class="copy on-band" data-copy="${esc(WX)}">${esc(WX)} · 复制</button></p>` : ""}
            ${S.contact?.email ? `<p>邮箱 <a href="mailto:${esc(S.contact.email)}">${esc(S.contact.email)}</a></p>` : ""}
            ${S.contact?.antiScam ? `<p class="small">${esc(S.contact.antiScam)}</p>` : ""}
          </div>
        </div>
        <div class="foot-row">
          <span>© ${new Date().getFullYear()} ${esc(SHOP)} · ${esc(S.name)}</span>
          ${S.showOpenSource && S.github ? `<a href="https://github.com/${esc(S.github)}" target="_blank" rel="noopener">GitHub ↗</a>` : ""}
        </div>
      </div>
    </div>`;

    if (WX && !$(".wx-fab")) {
      const fab = document.createElement("button");
      fab.className = "wx-fab";
      fab.type = "button";
      fab.dataset.copy = WX;
      fab.dataset.toast = `微信号 ${WX} 已复制，打开微信「添加朋友」粘贴即可`;
      fab.setAttribute("aria-label", `复制微信号 ${WX}`);
      fab.innerHTML = `<span aria-hidden="true">💬</span> 加微信`;
      document.body.appendChild(fab);
    }
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
      ${c.wechatQr ? `<figure>${pic(c.wechatQr, "qr", "微信二维码\n" + c.wechatQr, "微信二维码")}<figcaption>扫码加微信</figcaption></figure>` : ""}
      <div class="crows">${rows.join("")}
        ${c.antiScam ? `<p class="anti-scam">⚠ ${esc(c.antiScam)}</p>` : ""}
      </div>
    </div>`;
  }

  let toastBox = null;
  function toast(msg) {
    if (!toastBox) {
      toastBox = document.createElement("div");
      toastBox.className = "toast-box";
      toastBox.setAttribute("role", "status");
      toastBox.setAttribute("aria-live", "polite");
      document.body.appendChild(toastBox);
    }
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    toastBox.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  }

  async function copy(text, okMsg) {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { ok = document.execCommand("copy"); } catch { ok = false; }
      ta.remove();
    }
    toast(ok ? (okMsg || "已复制 ✦") : `复制失败，请手动记下：${text}`);
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-copy]");
    if (b) copy(b.dataset.copy, b.dataset.toast);
  });

  /* ---------- 卡片 ---------- */

  function cardHTML(p) {
    return `<a class="card pcard" href="${softUrl(p.id)}">
      ${sticker(p.status)}
      <div class="pc-top">${icon(p)}<h3>${esc(p.name)}</h3></div>
      <p>${esc(p.summary)}</p>
      <div class="tags">${(p.tags || []).map((t) => `<span>${esc(t)}</span>`).join("")}</div>
      <div class="pc-foot"><span class="price">${cardPrice(p)}</span><span class="go" aria-hidden="true">→</span></div>
    </a>`;
  }

  function postCard(x) {
    return `<a class="card post" href="${postUrl(x.id)}">
      ${x.cover ? pic(x.cover, "thumb", x.cover, x.title) : ""}
      <div class="post-meta"><span class="ptype" data-type="${esc(x.type)}">${esc(x.type)}</span><time>${esc(x.date)}</time></div>
      <h3>${esc(x.title)}</h3>
      <p>${esc(x.summary)}</p>
      <span class="more">阅读全文 →</span>
    </a>`;
  }

  /* ---------- 首页 ---------- */

  function renderHome() {
    document.title = `${SHOP} · ${S.name}`;
    const cu = S.custom || {};
    const sp = S.sponsor || {};
    const lab = S.lab || [];
    const products = S.products || [];
    const latest = posts().slice(0, 3);
    const hasSponsor = sp.afdian || sp.wechatReward;
    const onSale = products.filter((p) => !isDev(p)).length;
    const dev = products.length - onSale;
    $("#app").innerHTML = `
    <section class="hero wrap" data-p="out" data-tone="cream">
      <i class="star s1" aria-hidden="true"></i><i class="star s2" aria-hidden="true"></i><i class="blob" aria-hidden="true"></i>
      <div class="hero-text">
        <span class="kicker">✦ ${esc(S.name)}的小铺子 · 自产自销 ✦</span>
        <div class="sign"><h1 class="mega" data-split>${esc(SHOP)}</h1></div>
        <p class="tagline"><span>${esc(S.tagline)}</span></p>
        <p class="intro">${esc(S.intro)}</p>
        <div class="actions">
          <a class="btn primary" href="#products">进店逛逛 →</a>
          <a class="btn" href="${docUrl("guide")}">怎么买？</a>
        </div>
      </div>
      <div class="avatar-wrap">
        <svg class="ring" viewBox="0 0 200 200" aria-hidden="true">
          <defs><path id="ring-path" d="M100,100 m-86,0 a86,86 0 1,1 172,0 a86,86 0 1,1 -172,0"/></defs>
          <text><textPath href="#ring-path" textLength="535" lengthAdjust="spacing">★ 欢迎光临 ★ ${esc(S.name)}的杂货铺 ★ 童叟无欺 ★ 先试后买 </textPath></text>
        </svg>
        ${pic(S.avatar, "avatar", (S.name || "我")[0], S.name)}
        <div class="open-sign" aria-hidden="true"><span>营业中</span></div>
      </div>
    </section>

    ${marquee(S.marquee)}

    <section id="products" class="wrap section" data-tone="lilac">
      ${head("货架", "软件", `${onSale} 款能用${dev ? `、${dev} 款开发中` : ""}，收费软件大多能先免费试用 3 天`)}
      <div class="grid">${products.map(cardHTML).join("")}</div>
      <div class="shop-foot"><span>没找到想要的？</span><a class="btn" href="#custom">找我定做 →</a></div>
    </section>

    <section class="wrap section" data-tone="lilac">
      ${head("流程", "怎么买", "先试用，好用再付钱")}
      <ol class="flow buy-flow">
        <li>加微信 ${esc(WX)}</li><li>领安装包，免费试用</li><li>付款，发我机器码</li><li>收到激活码，粘贴激活</li>
      </ol>
      <p class="rules">⚠ ${esc(S.rules || "")} <a href="${docUrl("guide")}">看完整购买须知 →</a></p>
    </section>

    ${latest.length ? `<section id="news" class="wrap section" data-tone="butter">
      ${head("告示", "最新动态", "教程、更新、新软件上架")}
      <div class="grid">${latest.map(postCard).join("")}</div>
      <div class="see-all"><a class="btn" href="posts.html">全部文章 →</a></div>
    </section>` : ""}

    ${S.showOpenSource ? `<section id="opensource" class="band" data-tone="butter">
      <div class="wrap section">
        ${head("开源", "开源", "免费拿去用，顺手点个 Star")}
        <div id="repos" class="grid"><div class="note">正在加载 GitHub 仓库…</div></div>
      </div>
    </section>` : ""}

    ${lab.length ? `<section id="lab" class="wrap section" data-tone="mint">
      ${head("后厨", "实验室", "后厨里还在捣鼓的东西")}
      <div class="grid">${lab.map((x) => `<${x.link ? `a href="${esc(x.link)}"` : "div"} class="card lab">
        ${x.cover ? pic(x.cover, "thumb", x.cover, x.name) : ""}
        <h3>${esc(x.name)}</h3><p>${esc(x.desc)}</p></${x.link ? "a" : "div"}>`).join("")}</div>
    </section>` : ""}

    <section id="custom" class="wrap section" data-tone="pink">
      ${head("定做", "定制开发", cu.intro)}
      <div class="grid services">${(cu.services || []).map((s, i) =>
        `<div class="card"><b class="num">${String(i + 1).padStart(2, "0")}</b><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p></div>`).join("")}</div>
      ${cu.steps ? `<ol class="flow">${cu.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>` : ""}
      <div class="actions"><a class="btn primary" href="#contact">聊聊你的需求 →</a></div>
    </section>

    ${hasSponsor ? `<section id="sponsor" class="wrap section" data-tone="lilac">
      ${head("打赏", "赞助")}
      <div class="card sponsor">
        <i class="star s3" aria-hidden="true"></i>
        <div class="sp-text">
          <p>${esc(sp.intro)}</p>
          <div class="actions">
            ${sp.afdian ? `<a class="btn primary" href="${esc(sp.afdian)}" target="_blank" rel="noopener">在爱发电赞助 ♥</a>` : ""}
          </div>
        </div>
        ${sp.wechatReward ? `<figure>${pic(sp.wechatReward, "qr", "微信赞赏码\n" + sp.wechatReward, "微信赞赏码")}<figcaption>微信赞赏</figcaption></figure>` : ""}
      </div>
    </section>` : ""}

    <section id="contact" class="wrap section" data-tone="cream">
      ${head("吆喝", "联系我", "买软件、定制、反馈问题都可以")}
      <div class="card">${contactHTML()}</div>
    </section>`;
    if (S.showOpenSource) loadRepos();
  }

  async function loadRepos() {
    const box = $("#repos");
    const u = S.github;
    if (!u) {
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
    box.innerHTML = list.length ? list.map((r) => `<a class="card repo" href="${esc(r.html_url)}" target="_blank" rel="noopener">
      <h3>${esc(r.name)}</h3><p>${esc(r.description || "暂无简介")}</p>
      <div class="meta">${r.language ? `<span>${esc(r.language)}</span>` : ""}<span>★ ${r.stargazers_count}</span><span>⑂ ${r.forks_count}</span></div>
    </a>`).join("") : `<div class="note">还没有公开的仓库。</div>`;
  }

  /* ---------- 404 ---------- */

  function notFound(what, back, backText) {
    document.title = `没找到${what} · ${SHOP}`;
    $("#app").innerHTML = `<section class="wrap section phead" data-tone="cream">
      <h1 class="mega">404</h1><p class="intro">没找到这个${what}，可能已经下架或者改名了。</p>
      <p><a class="btn primary" href="${back}">${backText}</a></p></section>`;
  }

  /* ---------- 软件详情页 ---------- */

  function renderProduct() {
    const p = (S.products || []).find((x) => x.id === pageId());
    if (!p) return notFound("软件", "index.html#products", "← 返回全部软件");
    document.title = `${p.name} · ${SHOP}`;
    const media = p.bilibili
      ? `<div class="video"><iframe title="${esc(p.name)} 演示视频" src="https://player.bilibili.com/player.html?bvid=${encodeURIComponent(p.bilibili)}&autoplay=0&high_quality=1" allowfullscreen loading="lazy"></iframe></div>`
      : p.cover ? pic(p.cover, "cover", "软件截图\n" + p.cover, `${p.name} 截图`) : "";
    const plans = p.plans || [];
    const feats = (p.features || []).filter(Boolean).map((f) => (typeof f === "string" ? { title: f } : f));
    const related = posts().filter((x) => x.product === p.id);
    const dev = isDev(p);
    const paid = paidPlans(p).length > 0;
    const dlLabel = contactOnly(p) ? "领安装包" : "下载试用";
    const notice = p.notice ? `<div class="notice"><b>使用须知</b><p>${esc(p.notice)} <a href="${docUrl("terms")}">用户协议 →</a></p></div>` : "";
    const req = p.requirements ? `<p class="req"><b>系统要求</b>${esc(p.requirements)}</p>` : "";

    $("#app").innerHTML = `
    <section class="wrap phead" data-p="out" data-tone="cream">
      <i class="star s1" aria-hidden="true"></i>
      <a class="back" href="index.html#products">← 全部软件</a>
      <div class="ph-row">${icon(p, "icon lg")}${sticker(p.status)}</div>
      <h1 class="mega" data-split>${esc(p.name)}</h1>
      <p class="tagline"><span>${esc(p.summary)}</span></p>
      <div class="tags">${(p.tags || []).map((t) => `<span>${esc(t)}</span>`).join("")}</div>
      <div class="actions">
        ${plans.length ? `<a class="btn primary" href="#pricing">${dev ? "预约内测 →" : paid ? "看价格 →" : "怎么领取 →"}</a>` : ""}
        ${(p.downloads || []).length ? `<a class="btn" href="#download">${dlLabel}</a>` : ""}
      </div>
    </section>

    ${media ? `<section class="wrap media">${media}</section>` : ""}

    ${marquee(p.tags && p.tags.length ? p.tags.concat(feats.map((f) => f.title)) : null)}

    ${feats.length ? `<section class="wrap section" data-tone="lilac">
      ${head("功能", "能做什么")}
      <div class="grid feats">${feats.map((f, i) => `<div class="card"><b class="num">${String(i + 1).padStart(2, "0")}</b><h3>${esc(f.title)}</h3>${f.desc ? `<p>${esc(f.desc)}</p>` : ""}</div>`).join("")}</div>
    </section>` : ""}

    ${plans.length ? `<section id="pricing" class="wrap section" data-tone="butter">
      ${head("价目", dev ? "内测预约" : paid ? "价格" : "怎么领取", dev ? "正在开发中，加微信预约，做好了第一时间通知你" : paid ? "先试用，好用再买，付款后发激活码" : "")}
      <div class="plans${plans.length === 1 ? " single" : ""}">${plans.map((pl, i) => `<div class="card plan ${pl.highlight && plans.length > 1 ? "hot" : ""}">
        ${pl.highlight && plans.length > 1 ? `<span class="sticker big">店长推荐</span>` : ""}
        <h3>${esc(pl.name)}</h3>
        <div class="amount">${priceText(pl)}<small>${esc(pl.unit || "")}</small></div>
        <p>${esc(pl.desc)}</p>
        <button class="btn ${(pl.highlight || plans.length === 1) ? "primary" : ""}" data-plan="${i}">${
          pl.price == null ? "加微信预约 →" : pl.price === 0 ? (contactOnly(p) || !(p.downloads || []).length ? "加微信领取 →" : "免费下载") : "立即购买 →"}</button>
      </div>`).join("")}</div>
      ${paid ? `<p class="rules">⚠ ${esc(S.rules || "")} <a href="${docUrl("guide")}">购买须知 →</a></p>` : ""}
      ${(p.downloads || []).length ? "" : req + notice}
    </section>` : ""}

    ${(p.downloads || []).length ? `<section id="download" class="wrap section" data-tone="mint">
      ${head("提货", contactOnly(p) ? "领安装包" : "下载", hasTrial(p) ? "打开后自动试用 3 天，不用付钱也不用激活码" : "")}
      <div class="actions">${p.downloads.map((d) => /#contact$/.test(d.url)
        ? `<button class="btn primary" data-copy="${esc(WX)}" data-toast="微信号 ${esc(WX)} 已复制，加我微信发你安装包">💬 ${esc(d.label)}（微信 ${esc(WX)}）</button>`
        : `<a class="btn" href="${esc(d.url)}" ${/^https?:/.test(d.url) ? 'target="_blank" rel="noopener"' : ""}>↓ ${esc(d.label)}</a>`).join("")}</div>
      ${req}${notice}
    </section>` : ""}

    ${related.length ? `<section class="wrap section" data-tone="mint">
      ${head("告示", "教程和公告")}
      <div class="grid">${related.map(postCard).join("")}</div>
    </section>` : ""}

    ${(p.changelog || []).length ? `<section class="wrap section" data-tone="cream">
      ${head("流水", "更新日志")}
      <ul class="changelog">${p.changelog.map((c) => `<li><b>v${esc(c.version)}</b><time>${esc(c.date)}</time><span>${esc(c.notes)}</span></li>`).join("")}</ul>
    </section>` : ""}

    ${(p.faq || []).length ? `<section class="wrap section" data-tone="pink">
      ${head("问答", "常见问题")}
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
      if (pl.price == null || (pl.price === 0 && (contactOnly(p) || !(p.downloads || []).length))) {
        copy(WX, `微信号 ${WX} 已复制，加我微信${pl.price == null ? "预约内测" : "领取"}`);
      } else if (pl.price === 0) {
        const dl = $("#download");
        if (dl) dl.scrollIntoView({ behavior: "smooth" });
      } else {
        openBuy(p, pl, b);
      }
    });
  }

  /* ---------- 文章列表页 ---------- */

  function renderPosts() {
    const TYPES = ["全部", "教程", "公告"];
    let type = qs("type");
    if (!TYPES.includes(type)) type = "全部";
    document.title = `教程和公告 · ${SHOP}`;
    $("#app").innerHTML = `
    <section class="wrap phead" data-p="out" data-tone="cream">
      <i class="star s1" aria-hidden="true"></i>
      <span class="kicker">✦ 小黑板 ✦</span>
      <h1 class="mega" data-split>教程和公告</h1>
      <p class="tagline"><span>使用教程、版本更新、新软件上架，都写在这里</span></p>
      <div class="filters" role="group" aria-label="筛选">${TYPES.map((t) => `<button data-type="${t}">${t}</button>`).join("")}</div>
    </section>
    <section class="wrap section" data-tone="lilac"><div id="post-list" class="grid"></div></section>`;

    const draw = () => {
      document.querySelectorAll(".filters button").forEach((b) => {
        b.classList.toggle("on", b.dataset.type === type);
        b.setAttribute("aria-pressed", b.dataset.type === type);
      });
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

  /* ---------- 文章页 & 固定页面 ---------- */

  function loadMarkdown(file) {
    fetch(file)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then((t) => { $("#post-body").innerHTML = MD.md(t); })
      .catch(() => {
        $("#post-body").innerHTML = location.protocol === "file:"
          ? `<div class="note">直接双击打开的网页读不到文章，请用本地服务器预览（看使用说明）。</div>`
          : `<div class="note">文章暂时打不开，请稍后刷新一下。</div>`;
      });
  }

  function renderPost() {
    const list = posts();
    const idx = list.findIndex((x) => x.id === pageId());
    const x = list[idx];
    if (!x) return notFound("文章", "posts.html", "← 全部文章");
    document.title = `${x.title} · ${SHOP}`;
    const prod = (S.products || []).find((p) => p.id === x.product);
    const newer = list[idx - 1];
    const older = list[idx + 1];
    $("#app").innerHTML = `
    <section class="wrap phead" data-p="out" data-tone="cream">
      <a class="back" href="posts.html?type=${encodeURIComponent(x.type)}">← 全部${esc(x.type)}</a>
      <div class="post-meta"><span class="ptype" data-type="${esc(x.type)}">${esc(x.type)}</span><time>${esc(x.date)}</time>
        ${prod ? `<a href="${softUrl(prod.id)}">${esc(prod.name)}</a>` : ""}</div>
      <h1 class="mega post-title">${esc(x.title)}</h1>
      ${x.summary ? `<p class="tagline"><span>${esc(x.summary)}</span></p>` : ""}
    </section>
    ${x.cover ? `<section class="wrap media">${pic(x.cover, "cover", x.cover, x.title)}</section>` : ""}
    <section class="wrap section post-section" data-tone="lilac"><article class="post-body" id="post-body"><p class="muted">正在加载…</p></article></section>
    <nav class="wrap post-nav" aria-label="上一篇和下一篇">
      ${newer ? `<a href="${postUrl(newer.id)}"><small>← 上一篇</small><b>${esc(newer.title)}</b></a>` : ""}
      ${older ? `<a class="next" href="${postUrl(older.id)}"><small>下一篇 →</small><b>${esc(older.title)}</b></a>` : ""}
    </nav>
    ${prod ? `<section class="wrap section" data-tone="pink">
      <div class="card cta"><div><h3>${esc(prod.name)}</h3><p>${esc(prod.summary)}</p></div>
      <a class="btn primary" href="${softUrl(prod.id)}">去看看 →</a></div>
    </section>` : ""}`;
    loadMarkdown(x.file);
  }

  function renderDoc() {
    const d = (S.pages || []).find((x) => x.id === pageId());
    if (!d) return notFound("页面", "index.html", "← 回首页");
    document.title = `${d.title} · ${SHOP}`;
    $("#app").innerHTML = `
    <section class="wrap phead" data-p="out" data-tone="cream">
      <a class="back" href="index.html">← 回首页</a>
      <span class="kicker">✦ 店规 ✦</span>
      <h1 class="mega post-title">${esc(d.title)}</h1>
      ${d.summary ? `<p class="tagline"><span>${esc(d.summary)}</span></p>` : ""}
    </section>
    <section class="wrap section post-section" data-tone="lilac"><article class="post-body" id="post-body"><p class="muted">正在加载…</p></article></section>
    <section class="wrap section" data-tone="pink">
      <div class="card cta"><div><h3>还有不清楚的？</h3><p>加微信直接问我。</p></div>
      <button class="btn primary" data-copy="${esc(WX)}" data-toast="微信号 ${esc(WX)} 已复制">复制微信号 →</button></div>
    </section>`;
    loadMarkdown(d.file);
  }

  /* ---------- 购买弹窗 ---------- */

  function openBuy(p, pl, opener) {
    if ($(".mask")) return;   // 已经开着就不再开
    const pay = S.pay || {};
    const note = `${p.name}-${pl.name}`;
    const tabs = [];
    if (pay.wechat) tabs.push(["微信", `${pic(pay.wechat, "qr lg", "微信收款码\n" + pay.wechat, "微信收款码")}
      <p class="muted">扫码付 <b>¥${pl.price}</b>，备注「${esc(note)}」</p>`]);
    if (pay.alipay) tabs.push(["支付宝", `${pic(pay.alipay, "qr lg", "支付宝收款码\n" + pay.alipay, "支付宝收款码")}
      <p class="muted">扫码付 <b>¥${pl.price}</b>，备注「${esc(note)}」</p>`]);
    if (pay.afdian) tabs.push(["爱发电", `<p>在爱发电下单付款，支持微信和支付宝。</p>
      <a class="btn primary" href="${esc(pl.afdian || pay.afdian)}" target="_blank" rel="noopener">去爱发电付款 →</a>`]);
    const noPay = !tabs.length;
    if (noPay) tabs.push(["微信付款", `<p>加我微信，告诉我要买「${esc(note)}」，我发收款码给你。</p>
      ${WX ? `<div class="addr"><code>${esc(WX)}</code><button class="copy" data-copy="${esc(WX)}">复制微信号</button></div>` : ""}`]);

    const mask = document.createElement("div");
    mask.className = "mask";
    mask.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="buy-title" tabindex="-1">
      <button class="x" aria-label="关闭">×</button>
      <span class="kicker">✦ 结账 ✦</span>
      <h3 id="buy-title">${esc(p.name)} · ${esc(pl.name)}</h3>
      <div class="amount">¥${pl.price}<small>${esc(pl.unit || "")}</small></div>
      <ol class="steps">
        <li>${noPay ? "加微信，说要买哪个方案" : "选一种方式付款"}</li>
        <li>把<b>付款截图</b>和软件里显示的<b>机器码</b>发给我</li>
        <li>收到激活码，粘贴到软件里就能用</li>
      </ol>
      ${tabs.length > 1 ? `<div class="tabs" role="tablist">${tabs.map(([t], i) => `<button role="tab" aria-selected="${!i}" class="${i ? "" : "on"}" data-tab="${i}">${t}</button>`).join("")}</div>` : ""}
      ${tabs.map(([, h], i) => `<div class="pane" data-pane="${i}" ${i ? "hidden" : ""}>${h}</div>`).join("")}
      <p class="rules">⚠ 付款即表示你已阅读并同意<a href="${docUrl("guide")}" target="_blank">《购买须知》</a>：${esc(S.rules || "")}</p>
      ${noPay ? "" : `<h4>付完款发给我</h4>${contactHTML()}`}
    </div>`;
    document.body.appendChild(mask);
    document.body.style.overflow = "hidden";
    const modal = $(".modal", mask);
    const others = [...document.body.children].filter((el) => el !== mask);
    others.forEach((el) => el.setAttribute("inert", ""));
    $(".x", mask).focus();

    const close = () => {
      mask.remove();
      others.forEach((el) => el.removeAttribute("inert"));
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      if (opener) opener.focus();
    };
    const onKey = (e) => {
      if (e.key === "Escape") return close();
      if (e.key !== "Tab") return;
      const f = [...modal.querySelectorAll("a[href], button:not([disabled])")].filter((el) => !el.closest("[hidden]"));
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    };
    document.addEventListener("keydown", onKey);
    mask.addEventListener("click", (e) => {
      if (e.target === mask || e.target.closest(".x")) return close();
      const t = e.target.closest("[data-tab]");
      if (!t) return;
      mask.querySelectorAll("[data-tab]").forEach((b) => {
        b.classList.toggle("on", b === t);
        b.setAttribute("aria-selected", b === t);
      });
      mask.querySelectorAll("[data-pane]").forEach((d) => { d.hidden = d.dataset.pane !== t.dataset.tab; });
    });
  }

  /* ---------- 启动 ---------- */

  try {
    renderChrome();
    ({
      product: renderProduct, posts: renderPosts, post: renderPost, page: renderDoc,
      notfound: () => notFound("页面", "/", "← 回首页"),
    }[page] || renderHome)();
    window.__APP_OK = true;
  } catch (err) {
    // 出错时显示 build 生成的纯文字版，至少能看到软件和微信号
    console.error(err);
    document.documentElement.classList.remove("js");
  }
})();
