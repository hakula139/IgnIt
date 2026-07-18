# IgnIt

[![CI](https://github.com/hakula139/IgnIt/actions/workflows/ci.yml/badge.svg)](https://github.com/hakula139/IgnIt/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/hakula139/IgnIt)

A clean, feature-rich theme for [kiln](https://github.com/hakula139/kiln) — inspired by Hugo [LoveIt](https://github.com/dillonzq/LoveIt).

## Overview

IgnIt is a [kiln](https://github.com/hakula139/kiln) theme built with Tailwind CSS v4 and MiniJinja templates. The visual design centers on glassmorphism over a configurable background image; the implementation keeps a single Tailwind source pipeline with conventions documented in [CLAUDE.md](./CLAUDE.md).

## Highlights

### Visual Design

- Glassmorphism panels with configurable background image; optional cursor-tracking glow (off by default)
- Dark / light mode with system preference detection and flash-free manual toggle
- Self-hosted Inter Variable + Maple Mono webfonts; CJK falls through to system fonts
- Print-optimized styles — clean typography, exposed link URLs, hidden chrome

### Content

- KaTeX math, Mermaid diagrams, Material-palette syntax highlighting
- Optional lightGallery overlay for article figures and Twikoo content images
- Per-post comments via a thin provider dispatcher (Twikoo today; Giscus / Waline drop-in)
- Directive-based shortcodes (music embeds, link cards, etc.)
- Featured image surfaces — post banner, home / listing cards, OG / Twitter Card meta

### Layout & Navigation

- Sticky TOC sidebar (desktop) and collapsible TOC (mobile)
- Home page image cards with gradient overlays and desktop hover reveal
- Tag cloud, year-grouped archive, numbered pagination with page-jump
- Back-to-top + jump-to-comments float buttons (scroll-position-aware)
- Mobile menu with staggered item fade-in

### Performance & Dependencies

- All CDN deps exact-pinned with SRI hashes (FontAwesome, KaTeX, lightGallery, Mermaid, Twikoo)
- Phase-scoped dep loading — each dep emitted once per page, gated on actual content needs
- LQIP wrappers paint kiln's base64 backdrop while sources decode

### Accessibility

- Keyboard-accessible focus states (`:focus-visible`), skip-to-content link, semantic landmark regions
- `prefers-reduced-motion` honored across animations and smooth-scroll

## Documentation

| Document                               | Description                                                                         |
| -------------------------------------- | ----------------------------------------------------------------------------------- |
| [Customization](docs/customization.md) | Override visual tokens, templates, social icons, comments, fonts, and static assets |
| [Parameters](docs/parameters.md)       | `[params]` schema reference — defaults, types, where each value is rendered         |
| [i18n](docs/i18n.md)                   | Translatable string reference — keys, English defaults, override pattern            |

## Installation

Add IgnIt to your kiln site as a Git submodule:

```bash
git submodule add https://github.com/hakula139/IgnIt.git themes/IgnIt
```

Then set it in your `config.toml`:

```toml
theme = "IgnIt"
```

`static/css/style.css` ships pre-built, so consuming sites don't need Node.js.

## Quick Start

A minimal `config.toml` to get IgnIt running:

```toml
theme = "IgnIt"
title = "My Site"
language = "en"

[params]
fontawesome = true

[params.home.profile]
avatar = "/images/avatar.webp"
title = "Site Title"
subtitle = "An optional tagline"

[[menu.main]]
name = "Posts"
url = "/posts/"
icon = "fas fa-archive"
weight = 1

[[menu.social]]
name = "GitHub"
url = "https://github.com/example"
icon = "svg:github"
weight = 1
external = true
```

For the complete schema (`[params.background]`, `[params.comments]`, `[params.lightgallery]`, `[params.footer]`, `[params.section]`, `[params.effects]`) and the full menu field list, see [Parameters](docs/parameters.md). For visual customization, social icon overrides, comment provider wiring, and other extension patterns, see [Customization](docs/customization.md).

## Theme Development

All assets live under `static/`:

- `static/css/_src/` — Tailwind sources (entry, partials); private build input, skipped by kiln
- `static/css/style.css` — compiled Tailwind output, shipped
- `static/js/{comments,content,layout,listing}/*.js` — JS sources, shipped as-is (no build step)

```bash
pnpm install     # Install dev dependencies (Tailwind CLI, ESLint, Prettier)
pnpm dev         # Watch mode — rebuilds static/css/style.css on changes
pnpm build       # One-shot CSS build
```

Compression for both CSS and JS is handled at deploy time by `kiln build --minify`, so sources stay readable in the dev server for debugging.

For deeper architectural notes (CSS layering, dependency registry, build pipeline, coding conventions), see [`CLAUDE.md`](./CLAUDE.md).

## License

Copyright (c) 2026 [Hakula](https://hakula.xyz). Licensed under the [MIT License](LICENSE).
