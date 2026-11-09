const $ = (s) => document.querySelector(s);
// ---------------- מקור הנתונים ----------------
// שני מצבים: שרת (api.py במחשב) או אתר סטטי (GitHub Pages) שבו כל הנתונים בקובץ אחד.
const API = window.STATIC_DATA ? makeStaticApi(window.STATIC_DATA) : {
  ready: async () => {},
  chains: async () => (await fetch("/api/chains")).json(),
  categories: async () => (await fetch("/api/categories")).json(),
  browse: async (q) => (await fetch(`/api/browse?${new URLSearchParams(q)}`)).json(),
  search: async (q) => (await fetch(`/api/search?q=${encodeURIComponent(q)}`)).json(),
  basket: async (items) => (await fetch("/api/basket", { method: "POST",
    headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) })).json(),
  image: (p, code) => `/api/image/${code}`,
  altImage: () => "",
};

function makeStaticApi(url) {
  let D = null, P = [], BY = new Map();
  const FIN = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" };
  const DROP = new Set(["במשקל", "משקל", "ארוז", "ארוזה", "בתפזורת", "תפזורת", "טרי", "טריה", "טריים", "קג", 'ק"ג', "לקג"]);
  // זהה ל-db._norm_name בפייתון: "עגבניות במשקל" -> "עגבני"
  const norm = (name) => String(name || "").replace(/[^\p{L}\p{N}\s_]/gu, " ").split(/\s+/).filter(Boolean).map(w => {
    w = w.replace(/[ךםןףץ]/g, ch => FIN[ch]);
    if (DROP.has(w) || /^\d+$/.test(w) || w.length < 2) return "";
    for (const suf of ["ות", "ימ", "ה"]) if (w.length > 3 && w.endsWith(suf)) { w = w.slice(0, -suf.length); break; }
    return w;
  }).filter(Boolean).join(" ");
  const eff = (pr, qty = 1) => {
    const promo = pr.promo, mq = pr.promo_min_qty || 1;
    if (promo && promo < pr.price && qty >= mq) {
      if (mq > 1 && qty % mq) { const full = Math.floor(qty / mq) * mq; return (full * promo + (qty - full) * pr.price) / qty; }
      return promo;
    }
    return pr.price;
  };
  function build(row) {
    const [barcode, name, maker, quantity, unit, di, gi, img, list] = row;
    const prices = {};
    for (const [ci, price, promo, mq, descI, club] of list) {
      const key = D.chains[ci].key;
      prices[key] = { price, promo, promo_min_qty: mq, promo_desc: descI >= 0 ? D.strings[descI] : null, club };
      prices[key].effective = eff(prices[key]);
    }
    const vals = Object.values(prices).map(v => v.effective);
    const low = Math.min(...vals), high = Math.max(...vals);
    const n = vals.length;
    return { barcode, name, manufacturer: maker, quantity, unit, dept: D.depts_names[di], grp: D.grp_names[gi], img, prices, n,
      low, saving: high - low, cheapest: n > 1 ? Object.keys(prices).filter(k => Math.abs(prices[k].effective - low) < 0.005) : [] };
  }
  return {
    ready: async () => {
      D = await (await fetch(url)).json();
      P = D.p.map(build);
      P.forEach(p => BY.set(p.barcode, p));
    },
    chains: async () => D.chains,
    categories: async () => D.depts,
    browse: async ({ dept, grp, sort, multi, offset, limit }) => {
      let list = P.filter(p => p.dept === dept && (!grp || p.grp === grp) && (!multi || p.n >= 2));
      const byName = (a, b) => a.name.localeCompare(b.name, "he");
      const sorts = {
        popular: (a, b) => b.n - a.n || a.name.length - b.name.length || byName(a, b),
        saving: (a, b) => (b.n >= 2) - (a.n >= 2) || b.saving - a.saving || byName(a, b),
        cheap: (a, b) => a.low - b.low || byName(a, b),
        name: byName,
      };
      list.sort(sorts[sort] || sorts.popular);
      return { total: list.length, items: list.slice(offset, offset + limit) };
    },
    search: async (q) => {
      q = q.trim();
      if (/^\d+$/.test(q)) { const p = BY.get(q.replace(/^0+/, "")); return p ? [p] : []; }
      const words = q.split(/\s+/);
      const nw = words.map(w => norm(w) || w);
      const list = P.filter(p => words.every((w, i) => p.name.includes(w) || (p.manufacturer || "").includes(w) ||
        (p.barcode.startsWith("produce:") && p.barcode.includes(nw[i]))));
      const first = words[0], pfirst = "produce:" + norm(first);
      const top = (p) => p.name.startsWith(first) || p.barcode.startsWith(pfirst);
      list.sort((a, b) => top(b) - top(a) || b.n - a.n || a.name.length - b.name.length);
      return list.slice(0, 40);
    },
    basket: async (items) => {
      const r = Object.fromEntries(D.chains.map(c => [c.key, { total: 0, missing: [] }]));
      for (const [bc, qty] of Object.entries(items)) {
        const p = BY.get(bc);
        for (const c of D.chains) {
          const pr = p && p.prices[c.key];
          if (!pr) { r[c.key].missing.push(bc); continue; }
          r[c.key].total += eff(pr, qty) * qty;
        }
      }
      for (const k in r) r[k].total = Math.round(r[k].total * 100) / 100;
      return r;
    },
    image: (p, code) => p.img || `https://img.rami-levy.co.il/product/${code}/small.jpg`,
    altImage: (code) => `https://img.rami-levy.co.il/product/${code}/small.jpg`,
  };
}


