/* Shared site settings and helpers.
   To add a page: copy page-template.html, rename it, and add one line to "pages" below. */
window.SITE = {
  name: "Marketing Management",
  course: "Marketing Management - F. Sotgiu",
  cohort: "Premaster MSc BA · VU for Professionals · Fall 2026",
  pages: [
    { href: "./", label: "Home", desc: "Start here." },
    { href: "six-decisions.html", label: "Six decisions", desc: "The case booklet for Lectures 1 to 3: every slide with its explanation, linked to the frameworks and the quizzes." },
    { href: "frameworks.html", label: "Frameworks", desc: "The course frameworks in one place, by lecture, with the cases that use them." },
    { href: "quizzes.html", label: "Quizzes", desc: "Test yourself before and after each lecture." }
  ],
  quizzes: [
    { id: "intro", title: "Marketing Mastery", lecture: "L1",
      desc: "Warm-up game: theory questions on the marketing mix and segmentation, then three short cases.",
      url: "https://francescabds.github.io/Marketing-Intro-Quizz/" },
    { id: "intro2", title: "Markets, value and strategy", lecture: "L1",
      desc: "Thirteen concept questions on needs, market offerings, value and strategy, then two application cases.",
      url: "https://francescabds.github.io/Marketing-Intro-Quizz-2/" },
    { id: "l2a", title: "Products and brands", lecture: "L2",
      desc: "Ten concept questions on product levels, product mix and brand equity, then a five-question case.",
      url: "https://francescabds.github.io/Marketing-L2a-Quiz/" },
    { id: "exam", title: "4Ps practice exam", lecture: "L2–L3",
      desc: "Open questions on product, price, place and promotion with model answers after each question.",
      url: "https://francescabds.github.io/Marketing-Exam/" }
  ]
};

(function () {
  const S = window.SITE;
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  S.esc = esc;

  function currentPage() {
    const last = location.pathname.split("/").pop();
    return last && last.endsWith(".html") && last !== "index.html" ? last : "./";
  }
  S.currentPage = currentPage;

  /* Quizzes open inline only where the browser allows it: on GitHub Pages or from your own computer. */
  S.canEmbed = () => /github\.io$/.test(location.hostname) || location.protocol === "file:" || location.hostname === "localhost";
  S.quiz = (id) => S.quizzes.find((q) => q.id === id);

  /* Citations: [[id]] in any text becomes a numbered link to the page's source list. */
  const cited = [];
  S.cite = function (text) {
    return esc(text).replace(/\s?\[\[([a-z0-9-]+)\]\]/g, (m, id) => {
      if (!window.SOURCES || !window.SOURCES[id]) return "";
      let n = cited.indexOf(id);
      if (n < 0) { cited.push(id); n = cited.length - 1; }
      return `<sup class="cite"><a href="#src-${id}" title="${esc(window.SOURCES[id].text)}">[${n + 1}]</a></sup>`;
    });
  };
  S.renderSources = function (el) {
    if (!el) return;
    if (!cited.length) { el.hidden = true; return; }
    el.innerHTML = `<h2 style="font-size:28px">Sources</h2><ol>${cited.map((id) => {
      const s = window.SOURCES[id];
      const link = s.url ? ` <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url.replace(/^https?:\/\//, "").split("/")[0])}</a>` : "";
      return `<li id="src-${id}">${esc(s.text)}${link}</li>`;
    }).join("")}</ol>`;
  };

  S.quizCard = function (q, opts = {}) {
    const embed = S.canEmbed();
    const id = `qf-${q.id}-${Math.random().toString(36).slice(2, 7)}`;
    return `<div class="quiz-card">
      <span class="label">Quiz · ${esc(q.lecture)}</span>
      <h3>${esc(q.title)}</h3>
      <p>${esc(opts.desc || q.desc)}</p>
      <div class="actions">
        ${embed ? `<button class="btn primary" type="button" data-embed="${id}" data-url="${esc(q.url)}">Take it here</button>` : ""}
        <a class="btn${embed ? "" : " primary"}" href="${esc(q.url)}" target="_blank" rel="noopener">Open in a new tab</a>
      </div>
      <div id="${id}"></div>
    </div>`;
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-embed]");
    if (!b) return;
    const box = document.getElementById(b.dataset.embed);
    if (box.firstChild) { box.innerHTML = ""; b.textContent = "Take it here"; return; }
    box.innerHTML = `<iframe class="quiz-frame" src="${b.dataset.url}" title="Quiz" loading="lazy"></iframe>`;
    b.textContent = "Close quiz";
  });

  function header() {
    const here = currentPage();
    return `<header class="site-header"><div class="wrap">
      <a class="brand" href="./"><img src="vu-logo.jpg" alt="Vrije Universiteit Amsterdam"><span>${esc(S.name)}</span></a>
      <nav class="site-nav" aria-label="Site">${S.pages.map((p) =>
        `<a href="${p.href}"${p.href === here ? ' aria-current="page"' : ""}>${esc(p.label)}</a>`).join("")}</nav>
    </div></header>`;
  }
  function footer() {
    return `<footer class="site-footer"><div class="wrap"><span>${esc(S.course)}</span><span>${esc(S.cohort)}</span></div></footer>`;
  }
  document.addEventListener("DOMContentLoaded", () => {
    const h = document.getElementById("site-header");
    const f = document.getElementById("site-footer");
    if (h) h.outerHTML = header();
    if (f) f.outerHTML = footer();
  });
})();
