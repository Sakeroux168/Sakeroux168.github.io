/*
 * 生成网站页面：node tools/build.mjs（「更新网站.bat」会自动运行）
 *
 * 根据 data/site.js 生成：
 *  - index.html / posts.html 等页面的标题、描述、分享卡片信息
 *  - 每个软件一个页面 soft-xxx.html，每篇文章一个 article-xxx.html，每个固定页面 page-xxx.html
 *    （分享到微信时标题才对；搜索引擎也能读到文字）
 *  - 没有 JS 时显示的纯文字内容
 *  - sitemap.xml、robots.txt、404.html
 *  - 瘦身后的标题字体 fonts/SmileySans.woff2（只保留网站用到的字）
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rel = (...p) => path.join(ROOT, ...p);
const read = (p) => fs.readFileSync(rel(p), "utf8");
const exists = (p) => fs.existsSync(rel(p));
const write = (p, s) => { fs.writeFileSync(rel(p), s.replace(/\r\n/g, "\n")); written.push(p); };
const written = [];

const ctx = { window: {} };
vm.runInNewContext(read("data/site.js"), ctx, { filename: "data/site.js" });
const S = ctx.window.SITE;
if (!S) throw new Error("data/site.js 里没有找到 window.SITE");
const { md, esc } = createRequire(import.meta.url)(rel("assets/md.js"));

const SHOP = S.shop || S.name;
const URL_BASE = (S.url || "").replace(/\/$/, "");
const WX = S.contact?.wechat || "";
const theme = S.theme === undefined ? "zahuopu" : S.theme;
const ogImage = exists("images/og.png") ? `${URL_BASE}/images/og.png` : "";
const shareImg = exists("images/share.png") ? "images/share.png" : "";
const isDev = (p) => (p.plans || []).length > 0 && p.plans.every((x) => x.price == null);
const priceText = (pl) => (pl.price == null ? "敬请期待" : pl.price === 0 ? "免费" : `¥${pl.price}${pl.unit || ""}`);
const posts = (S.posts || []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
const clip = (s, n = 110) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

/* ---------- 页面模板 ---------- */
function html({ file, page, id = "", title, desc, fallback, base = "" }) {
  const url = `${URL_BASE}/${file === "index.html" ? "" : file}`;
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="theme-color" content="#b5312a">
  <meta name="format-detection" content="telephone=no">
  <link rel="canonical" href="${esc(url)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(SHOP)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${esc(url)}">
${ogImage ? `  <meta property="og:image" content="${esc(ogImage)}">\n` : ""}  <link rel="icon" href="${base}favicon.svg" type="image/svg+xml">
  <link rel="preload" href="${base}fonts/SmileySans.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${base}assets/style.css">
  <link rel="stylesheet" href="${base}assets/motion.css">
${theme ? `  <link rel="stylesheet" href="${base}assets/theme-${theme}.css">\n` : ""}  <script>document.documentElement.classList.add("js");setTimeout(function(){if(!window.__APP_OK)document.documentElement.classList.remove("js")},4000)</script>
</head>
<body data-page="${page}"${id ? ` data-id="${esc(id)}"` : ""}>
${shareImg ? `  <div hidden><img src="${base}${shareImg}" alt="${esc(SHOP)}"></div>\n` : ""}  <header id="nav"></header>
  <main id="app">
    <div class="static-fallback">
${fallback}
      <p>联系店主：微信 ${esc(WX)}</p>
      <noscript><p>你的浏览器关闭了 JavaScript，网站只能显示简单的文字版。</p></noscript>
    </div>
  </main>
  <footer id="footer"></footer>
  <script src="${base}data/site.js"></script>
  <script src="${base}assets/md.js"></script>
  <script src="${base}assets/app.js"></script>
  <script src="${base}assets/motion.js"></script>
</body>
</html>
`;
}

const productList = (S.products || []).map((p) =>
  `<li><a href="soft-${p.id}.html">${esc(p.name)}</a>（${esc(p.status || "")}）：${esc(p.summary)}</li>`).join("\n");

/* ---------- 首页、列表页、通用页 ---------- */
write("index.html", html({
  file: "index.html", page: "home",
  title: `${SHOP} · ${S.name}`, desc: S.description || S.intro,
  fallback: `      <h1>${esc(SHOP)}</h1>\n      <p>${esc(S.intro)}</p>\n      <h2>软件</h2>\n      <ul>\n${productList}\n      </ul>`,
}));
write("posts.html", html({
  file: "posts.html", page: "posts",
  title: `教程和公告 · ${SHOP}`, desc: `${SHOP}的使用教程、版本更新和新软件上架公告。`,
  fallback: `      <h1>教程和公告</h1>\n      <ul>\n${posts.map((x) => `<li><a href="article-${x.id}.html">${esc(x.title)}</a>（${esc(x.date)}）</li>`).join("\n")}\n      </ul>`,
}));
// 带 ?id= 参数的通用页（旧链接还能用）
for (const [file, page, t] of [["product.html", "product", "软件详情"], ["post.html", "post", "文章"], ["page.html", "page", "页面"]]) {
  write(file, html({ file, page, title: `${t} · ${SHOP}`, desc: S.description || S.intro, fallback: `      <h1>${esc(SHOP)}</h1>\n      <ul>\n${productList}\n      </ul>` }));
}
write("404.html", html({
  file: "404.html", page: "notfound", base: "/",
  title: `走错门了 · ${SHOP}`, desc: S.description || S.intro,
  fallback: `      <h1>走错门了</h1>\n      <p><a href="/">回到${esc(SHOP)}首页</a></p>`,
}));

/* ---------- 每个软件 ---------- */
for (const p of S.products || []) {
  const plans = (p.plans || []).map((pl) => `<li>${esc(pl.name)}：${priceText(pl)}。${esc(pl.desc || "")}</li>`).join("\n");
  const feats = (p.features || []).filter(Boolean).map((f) => `<li><b>${esc(f.title || f)}</b>${f.desc ? "：" + esc(f.desc) : ""}</li>`).join("\n");
  const faq = (p.faq || []).map((f) => `<dt>${esc(f.q)}</dt><dd>${esc(f.a)}</dd>`).join("\n");
  const priceHint = (p.plans || []).filter((x) => x.price > 0).map((x) => `${x.name} ¥${x.price}`).join(" / ");
  write(`soft-${p.id}.html`, html({
    file: `soft-${p.id}.html`, page: "product", id: p.id,
    title: `${p.name} · ${SHOP}`,
    desc: clip(`${p.summary}${priceHint ? `价格：${priceHint}。` : isDev(p) ? "开发中，敬请期待。" : ""}`),
    fallback: `      <h1>${esc(p.name)}</h1>\n      <p>${esc(p.summary)}</p>\n      <h2>能做什么</h2><ul>${feats}</ul>\n      <h2>价格</h2><ul>${plans}</ul>\n` +
      `${p.requirements ? `      <p>系统要求：${esc(p.requirements)}</p>\n` : ""}${p.notice ? `      <p>使用须知：${esc(p.notice)}</p>\n` : ""}${faq ? `      <h2>常见问题</h2><dl>${faq}</dl>\n` : ""}`,
  }));
}

/* ---------- 每篇文章、每个固定页面 ---------- */
for (const x of posts) {
  const body = exists(x.file) ? md(read(x.file)) : "";
  write(`article-${x.id}.html`, html({
    file: `article-${x.id}.html`, page: "post", id: x.id,
    title: `${x.title} · ${SHOP}`, desc: clip(x.summary || x.title),
    fallback: `      <h1>${esc(x.title)}</h1>\n      <p>${esc(x.date)}</p>\n      ${body}`,
  }));
}
for (const d of S.pages || []) {
  const body = exists(d.file) ? md(read(d.file)) : "";
  write(`page-${d.id}.html`, html({
    file: `page-${d.id}.html`, page: "page", id: d.id,
    title: `${d.title} · ${SHOP}`, desc: clip(d.summary || d.title),
    fallback: `      <h1>${esc(d.title)}</h1>\n      ${body}`,
  }));
}

/* ---------- 搜索引擎 ---------- */
const today = new Date().toISOString().slice(0, 10);
const urls = written.filter((f) => /\.html$/.test(f) && !["product.html", "post.html", "page.html", "404.html"].includes(f));
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((f) => `  <url><loc>${URL_BASE}/${f === "index.html" ? "" : f}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`);
write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${URL_BASE}/sitemap.xml\n`);

