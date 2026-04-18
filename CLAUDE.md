# CLAUDE.md — IgnIt

## Project Overview

IgnIt is a kiln theme built with Tailwind CSS v4, inspired by Hugo LoveIt. It provides MiniJinja templates, compiled CSS, and JS assets for [kiln](https://github.com/hakula139/kiln) sites.

### Theme Structure

All assets live under a single `static/` tree. Files and directories whose names start with `_` are private build inputs — kiln's `copy_static` skips them when publishing the site.

```text
.
├── static/                                 # single asset root (committed for submodule consumers)
│   ├── css/
│   │   ├── _src/                           # private: Tailwind sources (not shipped)
│   │   │   ├── main.css                    # Entry: tokens, dark mode, partial imports
│   │   │   ├── base.css                    # @layer base (html, body, a, selection)
│   │   │   └── components/
│   │   │       ├── layout/
│   │   │       │   ├── back-to-top.css     # .back-to-top fixed button with glass styling
│   │   │       │   ├── glass-panel.css     # .glass-panel, .glass-glow, [data-glow-target], .header-nav, .site-footer
│   │   │       │   ├── header.css          # .header-logo, .header-link, .header-icon, .header-mobile-*, menu animations
│   │   │       │   └── print.css           # @media print overrides (hide chrome, clean typography)
│   │   │       ├── content/
│   │   │       │   ├── article.css         # .article-title, .post-banner-*
│   │   │       │   ├── callout.css         # .callout variants, icons, collapse animation
│   │   │       │   ├── code-block.css      # .code-block, .code-header, .code-body, .copy-btn
│   │   │       │   ├── link-card.css       # .link-card, .link-avatar, .link-grid
│   │   │       │   ├── prose.css           # .prose overrides (unlayered + @layer components)
│   │   │       │   ├── syntax.css          # Syntax highlighting (Material Light / Palenight)
│   │   │       │   └── toc.css             # .toc, .toc-collapse, .toc-trigger, .toc-sidebar-*
│   │   │       ├── listing/
│   │   │       │   ├── home-card.css       # .home-card-*, .profile-avatar, .text-card-*
│   │   │       │   ├── listing.css         # .year-heading, .tag-pill, .category-card, .post-entry-*
│   │   │       │   └── pagination.css      # .pagination-link, .pagination-ellipsis, .pagination-input
│   │   │       ├── search/
│   │   │       │   └── search.css          # Pagefind trigger, modal, and result theming
│   │   │       └── embed/
│   │   │           └── apple-music.css     # Apple Music embed light / dark toggle
│   │   └── style.css                       # Compiled Tailwind output (shipped)
│   └── js/
│       ├── back-to-top.js                  # Scroll-triggered back-to-top button
│       ├── content.js                      # Code block, callout, heading anchor, and external link enhancements
│       ├── glow.js                         # Glass panel cursor glow effect
│       ├── pagination.js                   # Page-jump controls for pagination
│       ├── theme.js                        # Dark mode toggle + system preference
│       └── toc.js                          # TOC active heading tracking + section collapse
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
    ├── 404.html                            # Error page (centered glass card, home link)
    ├── archive.html                        # Archive listing (year-grouped, pagination, glass card)
    ├── base.html                           # Base layout (glass panels, background image)
    ├── home.html                           # Home page (profile + image cards with hover reveal)
    ├── overview.html                       # Bucket overview (tag cloud / section grid)
    ├── post.html                           # Article page (glass card, banner, TOC sidebar)
    └── directives/
        ├── link.html                       # Link card directive
        └── music.html                      # Music embed directive
```

### CSS Architecture

Source CSS lives in `static/css/_src/` using Tailwind CSS v4 conventions:

- **`main.css`** — Entry point: `@import 'tailwindcss'`, `@theme` tokens, `@variant dark`, dark-mode token overrides, then `@import` for each partial. The Tailwind CLI inlines all imports before compilation, so tokens and utilities are available in every partial.
- **`base.css`** — `@layer base` styles: `html`, `body`, `body::before` (background image), `::selection`, `a`, scroll offset.
- **`components/*.css`** — `@layer components` partials, one per concern. Each file wraps all rules in `@layer components { ... }`.

#### Design Tokens

Defined in `@theme { ... }` in `main.css`. Custom properties follow these prefixes:

- `--color-*` — colors (bg, text, link, border, card, selection)
- `--radius-*` — border radii
- `--shadow-*` — box shadows
- `--surface-*` — glass surface fills, borders, and overlays

#### Component Classes vs. Inline Utilities

Templates use semantic component class names for repeated multi-property patterns. Inline Tailwind utilities are acceptable for:

- Simple layout helpers (1–3 utilities)
- One-off modifiers or responsive overrides

Use `@apply` in the appropriate CSS partial for anything else. Use canonical Tailwind v4 class names (e.g., `text-link-hover` not `text-(--color-link-hover)`, `rounded-card` not `rounded-(--radius-card)`).

#### Build Output

`static/` holds the shipped bundle, committed so submodule consumers get a working theme without needing Node.js:

- `static/css/style.css` — compiled Tailwind CSS (not minified; kiln `--minify` compresses at deploy time)
- `static/js/*.js` — JS sources, shipped as-is (no build step; kiln `--minify` compresses at deploy time)

`static/css/_src/` holds Tailwind partials and the entry file — build-only, never shipped (skipped by kiln's `_*` convention).

**Always run `pnpm build` before committing CSS changes** to keep the compiled stylesheet in sync with `_src/`.

To rebuild: `pnpm build` for a one-shot build, or `pnpm dev` for watch mode. Both run Tailwind only; JS files have no build step.

## Coding Conventions

### HTML Templates

- Use `| safe` filter on all URL outputs to prevent MiniJinja HTML-escaping slashes.
- **Partials** live in `_partials/` and are included via `{% include "_partials/name.html" %}`.
- **Whitespace control**: Use `{%-` (left-trim) to eat template tag whitespace while preserving HTML indentation. Use `-%}` (right-trim) sparingly.
- **Attribute wrapping**: When an opening tag exceeds ~100 characters, place each attribute on its own line, indented one level deeper than the tag. Keep lines that are inherently long from a single Jinja expression (e.g., a conditional `content="..."` in a `<meta>` tag) as-is.

### CSS

- **Design tokens** in `@theme { ... }` block — colors, fonts, radii, shadows.
- **Custom properties** prefixed with `--color-`, `--radius-`, `--shadow-`.
- **Component classes** for multi-property patterns that repeat. CSS partials are grouped by concern under `components/` (`layout/`, `content/`, `listing/`, `search/`, `embed/`).
- Prefer Tailwind utilities over custom CSS.
- In `@apply`, use Tailwind v4 trailing-important syntax (`w-auto!`) rather than leading-important syntax (`!w-auto`).
- `@import` order in `main.css` determines cascade order within the same `@layer`.

### JavaScript

- ES6: `const` / `let`, arrow functions, template literals, `for...of`.
- `'use strict'` at top of each file.
- IIFE wrapper `(() => { ... })()` for script isolation.

### Git Conventions

- Commit messages: `type(scope): description`
  - Types: `feat`, `fix`, `refactor`, `docs`, `ci`, `chore`, `style`
  - Scope: area of change (e.g., `template`, `css`, `js`)
- Keep commits atomic — one logical change per commit.
- PRs: assign to `hakula139`, label `enhancement` for `feat`.

### Pre-commit

The husky pre-commit hook runs `lint-staged`, which auto-formats staged files with Prettier (including Tailwind class sorting in HTML attributes and CSS `@apply` via `prettier-plugin-tailwindcss`), lints Markdown with markdownlint, and spell-checks with cspell. The pre-push hook runs `pnpm build` and verifies `static/css/style.css` is in sync with its Tailwind source.

### Spell Checking

- Config in `cspell.json`. Add project-specific words to `.cspell/words.txt` (one word per line, sorted alphabetically).
- Generated files (`pnpm-lock.yaml`, `static/`) are excluded via `ignorePaths`.
