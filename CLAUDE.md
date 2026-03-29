# CLAUDE.md — IgnIt

## Project Overview

IgnIt is a kiln theme inspired by Hugo LoveIt. It provides MiniJinja templates, static CSS / JS assets, and default parameters for [kiln](https://github.com/hakula139/kiln) sites.

### Theme Structure

```text
.
├── static/
│   ├── css/                 # Stylesheets
│   │   ├── apple-music.css
│   │   ├── home.css
│   │   ├── table.css
│   │   └── taxonomy.css
│   └── js/                  # Scripts
│       └── pagination.js
└── templates/
    ├── _partials/           # Shared template fragments ({% include %})
    │   ├── meta-og.html     # OG / Twitter Card meta tags
    │   ├── pagination.html  # Pagination nav + page-jump script
    │   └── post-entry.html  # Post entry (title + conditional date)
    ├── base.html            # Base layout (KaTeX, block definitions)
    ├── home.html            # Home page (paginated post listing)
    ├── page.html            # Standalone page (about, etc.)
    ├── post.html            # Post page (article meta via partial)
    ├── section.html         # Section listing (year-grouped posts, pagination)
    ├── taxonomy.html        # Taxonomy index (categories grid / tag cloud)
    ├── term.html            # Term page (year-grouped posts, pagination)
    └── directives/          # Markdown directive templates
        └── music.html       # Music embed directive
```

## Coding Conventions

### HTML Templates

- **`<head>` and `<body>` at 0-indent** in `base.html`. Block content uses 2-space indent.
- **`{%- block ... %}`** in parent strips preceding whitespace for clean composed output.
- **`{%- endblock %}`** in children strips trailing newline to avoid double blank lines.
- **`{%- if/for/endif/endfor %}`** (left-trim) to eat template tag whitespace while preserving HTML indentation.
- **Partials** live in `_partials/` and are included via `{% include "_partials/name.html" %}`.
- **HTML attribute order**: identity (`src`, `href`) → verification (`integrity`, `crossorigin`) → behavior (`defer`, `type`) → callbacks (`onload`).

### CSS

- **Property order** (grouped, outside-in): positioning → display / flow → sizing → spacing → overflow → typography → visual → animation → interaction. Convention documented at the top of `taxonomy.css`.
- **CSS custom properties** for repeated values (e.g., `--color-muted`).
- **Class naming**: `component-element` pattern (e.g., `category-card-title`, `post-entry-link`, `pagination-item`).

### JavaScript

- ES6: `const` / `let`, arrow functions, template literals, `for...of`.
- `'use strict'` at top of each file.
- IIFE wrapper `(() => { ... })()` for script isolation.

### Git Conventions

- Commit messages: `type(scope): description`
  - Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `style`
  - Scope: area of change (e.g., `template`, `css`, `js`)
- Keep commits atomic — one logical change per commit.
