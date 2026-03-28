# IgnIt

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A clean, feature-rich theme for [kiln](https://github.com/hakula139/kiln) — inspired by Hugo [LoveIt](https://github.com/dillonzq/LoveIt).

## Overview

IgnIt is a [kiln](https://github.com/hakula139/kiln) theme that carries forward the spirit of the Hugo LoveIt theme with a ground-up reimplementation using MiniJinja templates. It includes:

- KaTeX math support
- Open Graph / Twitter Card meta tags
- Syntax-highlighted code blocks
- Directive-based shortcode system (music embeds, etc.)
- Taxonomy pages — categories card grid, tag cloud
- Term pages — year-grouped post lists with numbered pagination and page-jump

## Installation

Add IgnIt to your kiln site as a Git submodule:

```bash
git submodule add https://github.com/hakula139/IgnIt.git themes/IgnIt
```

Then set it in your `config.toml`:

```toml
theme = "IgnIt"
```

## Theme Parameters

IgnIt provides default parameters that can be overridden in your site's `config.toml`:

```toml
[params]
code_max_lines = 40    # Max visible lines in code blocks before scrolling
emojis = true          # Enable emoji replacement
fontawesome = true     # Enable Font Awesome icon replacement
paginate = 10          # Items per page on term pages
```

## Theme Structure

```text
.
├── theme.toml                    # Theme metadata and default parameters
├── static/
│   ├── css/
│   │   ├── apple-music.css       # Apple Music embed light / dark toggle
│   │   ├── table.css             # Default table styles
│   │   └── taxonomy.css          # Taxonomy page layout and pagination
│   └── js/
│       └── pagination.js         # Page-jump controls for pagination
└── templates/
    ├── base.html                 # Base layout (KaTeX math support)
    ├── post.html                 # Post template (OG / Twitter Card meta)
    ├── taxonomy.html             # Taxonomy index (categories grid / tag cloud)
    ├── term.html                 # Term page (year-grouped posts, pagination)
    └── directives/
        └── music.html            # Music embed directive (Apple / NetEase / QQ)
```

## License

Copyright (c) 2026 [Hakula](https://hakula.xyz). Licensed under the [MIT License](LICENSE).
