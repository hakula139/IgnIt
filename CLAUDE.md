# CLAUDE.md — IgnIt

## Project Overview

IgnIt is a kiln theme built with Tailwind CSS v4, inspired by Hugo LoveIt. It provides MiniJinja templates, compiled CSS, and JS assets for [kiln](https://github.com/hakula139/kiln) sites.

### Theme Structure

```text
.
├── assets/
│   └── css/
│       └── main.css             # Tailwind source (@theme, @layer, @variant)
├── static/
│   ├── css/
│   │   ├── apple-music.css      # Apple Music embed light / dark toggle
│   │   ├── syntax.css           # Syntax highlighting (Material palette)
│   │   └── table.css            # Default table styles
│   ├── dist/
│   │   └── style.min.css        # Compiled Tailwind output (gitignored)
│   └── js/
│       ├── pagination.js        # Page-jump controls for pagination
│       └── theme.js             # Dark mode toggle + system preference
└── templates/
    ├── _partials/               # Shared template fragments ({% include %})
    │   ├── footer.html          # Glass-panel footer (copyright, license)
    │   ├── head-deps.html       # Conditional CDN deps (FontAwesome, KaTeX)
    │   ├── header.html          # Fixed nav header with menu + theme toggle
    │   ├── meta-og.html         # OG / Twitter Card meta tags
    │   ├── pagination.html      # Pagination nav + page-jump input
    │   └── post-entry.html      # Post entry (title + conditional date)
    ├── base.html                # Base layout (glass panels, background image)
    ├── home.html                # Home page (profile + image cards with hover reveal)
    ├── page.html                # Standalone page (glass card, collapsible TOC)
    ├── post.html                # Post page (glass card, sticky TOC sidebar)
    ├── section.html             # Section listing (year-grouped, glass card)
    ├── taxonomy.html            # Taxonomy index (tag cloud / category grid)
    ├── term.html                # Term page (year-grouped, pagination)
    └── directives/
        └── music.html           # Music embed directive
```

### CSS Architecture

Source CSS lives in `assets/css/main.css` using Tailwind CSS v4 conventions:

- `@theme { ... }` — design tokens (colors, fonts, radii, shadows)
- `@variant dark` — dark mode via `[data-theme="dark"]` attribute
- `@layer base` — dark mode overrides, background image, selection, links
- `@layer components` — glass panels, home cards, callout types, prose overrides
- Templates use Tailwind utility classes directly for layout and styling

To rebuild CSS: `pnpm build` (or `pnpm dev` for watch mode).

## Coding Conventions

### HTML Templates

- Use `| safe` filter on all URL outputs to prevent MiniJinja HTML-escaping slashes.
- **Partials** live in `_partials/` and are included via `{% include "_partials/name.html" %}`.
- **Whitespace control**: Use `{%-` (left-trim) to eat template tag whitespace while preserving HTML indentation. Use `-%}` (right-trim) sparingly.

### Tailwind Class Ordering

Follow this order for utility classes in HTML attributes:
layout → sizing → spacing → overflow → typography → visual → transitions → interactivity

Example: `class="flex items-center w-full px-4 py-2 text-sm text-(--color-text) bg-(--color-bg) rounded-lg transition-colors cursor-pointer"`

### CSS

- **Design tokens** in `@theme { ... }` block — colors, fonts, radii, shadows.
- **Custom properties** prefixed with `--color-`, `--radius-`, `--shadow-`.
- **Component classes** only for multi-property patterns that repeat (`.glass-panel`, `.home-card`, `.callout-*`).
- Prefer Tailwind utilities over custom CSS.

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
