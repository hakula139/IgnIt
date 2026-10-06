# IgnIt

[![CI](https://github.com/hakula139/IgnIt/actions/workflows/ci.yml/badge.svg)](https://github.com/hakula139/IgnIt/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![WakaTime coding time for IgnIt](https://wakatime.com/badge/user/f4a35a1f-0e29-4093-a647-e66aad164737/project/662307e9-d5bf-4e61-adc7-f900b9a95543.svg)

A theme for [kiln](https://github.com/hakula139/kiln) built with Tailwind CSS and MiniJinja, inspired by Hugo [LoveIt](https://github.com/dillonzq/LoveIt).

## Highlights

### Design & Navigation

- Glassmorphism panels over a configurable background, with light and dark modes
- Responsive layouts with image cards, archives, and a table of contents
- Full-text search with Pagefind
- Keyboard navigation, reduced-motion support, and print styles

### Content

- KaTeX math, Mermaid diagrams, and syntax highlighting
- Image galleries with lightGallery
- Twikoo comments and page views
- Music and Bilibili embeds, link cards, and featured images

### Customization & Performance

- Site overrides for templates, design tokens, and translated strings
- Self-hosted fonts and content-dependent script loading
- Blurred image placeholders and fingerprinted CSS / JS assets

## Documentation

| Document                               | Description                                                                         |
| -------------------------------------- | ----------------------------------------------------------------------------------- |
| [Customization](docs/customization.md) | Override visual tokens, templates, social icons, comments, fonts, and static assets |
| [Parameters](docs/parameters.md)       | `[params]` schema reference: defaults, types, where each value is rendered          |
| [i18n](docs/i18n.md)                   | Translatable string reference: keys, English defaults, override pattern             |

## Installation

Add IgnIt to your kiln site as a Git submodule:

```bash
git submodule add https://github.com/hakula139/IgnIt.git themes/IgnIt
```

Then set it in your `config.toml`:

```toml
theme = "IgnIt"
```

`static/css/style.generated.css` ships pre-built, so consuming sites don't need Node.js.

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

For the complete schema (`[params.background]`, `[params.comments]`, `[params.lightgallery]`, `[params.footer]`, `[params.section]`) and the full menu field list, see [Parameters](docs/parameters.md). For visual customization, social icon overrides, comment provider wiring, and other extension patterns, see [Customization](docs/customization.md).

## Theme Development

All assets live under `static/`:

- `static/css/_src/`: Tailwind sources (entry, partials), a private build input that kiln skips
- `static/css/style.generated.css`: compiled Tailwind output, shipped
- `static/js/{comments,content,layout,listing,util}/*.js`: JS sources, shipped as-is with no build step

```bash
pnpm install     # Install dev dependencies (Tailwind PostCSS, ESLint, Prettier)
pnpm dev         # Watch mode, rebuilds static/css/style.generated.css on changes
pnpm build       # Build shared and discovered page CSS
pnpm test        # Verify compiler and watcher behavior
```

Compression for both CSS and JS is handled at deploy time by `kiln build --minify`, so sources stay readable in the dev server for debugging.

Site builds can reuse `scripts/css.mjs` from the site root. It compiles the shared `static/css/_src/style.css` entry and discovers page entries at `content/**/assets/css/_src/style.css`. Each output is named `style.generated.css` beside its `_src` directory. See [CSS customization](docs/customization.md#visual-tokens) for authoring and page delivery.

For theme contributor constraints, including CSS layering and dependency updates, see [`AGENTS.md`](./AGENTS.md).

## License

Copyright (c) 2026 [Hakula](https://hakula.xyz). Licensed under the [MIT License](LICENSE).