let CHAINS = [];
let basket = load(); // { barcode: {name, qty} }

function load() { try { return JSON.parse(localStorage.getItem("basket")) || {}; } catch { return {}; } }
function save() { try { localStorage.setItem("basket", JSON.stringify(basket)); } catch {} }
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const ICONS = {
  "פירות ירקות ופיצוחים": "🥦", "חלב ביצים וסלטים": "🥛", "בשר עוף ודגים": "🍗", "משקאות ואלכוהול": "🥤",
  "אורגני ובריאות": "🌱", "קפוא ומצונן": "🧊", "שימורים בישול ואפיה": "🥫", "קטניות ודגנים": "🍝",
  "חטיפים ומתוקים": "🍫", "אחזקת הבית ובע\"ח": "🧽", "נייר וחד פעמי": "🧻", "פארם ותינוקות": "🧴",
  "לחם ומאפים טריים": "🍞", "אחר": "📦",
};
// צבע לכל מחלקה
const TINTS = {
  "פירות ירקות ופיצוחים": "#2E9E5B", "חלב ביצים וסלטים": "#2F80C9", "בשר עוף ודגים": "#D6455D", "משקאות ואלכוהול": "#E8833A",
  "אורגני ובריאות": "#7A9A2E", "קפוא ומצונן": "#2BA3BF", "שימורים בישול ואפיה": "#C2502E", "קטניות ודגנים": "#B98A1E",
  "חטיפים ומתוקים": "#8E4FC2", "אחזקת הבית ובע\"ח": "#178A8A", "נייר וחד פעמי": "#5B6E8C", "פארם ותינוקות": "#D2559A",
  "לחם ומאפים טריים": "#B7742A", "אחר": "#6B7280",
};
let DEPTS = [];
// מצב התצוגה: חיפוש או עיון בקטגוריה
const view = { mode: "home", dept: "", grp: "", offset: 0, total: 0, seq: 0 };
const PAGE = 40;

async function init() {
  applyStaticText();
  await API.ready();
  CHAINS = (await API.chains()).map(c => ({ ...c, name: tchain(c) }));
  $("#chains").innerHTML = CHAINS.map(c => {
    const at = c.updated ? new Date(c.updated.at.replace(" ", "T")) : null;
    const when = at && !isNaN(at) ? fmtDate(at) : "";
    return `<span class="chain-pill" style="--chain:${c.color}"><span class="dot"></span><b>${esc(c.name)}</b>
      <span class="pill-meta">${c.updated ? t("pill", { n: fmtNum(c.updated.items), when }) : t("pill_none")}</span></span>`;
  }).join("");
  renderBasket();
  try { DEPTS = await API.categories(); } catch { DEPTS = []; }
  renderDepts();
  if (!DEPTS.length) $("#depts").innerHTML = `<p class="meta">${t("no_depts")}</p>`;
  const saved = (() => { try { return JSON.parse(sessionStorage.getItem("view") || "null"); } catch { return null; } })();
  if (saved && saved.dept && DEPTS.some(d => d.dept === saved.dept)) openDept(saved.dept, saved.grp || "");
}

