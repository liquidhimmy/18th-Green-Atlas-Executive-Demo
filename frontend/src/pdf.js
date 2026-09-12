// Print-to-PDF: builds an audit-styled document with DOM APIs (no document.write / innerHTML), then prints.
const CSS = `
*{box-sizing:border-box} body{font-family:'Hanken Grotesk',sans-serif;color:#14202b;margin:0;padding:48px 56px;background:#fff}
.brand{display:flex;align-items:center;gap:10px;color:#0F5C4D;font-size:12px;letter-spacing:.16em;text-transform:uppercase}
.dot{width:26px;height:26px;border-radius:50%;background:#072B24;border:2px solid #19C37D;display:inline-block}
h1{font-family:'Fraunces',serif;font-size:30px;margin:18px 0 4px}
.sub{color:#465468;font-size:13px}
.id{font-family:'JetBrains Mono',monospace;font-size:11px;color:#465468;margin-top:2px}
.rule{height:1px;background:#D8DDE6;margin:22px 0}
.sec{display:flex;gap:20px;padding:12px 0;border-bottom:1px solid #EEF2F4;page-break-inside:avoid}
.sec .h{width:210px;flex:none;color:#0F5C4D;font-weight:600;font-size:13px}
.sec .b{font-size:13.5px;line-height:1.55}
table{width:100%;border-collapse:collapse;margin-top:8px}
td{padding:8px 10px;border-bottom:1px solid #EEF2F4;font-size:12.5px}
td.k{color:#465468;width:220px} td.v{font-family:'JetBrains Mono',monospace}
.disc{margin-top:26px;padding:12px 14px;background:#FBF4E6;border:1px solid #E3A72F;color:#8a6410;font-size:11.5px;border-radius:8px}
.foot{margin-top:30px;color:#8a94a3;font-size:11px;display:flex;justify-content:space-between}
@media print{body{padding:28px 34px}}`;

const FONTS = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Hanken+Grotesk:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap";

function el(doc, tag, className, text) {
  const node = doc.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) setMultiline(doc, node, text);
  return node;
}

// Text is inserted as text nodes; newlines become <br>. Nothing is parsed as HTML.
function setMultiline(doc, node, text) {
  String(text ?? "").split("\n").forEach((line, i) => {
    if (i > 0) node.appendChild(doc.createElement("br"));
    node.appendChild(doc.createTextNode(line));
  });
}

export function exportPdf({ title, subtitle, instrumentId, matterName, sections, meta, disclaimer }) {
  const w = window.open("", "_blank", "width=900,height=1000");
  if (!w) return;
  const doc = w.document;
  const head = doc.head || doc.getElementsByTagName("head")[0];
  const body = doc.body;

  doc.title = title || "18th Green Atlas";
  const link = doc.createElement("link");
  link.rel = "stylesheet"; link.href = FONTS;
  head.appendChild(link);
  const style = doc.createElement("style");
  style.appendChild(doc.createTextNode(CSS));
  head.appendChild(style);

  const brand = el(doc, "div", "brand");
  brand.appendChild(el(doc, "span", "dot"));
  brand.appendChild(doc.createTextNode(" 18th Green Atlas · Fiduciary Relationship Management"));
  body.appendChild(brand);
  body.appendChild(el(doc, "h1", null, title || ""));
  body.appendChild(el(doc, "div", "sub", `${subtitle || ""}${matterName ? " · " + matterName : ""}`));
  body.appendChild(el(doc, "div", "id", instrumentId || ""));
  body.appendChild(el(doc, "div", "rule"));

  (sections || []).forEach((s) => {
    const sec = el(doc, "div", "sec");
    sec.appendChild(el(doc, "div", "h", s.h));
    sec.appendChild(el(doc, "div", "b", s.b));
    body.appendChild(sec);
  });

  if (meta && meta.length) {
    const table = doc.createElement("table");
    meta.forEach(([k, v]) => {
      const tr = doc.createElement("tr");
      tr.appendChild(el(doc, "td", "k", k));
      tr.appendChild(el(doc, "td", "v", v));
      table.appendChild(tr);
    });
    body.appendChild(table);
  }
  if (disclaimer) body.appendChild(el(doc, "div", "disc", disclaimer));

  const foot = el(doc, "div", "foot");
  foot.appendChild(el(doc, "span", null, `Generated ${new Date().toLocaleString()}`));
  foot.appendChild(el(doc, "span", null, "Functional Reference Experience · Synthetic data"));
  body.appendChild(foot);

  setTimeout(() => { try { w.focus(); w.print(); } catch (_) { /* popup closed */ } }, 400);
}
