# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog (blog.jayinnn.dev) built with **Hugo v0.110.0 (extended)**, using a modified **Archie** theme. Content is primarily in Traditional Chinese (zh-tw). Deployed to GitHub Pages via GitHub Actions on push to `main`.

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
