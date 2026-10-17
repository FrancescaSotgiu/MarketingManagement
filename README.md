# Marketing Management course site

Static site for GitHub Pages. No build step: upload the folder to a repository and turn on Pages (Settings → Pages → Deploy from branch → main / root).

## Pages

| File | What it is |
|---|---|
| `index.html` | Home (linked as `./`): links to every page and all quizzes |
| `six-decisions.html` | The case booklet: 36 slides with the explanation under each, framework links, quizzes per case, sources |
| `frameworks.html` | The course frameworks by lecture, linked to the cases and quizzes |
| `quizzes.html` | All quizzes. On GitHub Pages they open inside the page; elsewhere they open in a new tab |
| `page-template.html` | Starting point for a new page |

## Add a page

1. Copy `page-template.html` and rename it, for example `lecture-2.html`.
2. Change the `<title>` and the content.
3. Add one line to `pages` in `site.js`:
   `{ href: "lecture-2.html", label: "Lecture 2", desc: "One sentence for the home page." },`

The menu and the home page update automatically.

## Change slides, text and images

**On the page (easiest):** open `six-decisions.html`, click **Edit slides**. Click any text on a slide or in the explanation to change it. Under each slide you can type an image path, upload an image, choose whether it sits next to the text or replaces the whole slide, duplicate a slide or delete it. Edits stay in your browser until you click **Export content file** and replace `six-decisions.js` in the repository with the exported text.

**In the file:** edit `six-decisions.js` directly. Each slide has `title`, `items` or `lines`, `speech`, `image` and `imageMode` (`"side"` or `"full"`).

To use your own slide images (for example exported from PowerPoint as PNG): put them in `` and set `"image": "slide-07.png", "imageMode": "full"`.

## Add a quiz

Add an entry to `quizzes` in `site.js` with an `id`, `title`, `lecture`, `desc` and `url`. Link a case to it with `"quiz": "<id>"` in the `cases` list of `six-decisions.js`, or a framework with `quiz` in `frameworks.js`.

## Cite a source

Add the source to `sources.js`, then write `[[id]]` in any speech, framework or case text. The page numbers the citations and lists the sources at the bottom.

## Mini cases in the news

`news.html` shows the cases in `news-cases.js`. To add a case, copy one block in that file, change the number, title, text ("p" for facts, "q" for the question) and sources.