function renderDepts() {
  $("#depts").innerHTML = DEPTS.map(d => `
    <button class="dept ${view.mode === "browse" && view.dept === d.dept ? "on" : ""}" data-dept="${esc(d.dept)}"
      style="--tint:${TINTS[d.dept] || "#6B7280"}" aria-pressed="${view.mode === "browse" && view.dept === d.dept}">
      <span class="ico" aria-hidden="true">${ICONS[d.dept] || "🛒"}</span>
      <span class="dname">${esc(tc(d.dept))}</span>
      <span class="dcount">${t("dcount", { n: fmtNum(d.multi) })}</span>
    </button>`).join("");
}

$("#depts").addEventListener("click", (e) => {
  const b = e.target.closest(".dept");
  if (b) openDept(b.dataset.dept, "");
});
$("#groups").addEventListener("click", (e) => {
  const b = e.target.closest(".chip");
  if (b) openDept(view.dept, b.dataset.grp);
});
$("#crumbs").addEventListener("click", (e) => {
  if (e.target.closest("[data-home]")) goHome();
  if (e.target.closest("[data-dept-all]")) openDept(view.dept, "");
});
$("#sort").addEventListener("change", () => view.mode === "browse" && loadBrowse(true));
$("#multi").addEventListener("change", () => view.mode === "browse" && loadBrowse(true));
$("#more").addEventListener("click", () => loadBrowse(false));

function remember() {
  try { sessionStorage.setItem("view", JSON.stringify({ dept: view.dept, grp: view.grp })); } catch {}
}

function goHome() {
  Object.assign(view, { mode: "home", dept: "", grp: "" });
  remember();
  $("#q").value = "";
  ["#crumbs", "#groups", "#toolbar", "#more"].forEach(s => $(s).hidden = true);
  $("#results").innerHTML = EMPTY_HOME;
  renderDepts();
}

