# IgnIt

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

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

- All CDN deps exact-pinned with SRI hashes (FontAwesome, KaTeX, Mermaid, Twikoo)
- Phase-scoped dep loading — each dep emitted once per page, gated on actual content needs
- LQIP wrappers paint kiln's base64 backdrop while sources decode

### Accessibility

- Keyboard-accessible focus states (`:focus-visible`), skip-to-content link, semantic landmark regions
- `prefers-reduced-motion` honored across animations and smooth-scroll

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

## Configuration

IgnIt provides default parameters that can be overridden in your site's `config.toml`.

### Theme Parameters

```toml
[params]
cdn = "https://cdn.jsdelivr.net/npm"  # CDN base URL for dependencies
code_max_lines = 40                   # Max visible lines before code blocks scroll
emojis = true                         # Enable emoji replacement
fontawesome = true                    # Enable Font Awesome icon loading
```

### Background Image

Set a fixed background image with glassmorphism content panels:

```toml
[params.background]
image = "/images/bg.webp"             # Path to background image
lqip_uri = "data:image/webp;base64,..." # Pre-computed LQIP data URI (optional)
position = "right center"             # CSS background-position (default: center)
position_mobile = "60% center"        # Mobile background-position (default: position)
```

When unset, panels use solid backgrounds (the theme works without a background image).

### Comments

```toml
[params.comments]
enabled = true
provider = "twikoo"                   # Currently the only built-in provider

[params.comments.twikoo]
api_url = "https://twikoo.example.com"
```

The dispatcher is provider-agnostic — additional providers (Giscus, Waline, etc.) drop in via a sibling partial under `templates/_partials/comments/`. The provider's CDN dep loads only when comments are enabled.

### Footer

```toml
[params.footer]
since = 2018                          # Copyright start year
license = "CC BY-NC-SA 4.0"           # License name
license_url = "https://creativecommons.org/licenses/by-nc-sa/4.0/"
powered_by = true                     # Show "Powered by kiln & IgnIt"
```

### Home Profile

```toml
[params.home.profile]
avatar = "/images/avatar.webp"
title = "Site Title"
subtitle = "A short tagline"
```

### Navigation Menu

```toml
[[menu.main]]
name = "Posts"
url = "/posts/"
icon = "fas fa-archive"               # Font Awesome class (optional)
weight = 1                            # Sort order (ascending)

[[menu.main]]
name = "GitHub"
url = "https://github.com/user"
icon = "fab fa-github"
weight = 10
external = true                       # Opens in new tab
```

### Visual Effects (experimental)

```toml
[params.effects]
cursor_glow = false                   # Cursor-tracking glow on glass panels
```

Off by default. The `will-change` layers it injects clash with `backdrop-filter` compositing on Chromium / WebKit:

- **Panel flicker during scroll** (frequent) — panels briefly show stale content while scrolling.
- **Phantom gap near `#comments`** (rare) — an in-page anchor jump close to the comments section can leave the article card with a much larger apparent gap than its real 32 px margin; the next manual scroll repaints.

## Image Pipeline

IgnIt paints kiln's `lqip_uri` (low-quality image placeholder, a base64-encoded WebP data URI) via the `<span class="lqip">` wrapper kiln emits around content images. The backdrop shows immediately on first paint; the inner image fades in once it decodes.

- **Body images**: auto-wrapped by kiln. No site-level work.
- **Featured images** (post banner, home cards): templates emit the wrapper themselves, gated on `featured_image.lqip_uri`.
- **Body background** (`[params.background]`): supply a pre-computed `lqip_uri` alongside `image`. The wrapper pins fixed-fullscreen with `object-fit: cover`; `position` / `position_mobile` drive `object-position` via CSS variables.

## Internationalization

Translation tables live under `i18n/<lang>.toml` (`en`, `zh-Hans`); the active language follows `config.language` in the consuming site. Access:

- **Templates** (MiniJinja): `t('key')`.
- **Client JS**: `data-i18n-*` attributes on the document root.

Sites can layer overrides via a same-named TOML at their root's `i18n/<lang>.toml`, merged key-by-key. Per-key lookup falls back: **site override → theme translation → theme English**.

## Webfonts

Inter Variable (`--font-sans`) and Maple Mono Variable (`--font-mono`) are self-hosted under `static/fonts/`. Both are fetched lazily on first use — Inter when any page text renders, Maple Mono when the first `<code>` appears. CJK falls through to system fonts (Sarasa Gothic SC, PingFang SC, Noto Sans CJK SC, etc.) via the `--font-sans` cascade.

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
