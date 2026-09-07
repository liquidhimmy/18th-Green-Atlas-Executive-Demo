// Print-to-PDF: opens a clean, audit-styled window and triggers the browser print dialog (Save as PDF).
export function exportPdf({ title, subtitle, instrumentId, matterName, sections, meta, disclaimer }) {
  const w = window.open("", "_blank", "width=900,height=1000");
  if (!w) return;
  const sectionHtml = (sections || []).map(
    (s) => `<div class="sec"><div class="h">${s.h}</div><div class="b">${s.b}</div></div>`
  ).join("");
  const metaHtml = (meta || []).map(
    ([k, v]) => `<tr><td class="k">${k}</td><td class="v">${v}</td></tr>`
  ).join("");
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"/><title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Hanken+Grotesk:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet"/>
  <style>
    *{box-sizing:border-box} body{font-family:'Hanken Grotesk',sans-serif;color:#14202b;margin:0;padding:48px 56px;background:#fff}
    .brand{display:flex;align-items:center;gap:10px;color:#0F5C4D;font-size:12px;letter-spacing:.16em;text-transform:uppercase}
    .dot{width:26px;height:26px;border-radius:50%;background:#072B24;border:2px solid #19C37D}
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
    @media print{body{padding:28px 34px}}
  </style></head><body>
    <div class="brand"><span class="dot"></span> 18th Green Atlas · Fiduciary Relationship Management</div>
    <h1>${title}</h1>
    <div class="sub">${subtitle || ""}${matterName ? " · " + matterName : ""}</div>
    <div class="id">${instrumentId || ""}</div>
    <div class="rule"></div>
    ${sectionHtml}
    ${metaHtml ? `<table>${metaHtml}</table>` : ""}
    ${disclaimer ? `<div class="disc">${disclaimer}</div>` : ""}
    <div class="foot"><span>Generated ${new Date().toLocaleString()}</span><span>Functional Reference Experience · Synthetic data</span></div>
    <script>window.onload=function(){setTimeout(function(){window.print();},350);}<\/script>
  </body></html>`);
  w.document.close();
}
