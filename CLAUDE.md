# CLAUDE.md — IgnIt

## Project Overview

IgnIt is a kiln theme built with Tailwind CSS v4, inspired by Hugo LoveIt. It provides MiniJinja templates, compiled CSS, and JS assets for [kiln](https://github.com/hakula139/kiln) sites.

### Theme Structure

```text
.
├── assets/
│   └── css/
│       ├── main.css               # Entry: tokens, dark mode, partial imports
│       ├── base.css               # @layer base (html, body, a, selection)
│       └── components/
│           ├── glass-panel.css    # .glass-panel, .header-nav, .site-footer
│           ├── header.css         # .header-logo, .header-link, .header-icon, .header-mobile-*
│           ├── home-card.css      # .home-card-*, .profile-avatar, .text-card-*
│           ├── content.css        # .article-title, .toc-collapse, .toc-trigger, .toc-body, .toc-sidebar
│           ├── listing.css        # .year-heading, .tag-pill, .category-card, .post-entry-*
│           ├── pagination.css     # .pagination-link, .pagination-ellipsis, .pagination-input
│           ├── callout.css        # .callout, .callout-note … .callout-quote, dark overrides
│           └── prose.css          # .prose variable overrides, code, word-break
├── static/
│   ├── css/
│   │   ├── apple-music.css        # Apple Music embed light / dark toggle
│   │   └── syntax.css             # Syntax highlighting (Material palette)
│   ├── dist/
│   │   └── style.min.css          # Compiled Tailwind output (committed for submodule consumers)
│   └── js/
│       ├── pagination.js          # Page-jump controls for pagination
│       └── theme.js               # Dark mode toggle + system preference
└── templates/
    ├── _partials/                  # Shared template fragments ({% include %})
    │   ├── footer.html            # Glass-panel footer (copyright, license)
    │   ├── head-deps.html         # Conditional CDN deps (FontAwesome, KaTeX)
    │   ├── header.html            # Fixed nav header with menu + theme toggle
    │   ├── math.html              # Conditional KaTeX runtime scripts
    │   ├── meta-og.html           # OG / Twitter Card meta tags
    │   ├── pagination.html        # Pagination nav + page-jump input
    │   ├── post-entry.html        # Post entry (title + conditional date)
    │   └── year-grouped-listing.html  # Year-grouped post list with pagination
    ├── base.html                   # Base layout (glass panels, background image)
    ├── home.html                   # Home page (profile + image cards with hover reveal)
    ├── page.html                   # Standalone page (glass card, collapsible TOC)
    ├── post.html                   # Post page (glass card, sticky TOC sidebar)
    ├── section.html                # Section listing (year-grouped, glass card)
    ├── taxonomy.html               # Taxonomy index (tag cloud / category grid)
    ├── term.html                   # Term page (year-grouped, pagination)
    └── directives/
        └── music.html              # Music embed directive
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

`static/dist/style.min.css` is the compiled output, committed to git so submodule consumers get a working theme without needing Node.js. **Always run `pnpm build` before committing** to keep the compiled output in sync with source.

To rebuild CSS: `pnpm build` (or `pnpm dev` for watch mode).

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
- **Component classes** for multi-property patterns that repeat. One CSS partial per concern under `components/`.
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

- Run `npx cspell "**/*"` before committing. Config in `cspell.json`.
- Add project-specific words to the `words` array in `cspell.json`.
- Generated files (`pnpm-lock.yaml`, compiled CSS) are excluded via `ignorePaths`.
