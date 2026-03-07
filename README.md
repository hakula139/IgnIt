# IgnIt

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A clean, feature-rich theme for [kiln](https://github.com/hakula139/kiln) — inspired by Hugo [LoveIt](https://github.com/dillonzq/LoveIt).

## Overview

IgnIt is a [kiln](https://github.com/hakula139/kiln) theme that carries forward the spirit of the Hugo LoveIt theme with a ground-up reimplementation using MiniJinja templates. It includes KaTeX math support, Open Graph / Twitter Card meta, syntax-highlighted code blocks, and a directive-based shortcode system.

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
```

## Theme Structure

```text
.
├── theme.toml         # Theme metadata and default parameters
├── templates/         # MiniJinja templates
│   ├── base.html      # Base layout (KaTeX math support)
│   └── post.html      # Post template (OG / Twitter Card meta)
└── static/            # Static assets (CSS, JS, images)
```

## License

Copyright (c) 2026 [Hakula](https://hakula.xyz). Licensed under the [MIT License](LICENSE).
