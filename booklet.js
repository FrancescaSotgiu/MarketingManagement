/* Renders the booklet from window.BOOKLET (six-decisions.js) and provides Edit mode.
   Edits are kept in this browser only; "Export content file" gives you the updated data file to put on GitHub. */
(function () {
  const S = window.SITE, esc = S.esc;
  const KEY = "six-decisions-edits-v1";
  const original = JSON.parse(JSON.stringify(window.BOOKLET));
  let data = load() || JSON.parse(JSON.stringify(original));
  let editing = false;

  function load() {
    try { const t = localStorage.getItem(KEY); return t ? JSON.parse(t) : null; } catch (e) { return null; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); status("Saved in this browser. Export to publish."); }
    catch (e) { status("Too large to keep in this browser (big images). Export the content file now."); }
  }
  let saveTimer;
  const saveSoon = () => { clearTimeout(saveTimer); saveTimer = setTimeout(save, 400); };
  function status(t) { const el = document.getElementById("edit-status"); if (el) el.textContent = t; }

  const caseOf = (n) => data.cases.find((c) => c.n === n);

  /* ---------- slide frame ---------- */
  function slideHTML(s, i) {
    const num = i + 1;
    const logo = `<img class="s-logo" src="vu-logo.jpg" alt="">`;
    const foot = `<div class="s-foot"><span>${esc(data.date)}</span><span>${esc(data.footer)}</span><span>${num}</span></div>`;
    if (s.image && s.imageMode === "full") {
      return `<div class="slide k-image"><img class="s-full" src="${esc(s.image)}" alt="Slide ${num}"></div>`;
    }
    const side = s.image ? `<img class="s-side" src="${esc(s.image)}" alt="">` : "";
    const cls = `slide k-${s.kind}${s.image ? " has-side" : ""}`;
    let inner = "";
    if (s.kind === "cover") {
      inner = `<div class="c-title" data-edit="title">${esc(s.title)}</div><div class="c-sub" data-edit="subtitle">${esc(s.subtitle || "")}</div>`;
      return `<div class="${cls}">${logo}<div class="s-inner">${inner}</div>${side}</div>`;
    }
    if (s.kind === "quote") {
      inner = `<div class="q-head" data-edit="head">${esc(s.head)}</div>` +
        s.lines.map((l, j) => `<div class="q-line${s.big_second && j === 0 ? " big" : ""}" data-edit="lines.${j}">${esc(l)}</div>`).join("");
      return `<div class="${cls}">${logo}<div class="s-inner">${inner}</div>${side}</div>`;
    }
    if (s.kind === "columns") {
      inner = `<h3 data-edit="title">${esc(s.title)}</h3><div class="cols">${s.cols.map((c, j) => `
        <div class="col"><h4><span class="lec">${esc(c.lecture)}</span><a href="frameworks.html#${esc(c.fw)}" data-edit="cols.${j}.name">${esc(c.name)}</a></h4>
        <p data-edit="cols.${j}.text">${esc(c.text)}</p></div>`).join("")}</div>`;
    } else {
      inner = `<h3 data-edit="title">${esc(s.title)}</h3><ul>${(s.items || []).map((t, j) => `<li data-edit="items.${j}">${esc(t)}</li>`).join("")}</ul>`;
    }
    return `<div class="${cls}">${logo}<div class="s-inner">${inner}</div>${side}${foot}</div>`;
  }

  function speechHTML(s) {
    if (editing) return `<div class="speech" data-edit="speech">${esc(s.speech)}</div>`;
    return `<div class="speech"><p>${S.cite(s.speech)}</p></div>`;
  }

  function toolsHTML(s) {
    const shown = s.image && s.image.startsWith("data:") ? "(uploaded image)" : (s.image || "");
    return `<div class="img-tools" data-tools="${esc(s.id)}">
      <strong>Image</strong>
      <input type="text" id="img-${esc(s.id)}" placeholder="your-image.jpg" value="${esc(shown)}" aria-label="Image path">
      <label class="btn">Upload<input type="file" accept="image/*" data-upload></label>
      <select id="mode-${esc(s.id)}" data-mode aria-label="Image layout">
        <option value="side"${s.imageMode !== "full" ? " selected" : ""}>Next to the text</option>
        <option value="full"${s.imageMode === "full" ? " selected" : ""}>Replaces the slide</option>
      </select>
      <button class="btn" type="button" data-act="noimg">Remove image</button>
      <button class="btn" type="button" data-act="dup">Duplicate slide</button>
      <button class="btn" type="button" data-act="del">Delete slide</button>
    </div>`;
  }

  function blockHTML(s, i) {
    return `<section class="slide-block" id="${esc(s.id)}" data-slide="${i}">
      <div class="slide-no"><span class="label">Slide ${i + 1}</span><a href="#${esc(s.id)}" class="label" aria-label="Link to slide ${i + 1}">#</a></div>
      ${slideHTML(s, i)}
      ${toolsHTML(s)}
      ${speechHTML(s)}
    </section>`;
  }

  function caseExtras(n) {
    const c = caseOf(n), q = S.quiz(c.quiz);
    const prev = caseOf(n - 1), next = caseOf(n + 1);
    const real = (c.real || []).length ? `<div class="extra"><span class="label">In the real world</span>${c.real.map((r) =>
      `<p>${S.cite(r.text + " [[" + r.src + "]]")}</p>`).join("")}</div>` : "";
    return `<div class="case-extra">${q ? S.quizCard(q, { desc: `Practise the frameworks behind case ${n}. ${q.desc}` }) : ""}${real}</div>
      <nav class="case-nav" aria-label="Cases">
        ${prev ? `<a href="#c${prev.n}">← Case ${prev.n}: ${esc(prev.title)}</a>` : `<a href="#cover">← Introduction</a>`}
        ${next ? `<a href="#c${next.n}">Case ${next.n}: ${esc(next.title)} →</a>` : `<a href="#thread">Wrap-up →</a>`}
      </nav>`;
  }

  /* ---------- page ---------- */
  function groups() {
    const g = [{ id: "part-intro", label: "Introduction", sub: "How the cases work", slides: [] }];
    data.cases.forEach((c) => g.push({ id: `part-c${c.n}`, label: `Case ${c.n}`, sub: c.title, sector: c.sector, n: c.n, slides: [] }));
    g.push({ id: "part-wrap", label: "Wrap-up", sub: "The common thread", slides: [] });
    data.slides.forEach((s, i) => {
      const m = /^c(\d)/.exec(s.id);
      const wrap = /^(thread|steps)/.test(s.id);
      const target = m ? g.find((x) => x.n === +m[1]) : wrap ? g[g.length - 1] : g[0];
      (target || g[0]).slides.push([s, i]);
    });
    return g;
  }

  function render() {
    const g = groups();
    document.getElementById("toc-list").innerHTML = g.map((p, k) =>
      `<li><a href="#${p.slides[0] ? esc(p.slides[0][0].id) : p.id}" data-part="${p.id}" title="${esc(p.sub)}"><span class="n">${k === 0 ? "In" : k === g.length - 1 ? "Wr" : p.n}</span><span>${esc(p.n ? "Case " + p.n : p.label)}</span></a></li>`).join("") +
      `<li><a href="#sources-list" data-part="sources"><span class="n">§</span><span>Sources</span></a></li>`;
    document.getElementById("parts").innerHTML = g.map((p) => `
      <div class="part" id="${p.id}">
        <div class="part-head"><span class="label">${esc(p.n ? `Case ${p.n} · ${p.sector}` : p.label)}</span><h2>${esc(p.sub)}</h2></div>
        ${p.slides.map(([s, i]) => blockHTML(s, i) + (/^c\d-frameworks$/.test(s.id) ? caseExtras(+s.id[1]) : "")).join("")}
        ${p.id === "part-wrap" ? S.practiceBox() : ""}
      </div>`).join("");
    S.renderSources(document.getElementById("sources-list"));
    document.querySelectorAll("[data-edit]").forEach((el) => { el.contentEditable = editing ? "true" : "false"; });
    watchToc();
  }

  let observer;
  function watchToc() {
    if (observer) observer.disconnect();
    if (!("IntersectionObserver" in window)) return;
    const links = [...document.querySelectorAll("#toc-list a")];
    observer = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => { const on = a.dataset.part === en.target.id; a.classList.toggle("active", on); if (on && a.parentElement.parentElement.scrollWidth > a.parentElement.parentElement.clientWidth) a.parentElement.parentElement.scrollTo({ left: a.offsetLeft - 40, behavior: "smooth" }); });
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    document.querySelectorAll(".part").forEach((p) => observer.observe(p));
  }

  /* ---------- editing ---------- */
  function setPath(obj, path, val) {
    const keys = path.split(".");
    let o = obj;
    for (let k = 0; k < keys.length - 1; k++) o = o[isNaN(keys[k]) ? keys[k] : +keys[k]];
    const last = keys[keys.length - 1];
    o[isNaN(last) ? last : +last] = val;
  }
  function slideOf(el) { const b = el.closest("[data-slide]"); return b ? +b.dataset.slide : -1; }
  function refreshFrame(i) {
    const block = document.querySelector(`[data-slide="${i}"]`);
    const tmp = document.createElement("div"); tmp.innerHTML = slideHTML(data.slides[i], i);
    block.querySelector(".slide").replaceWith(tmp.firstElementChild);
    block.querySelectorAll(".slide [data-edit]").forEach((el) => { el.contentEditable = "true"; });
  }

  function setEditing(on) {
    editing = on;
    document.body.classList.toggle("editing", on);
    const y = window.scrollY;
    render();
    window.scrollTo(0, y);
    status(on ? "Click any text on a slide or below it to change it." : "");
  }

  document.addEventListener("input", (e) => {
    const el = e.target.closest("[data-edit]");
    if (!el || !editing) return;
    const i = slideOf(el); if (i < 0) return;
    setPath(data.slides[i], el.dataset.edit, el.innerText.replace(/\n$/, ""));
    saveSoon();
  });
  document.addEventListener("change", (e) => {
    if (!editing) return;
    const i = slideOf(e.target); if (i < 0) return;
    const s = data.slides[i];
    if (e.target.matches("[data-upload]")) {
      const f = e.target.files[0]; if (!f) return;
      if (f.size > 1.5e6) status(`${f.name} is ${(f.size / 1e6).toFixed(1)} MB. For the website, put large images in img and type the path instead.`);
      const r = new FileReader();
      r.onload = () => { s.image = r.result; refreshFrame(i); document.getElementById(`img-${s.id}`).value = "(uploaded image)"; saveSoon(); };
      r.readAsDataURL(f);
    } else if (e.target.matches("[data-mode]")) {
      s.imageMode = e.target.value; refreshFrame(i); saveSoon();
    } else if (e.target.id === `img-${s.id}`) {
      const v = e.target.value.trim();
      if (v !== "(uploaded image)") { s.image = v; refreshFrame(i); saveSoon(); }
    }
  });
  document.addEventListener("click", (e) => {
    if (editing && e.target.closest(".slide a")) { e.preventDefault(); return; }
    const act = e.target.closest("[data-act]");
    if (act && editing) {
      const i = slideOf(act), s = data.slides[i];
      if (act.dataset.act === "noimg") { s.image = ""; refreshFrame(i); document.getElementById(`img-${s.id}`).value = ""; }
      if (act.dataset.act === "dup") {
        const copy = JSON.parse(JSON.stringify(s));
        let k = 2; while (data.slides.some((x) => x.id === `${s.id}-${k}`)) k++;
        copy.id = `${s.id}-${k}`;
        data.slides.splice(i + 1, 0, copy); render();
        document.getElementById(copy.id).scrollIntoView({ block: "start" });
      }
      if (act.dataset.act === "del") {
        if (act.dataset.armed) { data.slides.splice(i, 1); render(); }
        else { act.dataset.armed = "1"; act.textContent = "Click again to delete"; return; }
      }
      saveSoon();
    }
    const btn = e.target.closest("button"); const id = btn ? btn.id : "";
    if (id === "edit-toggle") setEditing(!editing);
    if (id === "edit-done") setEditing(false);
    if (id === "edit-export") openExport();
    if (id === "edit-reset") {
      const b = btn;
      if (!b.dataset.armed) { b.dataset.armed = "1"; b.textContent = "Click again to discard all edits"; return; }
      try { localStorage.removeItem(KEY); } catch (err) {}
      data = JSON.parse(JSON.stringify(original)); delete b.dataset.armed; b.textContent = "Discard edits"; render(); status("Back to the published version.");
    }
    if (id === "export-close" || e.target.id === "export-panel") document.getElementById("export-panel").hidden = true;
    if (id === "export-copy") {
      const ta = document.getElementById("export-text");
      const done = () => { btn.textContent = "Copied"; };
      (navigator.clipboard ? navigator.clipboard.writeText(ta.value) : Promise.reject()).then(done, () => { ta.select(); btn.textContent = "Selected: press Ctrl/Cmd+C"; });
    }
    if (id === "export-download") {
      const blob = new Blob([document.getElementById("export-text").value], { type: "text/javascript" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "six-decisions.js";
      document.body.appendChild(a); a.click(); a.remove();
    }
  });

  function fileText() {
    return `/* Booklet content: Six marketing decisions.
   Edit text here, or use Edit mode on the page and paste the exported file over this one.
   Per slide: "image" is a path such as my-photo.jpg; "imageMode" is "side" (next to the text) or "full" (replaces the slide).
   Cite a source in a speech with [[id]] from sources.js. */
window.BOOKLET = ${JSON.stringify(data, null, 1)};
`;
  }
  function openExport() {
    document.getElementById("export-text").value = fileText();
    document.getElementById("export-copy").textContent = "Copy";
    document.getElementById("export-panel").hidden = false;
  }

  document.addEventListener("DOMContentLoaded", () => {
    render();
    if (load()) status("You have unpublished edits in this browser.");
    if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) setTimeout(() => t.scrollIntoView(), 50); }
  });
})();
