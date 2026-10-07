/*
 * 极简 Markdown → HTML（网页和 tools/build.mjs 共用）
 * 支持：## 大标题  ### 小标题  段落  - 列表  1. 有序列表（可以空行、可以缩进嵌套）
 *       > 引用（多行合并）  ``` 代码块  `代码`  **加粗**  [链接](网址)  ![](图片)  --- 分割线
 */
(function (root) {
  "use strict";

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // 挡掉 javascript: 之类的危险链接
  const safeUrl = (u) => (/^\s*(javascript|data|vbscript):/i.test(u) ? "#" : u);

  const CJK = /[　-〿㐀-鿿＀-￯]/;
  const joinLines = (lines) => lines.reduce((acc, l) => {
    if (!acc) return l;
    const a = acc[acc.length - 1], b = l[0];
    return acc + (CJK.test(a) && CJK.test(b) ? "" : " ") + l;
  }, "");

  function inline(src) {
    const codes = [];
    let s = String(src).replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(c) - 1}\u0000`);
    s = esc(s);
    const url = "((?:[^()\\s]|\\([^()\\s]*\\))+)";
    s = s
      .replace(new RegExp(`!\\[([^\\]]*)\\]\\(${url}\\)`, "g"), (_, alt, u) => `<img src="${safeUrl(u)}" alt="${alt}" loading="lazy">`)
      .replace(new RegExp(`\\[([^\\]]+)\\]\\(${url}\\)`, "g"), (_, t, u) => {
        const ext = /^https?:/i.test(u);
        return `<a href="${safeUrl(u)}"${ext ? ' target="_blank" rel="noopener"' : ""}>${t}</a>`;
      })
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[+i])}</code>`);
  }

  function md(src) {
    const lines = String(src).replace(/\r/g, "").split("\n");
    let html = "";
    let para = [];
    let quote = [];
    let stack = [];   // 列表栈：{ t: "ul"|"ol", indent, items: [{ text: [], sub: "" }] }

    const flushP = () => { if (para.length) html += `<p>${inline(joinLines(para))}</p>`; para = []; };
    const flushQ = () => { if (quote.length) html += `<blockquote>${inline(joinLines(quote))}</blockquote>`; quote = []; };
    const renderList = (l) => `<${l.t}${l.t === "ol" && l.start > 1 ? ` start="${l.start}"` : ""}>${
      l.items.map((it) => `<li>${inline(joinLines(it.text))}${it.sub}</li>`).join("")}</${l.t}>`;
    const closeTo = (indent) => {
      while (stack.length && stack[stack.length - 1].indent > indent) {
        const done = stack.pop();
        if (stack.length) {
          const parent = stack[stack.length - 1];
          parent.items[parent.items.length - 1].sub += renderList(done);
        } else {
          html += renderList(done);
        }
      }
    };
    const flushL = () => closeTo(-1);
    const flushAll = () => { flushP(); flushQ(); flushL(); };

    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      let m;
      if (l.startsWith("```")) {
        flushAll();
        const buf = [];
        while (++i < lines.length && !lines[i].startsWith("```")) buf.push(lines[i]);
        html += `<pre><code>${esc(buf.join("\n"))}</code></pre>`;
        continue;
      }
      if (!l.trim()) {
        flushP(); flushQ();
        // 空行后面如果还是列表项，就不结束列表
        let j = i + 1;
        while (j < lines.length && !lines[j].trim()) j++;
        if (!(j < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[j]))) flushL();
        continue;
      }
      if ((m = l.match(/^(#{1,4})\s+(.*)/))) {
        flushAll();
        const n = Math.min(4, Math.max(2, m[1].length));   // # 和 ## 都是大标题（h2），### 小标题（h3），#### 更小（h4）
        html += `<h${n}>${inline(m[2])}</h${n}>`;
      } else if (/^\s*(-{3,}|\*{3,})\s*$/.test(l)) {
        flushAll();
        html += "<hr>";
      } else if ((m = l.match(/^>\s?(.*)/))) {
        flushP(); flushL();
        quote.push(m[1]);
      } else if ((m = l.match(/^(\s*)([-*]|(\d+)\.)\s+(.*)/))) {
        flushP(); flushQ();
        const indent = m[1].replace(/\t/g, "    ").length;
        const t = m[3] ? "ol" : "ul";
        closeTo(indent);
        let top = stack[stack.length - 1];
        if (!top || top.indent < indent) {
          top = { t, indent, start: m[3] ? +m[3] : 1, items: [] };
          stack.push(top);
        } else if (top.t !== t) {
          closeTo(indent - 1);
          top = { t, indent, start: m[3] ? +m[3] : 1, items: [] };
          stack.push(top);
        }
        top.items.push({ text: [m[4]], sub: "" });
      } else if (stack.length && /^\s+\S/.test(l)) {
        // 列表项的续行
        const top = stack[stack.length - 1];
        top.items[top.items.length - 1].text.push(l.trim());
      } else {
        flushQ(); flushL();
        para.push(l.trim());
      }
    }
    flushAll();
    return html;
  }

  if (typeof module === "object" && module.exports) module.exports = { md, esc };
  else root.MD = { md, esc };
})(typeof window !== "undefined" ? window : globalThis);
