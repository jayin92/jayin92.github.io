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
- Local images under `/image/...` are processed by Hugo (see Images below); keep using the same `/image/...` paths.

## Multilingual (zh-tw default, en under `/en/`)

- Default language is zh-tw served at the root (`defaultContentLanguageInSubdir = false`); English lives under `/en/`.
- Translations are sibling files with an `.en.md` suffix: `eth.md` ↔ `eth.en.md`, `about.md` ↔ `about.en.md`, `search.md` ↔ `search.en.md`.
- English translations are currently `draft: true`, so preview them with `hugo server -D`. Remove the draft flag to publish.
- The English translations of the ETH posts were LLM-generated: keep them `draft: true` until a human-written/reviewed version exists.
- Nav language switcher (`partials/head.html`) is shown only if the other language has a published post or the current content page has a translation. `partials/site-published.html` / `partials/is-shell.html` implement this; empty English index/list/search pages get `noindex` (`partials/header.html`) and are left out of the sitemap (`layouts/sitemap.xml`). So it turns on by itself once a real English post is published; `hugo server -D` (drafts) always shows it.
- UI strings live in `i18n/zh-tw.toml` / `i18n/en.toml` (use `{{ i18n "key" }}`); the Chinese subtitle is under `[languages.zh-tw.params]` in `config.toml`. The nav menu stays in English on both languages (top-level `[[menu.main]]`).
- `config.toml` sets `[markup.goldmark.renderHooks.*] useEmbedded = "never"` because Hugo auto-enables embedded link/image render hooks on multilingual sites. Don't remove it, or zh output changes.

## Images

- `content/image` is also mounted as `assets/image` (`[module]` mounts in `config.toml`; declaring any mount replaces Hugo's defaults, so all are listed). Originals are still published at their old URLs.
- `partials/responsive-image.html` turns `/image/...` PNG/JPEG/WebP into 640/960/1600px WebP with `srcset`, `width`/`height` and `loading="lazy"`; other URLs fall back to a plain `<img>`. JPEGs go through `images.AutoOrient` first, because resizing drops EXIF and phone photos are stored sideways.
- Used by the overridden `figure` shortcode and `_default/_markup/render-image.html`, so posts need no changes.
- Processed images also get `data-zoom-src` (the largest WebP); `static/js/lightbox.js` opens it in a `<dialog>` on click/Enter. Images inside links and external images are left alone.
- `static/eth-cg24/` is a standalone hand-built report and is not processed.
- The theme links CSS via `.Site.BaseURL` (absolute), so a static build served locally loads production CSS; build with `--baseURL http://localhost:PORT/` to test CSS changes. `hugo server` is unaffected.

## Comments

- giscus (GitHub Discussions), via `themes/archie/layouts/partials/comments.html`, included at the bottom of `single.html`.
- Renders only for `posts` when `[params.giscus] repoId` and `categoryId` in `config.toml` are set; set `comments: false` in a post's frontmatter to disable. Threads are keyed by URL path, so zh and en versions have separate threads.

## Deployment

- Push to `main` triggers `.github/workflows/hugo.yml`, which builds with Hugo 0.167.0 extended and force-pushes to the `gh-pages` branch.
- `public/` and `resources/` are gitignored and never committed.
