# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog (blog.jayinnn.dev) built with **Hugo v0.167.0 (extended)**, using a modified **Archie** theme. Content is primarily in Traditional Chinese (zh-tw). Deployed to GitHub Pages via GitHub Actions on push to `main`.

## Commands

- **Local dev server**: `hugo server -D` (serves drafts)
- **Production build**: `hugo --gc --minify --cleanDestinationDir`
- **Create new post**: `hugo new posts/my-post-name.md`
- **Create new diary**: `python3 write-diary.py` (auto-dates to today)

## Architecture

- `config.toml` — Site-wide Hugo configuration (theme, menus, social links, params)
- `content/posts/` — Blog posts (YAML frontmatter: title, date, description, tags, draft)
- `content/diaries/` — Date-named diary entries (YYYY-MM-DD.md)
- `content/image/` — Images organized in subdirectories, referenced via `{{<figure>}}` shortcode
- `layouts/` — Site-level overrides (e.g. `_default/search.json`); these take precedence over `themes/archie/layouts/`
- `themes/archie/` — Modified Archie theme with custom layouts and local fonts
  - `layouts/partials/head.html` — KaTeX math, Google Analytics, Microsoft Clarity
  - `layouts/partials/header.html` — Navigation, favicon, font loading
  - `layouts/partials/footer.html` — Copyright, social icons (Feather)
  - `static/css/` — `main.css`, `dark.css` (auto dark mode), `fonts.css`
- `archetypes/` — Templates for new content (`default.md`, `diaries.md`)

## Content Conventions