function openDept(dept, grp) {
  Object.assign(view, { mode: "browse", dept, grp });
  remember();
  $("#q").value = "";
  const d = DEPTS.find(x => x.dept === dept);
  renderDepts();
  $("#crumbs").hidden = false;
  $("#crumbs").style.setProperty("--tint", TINTS[dept] || "#6B7280");
  const sep = `<span aria-hidden="true">${LANG === "fr" ? "›" : "‹"}</span>`;
  $("#crumbs").innerHTML = `<a href="#" data-home>${t("all_depts")}</a>${sep}` +
    (grp ? `<a href="#" data-dept-all>${esc(tc(dept))}</a>${sep}<b>${esc(tc(grp))}</b>`
         : `<b><span aria-hidden="true">${ICONS[dept] || ""}</span> ${esc(tc(dept))}</b>`);
  $("#groups").hidden = !d;
  if (d) {
    $("#groups").style.setProperty("--tint", TINTS[dept] || "#6B7280");
    $("#groups").innerHTML = `<button class="chip ${grp ? "" : "on"}" data-grp="" aria-pressed="${!grp}">${t("all")}</button>` +
      d.groups.filter(g => g.multi > 0 || g.grp === grp).map(g =>
        `<button class="chip ${g.grp === grp ? "on" : ""}" data-grp="${esc(g.grp)}" aria-pressed="${g.grp === grp}">${esc(tc(g.grp))}
        <small>${fmtNum(g.multi)}</small></button>`).join("");
  }
  $("#toolbar").hidden = false;
  loadBrowse(true);
  document.querySelector(".layout").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function loadBrowse(reset) {
  if (reset) { view.offset = 0; $("#results").innerHTML = SKELETON; }
  const seq = ++view.seq;
  const res = await API.browse({ dept: view.dept, grp: view.grp, sort: $("#sort").value,
    multi: $("#multi").checked, offset: view.offset, limit: PAGE });
  if (seq !== view.seq) return;
  view.total = res.total;
  const html = res.items.map(productCard).join("");
  if (reset) $("#results").innerHTML = html || `<div class="empty"><p class="empty-title">${t("empty_cat_title")}</p>
    <p>${esc(t("empty_cat"))}</p></div>`;
  else $("#results").insertAdjacentHTML("beforeend", html);
  view.offset += res.items.length;
  $("#count-label").textContent = t("count", { n: fmtNum(res.total) });
  $("#more").textContent = t("more_n", { n: fmtNum(res.total - view.offset) });
  $("#more").hidden = view.offset >= res.total;
}

let timer, searchSeq = 0;
$("#q").addEventListener("input", (e) => {
  clearTimeout(timer);
  const q = e.target.value.trim();
  if (q.length < 2) { if (view.mode === "search") goHome(); return; }
  timer = setTimeout(() => search(q), 250);
});

async function search(q) {
  const seq = ++searchSeq;
  Object.assign(view, { mode: "search", dept: "", grp: "" });
  renderDepts();
  ["#crumbs", "#groups", "#toolbar", "#more"].forEach(s => $(s).hidden = true);
  $("#results").innerHTML = SKELETON;
  const res = await API.search(q);
  if (seq !== searchSeq) return; // הגיעה תשובה לחיפוש ישן
  if (!res.length) { $("#results").innerHTML = `<div class="empty"><p class="empty-title">${esc(t("not_found_title", { q }))}</p>
    <p>${esc(t("not_found"))}</p></div>`; return; }
  $("#results").innerHTML = res.map(productCard).join("");
}

function priceCell(p, c) {
  const pr = p.prices[c.key];
  if (!pr) return `<div class="price na" style="--chain:${c.color}"><span class="chain">${esc(c.name)}</span>
    <span class="na-text">${t("not_sold")}</span></div>`;
  const best = (p.cheapest || []).includes(c.key);
  const hasPromo = pr.promo && pr.promo < pr.price;
  const multi = hasPromo && (pr.promo_min_qty || 1) > 1; // מבצע כמות - המחיר הרגיל נשאר המחיר הראשי
  const label = `${c.name}: ${nis(pr.effective)}${best ? ", " + t("cheapest") : ""}${hasPromo ? ", " + (pr.promo_desc || t("sale")) : ""}`;
  return `<div class="price ${best ? "best" : ""} ${hasPromo ? "on-sale" : ""}" style="--chain:${c.color}" aria-label="${esc(label)}">
    <span class="chain">${esc(c.name)}</span>
    ${best ? `<span class="badge">${t("cheapest")}</span>` : ""}
    <b class="amount">${nis(pr.effective)}</b>
    ${hasPromo && !multi ? `<s class="strike">${nis(pr.price)}</s>` : ""}
    ${hasPromo ? `<span class="promo"><span class="promo-tag">${t("sale")}</span> <span lang="he" dir="rtl">${esc(pr.promo_desc || "")}</span></span>` : ""}
    ${pr.club ? `<span class="club">${t("club", { p: nis(pr.club) })}</span>` : ""}
  </div>`;
}

function productCard(p) {
  const produce = p.barcode.startsWith("produce:");
  const code = p.barcode.split(":").pop();
  const maker = p.manufacturer ? `<span class="maker" lang="he">${esc(p.manufacturer)}</span>` : "";
  const unit = /לא ידוע|^0$/.test(p.unit || "") ? "" : tunit(p.unit || "");
  const size = p.quantity && !produce ? `${+p.quantity} ${esc(unit)}`.trim() : "";
  const meta = produce ? `<span>${t("by_weight")}</span>`
    : [size && `<span>${size}</span>`, `<span class="code" title="${t("barcode")}">${esc(code)}</span>`].filter(Boolean).join("");
  const initial = esc((p.manufacturer || p.name || "?").trim().charAt(0));
  const img = produce || !/^\d+$/.test(code)
    ? `<div class="thumb ph" aria-hidden="true">${produce ? "🥬" : initial}</div>`
    : `<div class="thumb"><img loading="lazy" alt="" src="${API.image(p, code)}" data-alt="${API.altImage(code)}"
         onerror="if (this.dataset.alt && this.src !== this.dataset.alt) { this.src = this.dataset.alt; this.dataset.alt = ''; } else { this.parentNode.classList.add('ph'); this.parentNode.textContent='${initial}'; }"></div>`;
  const inBasket = basket[p.barcode]?.qty;
  return `<article class="product">
    <div class="product-head">
      ${img}
      <div class="info">${maker}<h3 lang="he" dir="rtl">${esc(p.name)}</h3><div class="meta">${meta}</div></div>
      <button class="add ${inBasket ? "in" : ""}" data-bc="${esc(p.barcode)}" data-name="${esc(p.name)}"
        aria-label="${esc(t("add_aria", { name: p.name }))}">${inBasket ? t("in_basket", { n: inBasket }) : t("add")}</button>
    </div>
    <div class="price-row">${CHAINS.map(c => priceCell(p, c)).join("")}</div>
  </article>`;
}

const EMPTY_HOME = `<div class="empty"><p class="empty-title">${t("empty_home_title")}</p>
  <p>${t("empty_home")}</p></div>`;
const SKELETON = Array.from({ length: 3 }, () => `<div class="product skeleton" aria-hidden="true">
  <div class="product-head"><div class="thumb"></div><div class="info"><i></i><i></i></div></div>
  <div class="price-row"><i></i><i></i><i></i></div></div>`).join("") + `<span class="sr-only">${t("loading")}</span>`;

$("#results").addEventListener("click", (e) => {
  const b = e.target.closest(".add");
  if (b) add(b.dataset.bc, b.dataset.name, b);
});
$("#basket-items").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-d]");
  if (b) change(b.dataset.bc, +b.dataset.d);
});

