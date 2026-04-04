# IgnIt

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A clean, feature-rich theme for [kiln](https://github.com/hakula139/kiln) — inspired by Hugo [LoveIt](https://github.com/dillonzq/LoveIt).

## Overview

IgnIt is a [kiln](https://github.com/hakula139/kiln) theme built with Tailwind CSS v4 and MiniJinja templates. It features:

- Glassmorphism panels with configurable background image
- Dark / light mode with system preference detection and manual toggle
- Responsive layout with sticky TOC sidebar (desktop) and collapsible TOC (mobile)
- KaTeX math support (loaded conditionally per page)
- Font Awesome icons (loaded conditionally via CDN)
- Open Graph / Twitter Card meta tags
- Syntax-highlighted code blocks (Material color palette)
- Directive-based shortcode system (music embeds, etc.)
- Tag cloud, year-grouped post lists, numbered pagination with page-jump

## Installation

Add IgnIt to your kiln site as a Git submodule:

```bash
git submodule add https://github.com/hakula139/IgnIt.git themes/IgnIt
```

Then set it in your `config.toml`:

```toml
theme = "IgnIt"
```

## Configuration

### Theme Parameters

IgnIt provides default parameters that can be overridden in your site's `config.toml`:

```toml
[params]
cdn = "https://cdn.jsdelivr.net/npm"  # CDN base URL for dependencies
code_max_lines = 40                   # Max visible lines in code blocks before scrolling
emojis = true                         # Enable emoji replacement
fontawesome = true                    # Enable Font Awesome icon loading
paginate = 10                         # Items per page on listing pages
```

### Background Image

Set a fixed background image with glassmorphism content panels:

```toml
[params.background]
image = "/images/bg.webp"
```

When unset, panels use solid backgrounds (theme works without a background image).

### Navigation Menu

```toml
[[menu.main]]
name = "Posts"
url = "/posts/"
icon = "fas fa-archive"   # Font Awesome class (optional)
weight = 1                # Sort order (ascending)

[[menu.main]]
name = "GitHub"
url = "https://github.com/user"
icon = "fab fa-github"
weight = 10
external = true           # Opens in new tab
```

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

## Theme Development

IgnIt uses Tailwind CSS v4 for styling. To modify styles:

```bash
pnpm install     # Install dependencies
pnpm dev         # Watch mode — rebuilds CSS on template changes
pnpm build       # Production build (minified)
```

Source CSS: `assets/css/main.css` (Tailwind `@theme` tokens, custom components).
Compiled output: `static/css/style.css` (committed for zero-dep usage).

## License

Copyright (c) 2026 [Hakula](https://hakula.xyz). Licensed under the [MIT License](LICENSE).