/* ---------- 标题字体瘦身 ---------- */
const FONT_SRC = "tools/fonts-src/SmileySans-Oblique.ttf.woff2";
if (exists(FONT_SRC)) {
  const texts = [read("data/site.js"), read("assets/app.js"), read("assets/md.js"), ...urls.map(read)];
  for (const dir of ["posts", "pages"]) {
    if (exists(dir)) for (const f of fs.readdirSync(rel(dir))) if (f.endsWith(".md")) texts.push(read(`${dir}/${f}`));
  }
  let ascii = "";
  for (let c = 32; c < 127; c++) ascii += String.fromCharCode(c);
  const chars = [...new Set([...texts.join("") + ascii + "，。！？、：；“”‘’（）《》【】…—·￥¥✦★✓→←↓↑"])].filter((c) => c.trim()).join("");
  const tmp = path.join(fs.mkdtempSync(path.join(process.env.TEMP || process.env.TMPDIR || "/tmp", "font-")), "chars.txt");
  fs.writeFileSync(tmp, chars);
  try {
    execFileSync("python", ["-m", "fontTools.subset", rel(FONT_SRC), `--text-file=${tmp}`, "--flavor=woff2",
      `--output-file=${rel("fonts/SmileySans.woff2")}`, "--layout-features=*", "--no-hinting"], { stdio: "pipe" });
    const kb = Math.round(fs.statSync(rel("fonts/SmileySans.woff2")).size / 1024);
    console.log(`字体瘦身完成：保留 ${[...chars].length} 个字，${kb} KB`);
  } catch (e) {
    console.warn("⚠ 字体瘦身失败（没装 fonttools？运行 python -m pip install fonttools brotli），这次先用原来的字体。");
    if (!exists("fonts/SmileySans.woff2")) fs.copyFileSync(rel(FONT_SRC), rel("fonts/SmileySans.woff2"));
  }
}

console.log(`生成完成：${written.length} 个文件`);
for (const f of written) console.log("  " + f);
