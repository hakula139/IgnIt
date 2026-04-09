# CLAUDE.md — IgnIt

## Project Overview

IgnIt is a kiln theme built with Tailwind CSS v4, inspired by Hugo LoveIt. It provides MiniJinja templates, compiled CSS, and JS assets for [kiln](https://github.com/hakula139/kiln) sites.

### Theme Structure

```text
.
├── assets/
│   ├── css/
│   │   ├── main.css                        # Entry: tokens, dark mode, partial imports
│   │   ├── base.css                        # @layer base (html, body, a, selection)
│   │   └── components/
│   │       ├── layout/
│   │       │   ├── glass-panel.css         # .glass-panel, .glass-glow, .header-nav, .site-footer
│   │       │   └── header.css              # .header-logo, .header-link, .header-icon, .header-mobile-*
│   │       ├── content/
│   │       │   ├── article.css             # .article-title, .post-banner-*
│   │       │   ├── toc.css                 # .toc, .toc-collapse, .toc-trigger, .toc-sidebar-*
│   │       │   ├── code-block.css          # .code-block, .code-header, .code-body, .copy-btn
│   │       │   ├── syntax.css              # Syntax highlighting (Material Light / Palenight)
│   │       │   ├── callout.css             # .callout variants, icons, collapse animation
│   │       │   └── prose.css               # .prose overrides (unlayered + @layer components)
│   │       ├── listing/
│   │       │   ├── home-card.css           # .home-card-*, .profile-avatar, .text-card-*
│   │       │   ├── listing.css             # .year-heading, .tag-pill, .category-card, .post-entry-*
│   │       │   └── pagination.css          # .pagination-link, .pagination-ellipsis, .pagination-input
│   │       └── embed/
│   │           └── apple-music.css         # Apple Music embed light / dark toggle
│   └── js/
│       ├── content.js                      # Code block, callout, heading anchor, and external link enhancements
│       ├── glow.js                         # Glass panel cursor glow effect
│       ├── pagination.js                   # Page-jump controls for pagination
│       ├── theme.js                        # Dark mode toggle + system preference
│       └── toc.js                          # TOC active heading tracking + section collapse
├── static/                                 # Build output (committed for submodule consumers)
│   ├── css/
│   │   └── style.min.css                   # Compiled Tailwind output
│   └── js/
│       └── *.min.js                        # Minified JS via esbuild
└── templates/
    ├── _partials/                          # Shared template fragments ({% include %})
    │   ├── layout/
    │   │   ├── footer.html                 # Glass-panel footer (copyright, license)
    │   │   ├── head-deps.html              # Conditional CDN deps (FontAwesome, KaTeX)
    │   │   └── header.html                 # Fixed nav header with menu + theme toggle
    │   ├── content/
    │   │   ├── math.html                   # Conditional KaTeX runtime scripts
    │   │   ├── meta-og.html                # OG / Twitter Card meta tags
    │   │   ├── toc-mobile.html             # Collapsible TOC (< xl breakpoint)
    │   │   └── toc-sidebar.html            # Sticky TOC sidebar (xl+ breakpoint)
    │   └── listing/
    │       ├── pagination.html             # Pagination nav + page-jump input
    │       ├── post-entry.html             # Post entry (title + conditional date)
    │       └── year-grouped-listing.html   # Year-grouped post list with pagination
    ├── archive.html                        # Archive listing (year-grouped, pagination, glass card)
    ├── base.html                           # Base layout (glass panels, background image)
    ├── home.html                           # Home page (profile + image cards with hover reveal)
    ├── overview.html                       # Bucket overview (tag cloud / section grid)
    ├── post.html                           # Article page (glass card, banner, TOC sidebar)
    └── directives/
        └── music.html                      # Music embed directive
```

### CSS Architecture

Source CSS lives in `assets/css/` using Tailwind CSS v4 conventions:

- **`main.css`** — Entry point: `@import 'tailwindcss'`, `@theme` tokens, `@variant dark`, dark-mode token overrides, then `@import` for each partial. The Tailwind CLI inlines all imports before compilation, so tokens and utilities are available in every partial.
- **`base.css`** — `@layer base` styles: `html`, `body`, `body::before` (background image), `::selection`, `a`, scroll offset.
- **`components/*.css`** — `@layer components` partials, one per concern. Each file wraps all rules in `@layer components { ... }`.

#### Design Tokens

Defined in `@theme { ... }` in `main.css`. Custom properties follow these prefixes:

- `--color-*` — colors (bg, text, link, border, card, selection)
- `--radius-*` — border radii
- `--shadow-*` — box shadows

#### Component Classes vs. Inline Utilities

Templates use semantic component class names for repeated multi-property patterns. Inline Tailwind utilities are acceptable for:

- Simple layout helpers (1–3 utilities)
- One-off modifiers or responsive overrides

Use `@apply` in the appropriate CSS partial for anything else. Use canonical Tailwind v4 class names (e.g., `text-link-hover` not `text-(--color-link-hover)`, `rounded-card` not `rounded-(--radius-card)`).

#### Build Output

`static/` contains compiled output committed to git so submodule consumers get a working theme without needing Node.js:

- `static/css/style.min.css` — compiled Tailwind CSS
- `static/js/*.min.js` — minified JS via esbuild

**Always run `pnpm build` before committing** to keep compiled output in sync with source.

To rebuild: `pnpm build` (CSS + JS), `pnpm build:css`, `pnpm build:js`, or `pnpm dev:css` for watch mode.

## Coding Conventions

### HTML Templates

- Use `| safe` filter on all URL outputs to prevent MiniJinja HTML-escaping slashes.
- **Partials** live in `_partials/` and are included via `{% include "_partials/name.html" %}`.
- **Whitespace control**: Use `{%-` (left-trim) to eat template tag whitespace while preserving HTML indentation. Use `-%}` (right-trim) sparingly.

### Tailwind Class Ordering

Follow this order for utility classes in HTML attributes:
layout → sizing → spacing → overflow → typography → visual → transitions → interactivity

Example: `class="flex items-center w-full px-4 py-2 text-sm text-text bg-bg rounded-lg transition-colors cursor-pointer"`

### CSS

- **Design tokens** in `@theme { ... }` block — colors, fonts, radii, shadows.
- **Custom properties** prefixed with `--color-`, `--radius-`, `--shadow-`.
- **Component classes** for multi-property patterns that repeat. CSS partials are grouped by concern under `components/` (`layout/`, `content/`, `listing/`, `embed/`).
- Prefer Tailwind utilities over custom CSS.
- `@import` order in `main.css` determines cascade order within the same `@layer`.

### JavaScript

- ES6: `const` / `let`, arrow functions, template literals, `for...of`.
- `'use strict'` at top of each file.
- IIFE wrapper `(() => { ... })()` for script isolation.

### Git Conventions

- Commit messages: `type(scope): description`
  - Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `style`
  - Scope: area of change (e.g., `template`, `css`, `js`)
- Keep commits atomic — one logical change per commit.
- PRs: assign to `hakula139`, label `enhancement` for `feat`.

### Spell Checking

- Run `pnpm spellcheck` before committing. Config in `cspell.json`.
- Add project-specific words to `.cspell/words.txt` (one word per line, sorted alphabetically).
- Generated files (`pnpm-lock.yaml`, `static/`) are excluded via `ignorePaths`.