- Post frontmatter uses YAML (`---` delimiters) with fields: `title`, `date`, `description`, `tags`, `draft`
- About page (`content/about.md`) uses TOML frontmatter (`+++` delimiters)
- Images go in `content/image/<post-name>/` and are referenced as `{{<figure src="/image/..." title="...">}}`
- Math is rendered with KaTeX (use standard LaTeX syntax in markdown)
- Code blocks: Chroma with CSS classes (`noClasses = false`). Colours: `css/syntax.css` (github, light) and the github-dark block in `dark.css`, whose rules are prefixed with `.highlight` after a token reset so light colours never leak into dark mode — regenerate with `hugo gen chromastyles` and keep that prefix. Language label comes from `data-lang`; `js/code-copy.js` adds the copy button (skips line numbers). Fences go through `_markup/render-codeblock.html`: blocks of 5+ lines get line numbers automatically (override per block with `{linenos=false}` / `{linenos=true}`, highlight lines with `hl_lines=[3]`; `lineNumbersInTable = false`), and languages Chroma lacks are aliased there (```` ```processing ```` → Java rules, "processing" label). It highlights `Inner + "\n"` like Hugo's own renderer — without the newline a `//` comment on the last line isn't recognised. Long lines wrap (`white-space: break-spaces`), continuation lines stay right of the line number.
- Posts get a table of contents automatically when they have 3+ h2/h3 headings (or `outline: true`); `toc: false` hides it. Right-hand sidebar on screens ≥1320px, collapsible box otherwise (`single.html`, `static/js/toc.js`; breakpoint is duplicated in `main.css`).
- Local images under `/image/...` are processed by Hugo (see Images below); keep using the same `/image/...` paths.

## Fonts

- Monospace contexts (site title, nav, headings, dates/meta, TOC, tags, code): `'Roboto Mono', 'Sarasa Mono TC', 'Noto Sans TC', monospace` — Roboto Mono for Latin (400 + 700), Sarasa Mono TC for Chinese (400 + 700). Prose inside posts (paragraphs, lists, tables, captions): Fira Sans + Noto Sans TC.
- Sarasa Mono TC is subset to the site's characters by `tools/subset_fonts.py` (`pip install fonttools brotli`; caches the source TTFs in gitignored `.font-cache/`). CI re-runs it before every build, non-fatally; characters missing from the subset fall back to Noto Sans TC. Licence: `themes/archie/static/fonts/OFL-Sarasa-Gothic.txt` (OFL 1.1; only "Source" is a reserved name, so the subset keeps its name).

## Multilingual (zh-tw default, en under `/en/`)

- Default language is zh-tw served at the root (`defaultContentLanguageInSubdir = false`); English lives under `/en/`.
- Translations are sibling files with an `.en.md` suffix: `eth.md` ↔ `eth.en.md`, `about.md` ↔ `about.en.md`, `search.md` ↔ `search.en.md`.
- English translations are currently `draft: true`, so preview them with `hugo server -D`. Remove the draft flag to publish.
- The English translations of the ETH posts were LLM-generated: keep them `draft: true` until a human-written/reviewed version exists.
- Nav language switcher (`partials/head.html`) is shown only if the other language has a published post or the current content page has a translation. `partials/site-published.html` / `partials/is-shell.html` implement this; empty English index/list/search pages get `noindex` (`partials/header.html`) and are left out of the sitemap (`layouts/sitemap.xml`). So it turns on by itself once a real English post is published; `hugo server -D` (drafts) always shows it.
- UI strings live in `i18n/zh-tw.toml` / `i18n/en.toml` (use `{{ i18n "key" }}`); the subtitle and nav menu stay in English on both languages (top-level `[params]` / `[[menu.main]]`).
- `config.toml` sets `[markup.goldmark.renderHooks.*] useEmbedded = "never"` because Hugo auto-enables embedded link/image render hooks on multilingual sites. Don't remove it, or zh output changes.

## Images

- `content/image` is also mounted as `assets/image` (`[module]` mounts in `config.toml`; declaring any mount replaces Hugo's defaults, so all are listed). Originals are still published at their old URLs.
- `partials/responsive-image.html` turns `/image/...` PNG/JPEG/WebP into 640/960/1600px WebP with `srcset`, `width`/`height` and `loading="lazy"`; other URLs fall back to a plain `<img>`. JPEGs go through `images.AutoOrient` first, because resizing drops EXIF and phone photos are stored sideways.
- Used by the overridden `figure` shortcode and `_default/_markup/render-image.html`, so posts need no changes.
- Processed images also get `data-zoom-src` (the largest WebP); `static/js/lightbox.js` opens it in a `<dialog>` on click/Enter. Images inside links and external images are left alone.
- The header is sticky and hides while scrolling down / reappears on scroll up (`static/js/nav-hide.js`, `.nav-hidden`). It stays visible while search is open and hides on in-page `#` jumps so it never covers the target heading. Its spacing is padding with a negative bottom margin to keep the page start where the old collapsing margins put it.
- Animations (lightbox zoom from the thumbnail, backdrop fade, search dropdown, cross-page View Transitions with a fixed header) all live behind `prefers-reduced-motion: no-preference` in `main.css` / a `reduceMotion` check in `lightbox.js`. Headless Chrome with `--virtual-time-budget` does not advance animation timelines, so test animations in real time.
- Images are centred: `figure` is a centred block and untitled standalone Markdown images get `<p class="image-block">` from the render hook. Those imgs are `display:block` + auto margins + `box-sizing: border-box` (the theme's 3px img border otherwise overflows `max-width:100%` by 6px and pushes the image off-centre).
- `static/eth-cg24/` is a standalone hand-built report and is not processed.
- A standalone Markdown image with a title (`![alt](/image/x.webp "caption")`, which is what the CMS writes) renders as a `<figure>` with a caption like the `figure` shortcode. This relies on `wrapStandAloneImageWithinParagraph = false` in `config.toml`; the render hook re-adds `<p>` for untitled images.
- The theme links CSS via `.Site.BaseURL` (absolute), so a static build served locally loads production CSS; build with `--baseURL http://localhost:PORT/` to test CSS changes. `hugo server` is unaffected.

## CMS (Sveltia)

- `static/admin/` serves Sveltia CMS at `/admin/` (script pinned in `index.html`; config in `config.yml`). Locally: `hugo server`, open `http://localhost:1313/admin/` in a Chromium browser → "Work with Local Repository" (writes files only, no git). Online: "Sign In with GitHub" (or a repo-scoped GitHub token); saving commits to `main` and deploys.
- "Sign In with GitHub" uses the Sveltia CMS Authenticator worker on Cloudflare: `sveltia-cms-auth` → `https://sveltia-cms-auth.jayin920805.workers.dev` (`backend.base_url`). Code is upstream `github.com/sveltia/sveltia-cms-auth` (not forked); redeploy with `git clone` + `npx wrangler@4 deploy` — secrets persist. Worker secrets: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ALLOWED_DOMAINS=blog.jayinnn.dev`. GitHub OAuth App "Jayinnn Blog CMS", callback `<worker>/callback`, expiring user tokens (re-sign-in after ~8 h; the worker has no refresh flow). `backend.auth_scope: public_repo` keeps tokens off private repos — keep it unless the repo becomes private.
- `static/admin/editor-components.js` registers CMS editor components for the shortcodes `figure`, `callout` (theme), `youtube`, `x`, `qr`, `details`, `highlight`, so they show as editable blocks with previews and can be inserted from the editor. Patterns must parse existing posts exactly and write untouched shortcodes back byte-for-byte (figure keeps the original text in a hidden `raw` field). Test with `node` — the file exports the list when `module` exists.
- Preview styles: `index.html` registers the site's `fonts.css`/`main.css` (+ `dark.css` for dark mode) with `CMS.registerPreviewStyle`; `.body`-scoped prose rules are re-applied to the Body field there.
- Uploads go to `content/image` as WebP (max 2560px), referenced as `/image/...`. Posts use i18n `multiple_files` with the default locale omitted, matching `post.md` / `post.en.md`; new entries start zh-tw only and default to `draft: true`.

## Comments

- giscus (GitHub Discussions), via `themes/archie/layouts/partials/comments.html`, included at the bottom of `single.html`.
- Renders only for `posts` when `[params.giscus] repoId` and `categoryId` in `config.toml` are set; set `comments: false` in a post's frontmatter to disable. Threads are keyed by URL path, so zh and en versions have separate threads.

## Deployment
- Theme CSS/JS are linked through `partials/asset-url.html`, which appends `?v=<md5 of the file>[:8]`. They're served with a 4-hour max-age under fixed names, so link any new static CSS/JS the same way or browsers keep stale copies after a deploy.

- Push to `main` triggers `.github/workflows/hugo.yml`, which builds with Hugo 0.167.0 extended and force-pushes to the `gh-pages` branch.
- `public/` and `resources/` are gitignored and never committed.