function add(bc, name, btn) {
  basket[bc] = { name, qty: (basket[bc]?.qty || 0) + 1 };
  save(); renderBasket();
  if (btn) {
    btn.classList.add("in", "pop");
    btn.textContent = t("in_basket", { n: basket[bc].qty });
    setTimeout(() => btn.classList.remove("pop"), 400);
  }
  const count = $("#count");
  count.classList.remove("bump"); void count.offsetWidth; count.classList.add("bump");
}
function change(bc, d) { if (!basket[bc]) return; basket[bc].qty += d; if (basket[bc].qty <= 0) delete basket[bc]; save(); renderBasket(); }
$("#basket-fab").onclick = () => document.querySelector(".basket").scrollIntoView({ behavior: "smooth" });
$("#clear").onclick = () => { basket = {}; save(); renderBasket(); };

async function renderBasket() {
  const keys = Object.keys(basket);
  const n = keys.reduce((s, k) => s + basket[k].qty, 0);
  $("#count").textContent = n;
  $("#fab-count").textContent = n;
  $("#basket-fab").hidden = !n;
  $("#clear").hidden = !keys.length;
  $("#basket-items").innerHTML = keys.map(bc => `<li><span class="b-name" lang="he" dir="rtl">${esc(basket[bc].name)}</span>
    <span class="qty"><button data-bc="${esc(bc)}" data-d="-1" aria-label="${esc(t("less", { name: basket[bc].name }))}">−</button>
    <output>${basket[bc].qty}</output>
    <button data-bc="${esc(bc)}" data-d="1" aria-label="${esc(t("more_of", { name: basket[bc].name }))}">+</button></span></li>`).join("");
  if (!keys.length) { $("#totals").innerHTML = `<p class="basket-empty">${t("basket_empty")}</p>`; return; }

  const items = Object.fromEntries(keys.map(k => [k, basket[k].qty]));
  const r = await API.basket(items);
  // הרשת הזולה ביותר מבין אלה שיש בהן את כל הסל
  const complete = CHAINS.filter(c => !r[c.key].missing.length);
  const low = Math.min(...complete.map(c => r[c.key].total));
  const high = Math.max(...complete.map(c => r[c.key].total));
  const bestKeys = complete.filter(c => Math.abs(r[c.key].total - low) < 0.005).map(c => c.key);
  const sorted = [...CHAINS].sort((a, b) => (r[a.key].missing.length - r[b.key].missing.length) || (r[a.key].total - r[b.key].total));
  const saving = complete.length > 1 ? high - low : 0;
  $("#totals").innerHTML = (saving >= 0.01 ? `<p class="saving">${t("saving", { p: nis(saving) })}</p>` : "") +
    sorted.map(c => `<div class="total ${bestKeys.includes(c.key) ? "best" : ""}" style="--chain:${c.color}">
    <span class="t-name">${esc(c.name)}${r[c.key].missing.length ? `<small>${t("missing", { n: r[c.key].missing.length })}</small>` : ""}</span>
    <span class="t-sum">${nis(r[c.key].total)}</span></div>`).join("");
}

init();
