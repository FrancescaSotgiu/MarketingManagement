/* Shared site settings and helpers.
   To add a page: copy page-template.html, rename it, and add one line to "pages" below. */
window.SITE = {
  name: "Marketing Management",
  course: "Marketing Management - F. Sotgiu",
  cohort: "Supplementary Material Fall 2026",
  website: "https://francescasotgiu.com",
  pages: [
    { href: "./", label: "Home", desc: "Start here." },
    { href: "news.html", label: "In the news", desc: "Nine short cases from this term's news, each ending with one question to discuss." },
    { href: "six-decisions.html", label: "Six decisions", desc: "The slides of the six cases from Lectures 1 to 3." },
    { href: "https://francescasotgiu.com/tools/marketing-decision-studio/", label: "Decision Studio", external: true, desc: "Work through a real marketing decision step by step, from the environment to the marketing mix and its outcomes." },
    { href: "quizzes.html", label: "Quizzes", desc: "Test yourself before and after each lecture." }
  ],
  practice: {
    title: "Marketing Decision Studio",
    desc: "Work through a real marketing decision step by step: frame the decision, analyse the environment, market and firm, choose the marketing mix and weigh short- and long-run outcomes. Your answers stay in your browser.",
    cta: "Open the Decision Studio",
    url: "https://francescasotgiu.com/tools/marketing-decision-studio/"
  },
  quizzes: [
    { id: "intro", title: "Quiz 1: Marketing basics", lecture: "L1",
      desc: "Eight theory questions, then three real-world case studies with a full analysis.",
      url: "https://francescasotgiu.github.io/MarketingIntroQuizz/" },
    { id: "intro2", title: "Quiz 2: Markets, value and strategy", lecture: "L1",
      desc: "Thirteen concept questions on markets, value and strategy, then two application cases.",
      url: "https://francescasotgiu.github.io/MarketingQuizz2/" },
    { id: "l2a", title: "Quiz 3: Products and brands", lecture: "L2",
      desc: "Ten concept questions on products, brands and the product life cycle, then five NovaBrew cases.",
      url: "https://francescasotgiu.github.io/MarketingQuizz3/" },
    { id: "exam", title: "Practice exam: the 4 Ps", lecture: "L2–L3",
      desc: "Two-hour open-book exam in six sections, from product to integration, with model answers after each question.",
      url: "https://francescasotgiu.github.io/MarketingPracticeExam/" },
    { id: "advanced", title: "Advanced practice exam: Kern", lecture: "L1–L3",
      desc: "Eight case questions on a chain of physiotherapy and wellness centres: segmentation, membership pricing, customer value, campaign results and channels.",
      url: "https://francescasotgiu.github.io/MarketingAdvancedPracticeExam/" }
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
  S.practiceBox = function () {
    const p = S.practice;
    if (!p) return "";
    return `<aside class="practice-box" aria-label="Further practice">
      <div class="practice-text">
        <span class="label">Further practice</span>
        <h2>${esc(p.title)}</h2>
        <p>${esc(p.desc)}</p>
      </div>
      <a class="btn primary" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.cta)}</a>
    </aside>`;
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
        `<a href="${p.href}"${p.href === here ? ' aria-current="page"' : ""}${p.external ? ' target="_blank" rel="noopener"' : ""}>${esc(p.label)}</a>`).join("")}<a href="${S.website}" target="_blank" rel="noopener">francescasotgiu.com ↗</a></nav>
    </div></header>`;
  }
  function footer() {
    return `<footer class="site-footer"><div class="wrap"><span>${esc(S.course)} · <a href="${S.website}" target="_blank" rel="noopener">francescasotgiu.com</a></span><span>${esc(S.cohort)}</span></div></footer>`;
  }
  document.addEventListener("DOMContentLoaded", () => {
    const h = document.getElementById("site-header");
    const f = document.getElementById("site-footer");
    if (h) h.outerHTML = header();
    if (f) f.outerHTML = footer();
  });
})();
