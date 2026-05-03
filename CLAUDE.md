# CLAUDE.md — IgnIt

## Project Overview

IgnIt is a kiln theme built with Tailwind CSS v4, inspired by Hugo LoveIt. It provides MiniJinja templates, compiled CSS, and JS assets for [kiln](https://github.com/hakula139/kiln) sites.

### Theme Structure

All assets live under a single `static/` tree. Files and directories whose names start with `_` are private build inputs — kiln's `copy_static` skips them when publishing the site.

```text
.
├── i18n/                                   # Translation tables (en, zh-Hans); site-level files override theme keys
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
│   │   │       │   ├── print.css           # @media print overrides (hide chrome, clean typography)
│   │   │       │   └── skip-link.css       # .skip-link visually hidden, focus-promoted accessibility anchor
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
│       ├── lqip.js                         # LQIP fade-in: cache-aware reveal + lazy-fetch fallback
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
- **`base.css`** — `@layer base` styles: `html`, `body`, `::selection`, `a`, scroll offset.
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

`static/` is committed so submodule consumers get a working theme without Node.js. **Always run `pnpm build` before committing CSS changes** so `static/css/style.css` stays in sync with `_src/`. JS ships as-is (no build step); kiln `--minify` compresses both at deploy time. `pnpm dev` runs Tailwind in watch mode.

## Internationalization

Translation tables live under `i18n/<lang>.toml` (`en`, `zh-Hans`). Templates and JS access them via `t('key')` (MiniJinja) or `data-i18n-*` attributes on the document root. The active language is set by `config.language` in the consuming site.

Sites consuming the theme can layer overrides: a same-named TOML file at the site root's `i18n/<lang>.toml` is merged on top of the theme file, key-by-key. Missing keys fall back to the theme's translation, then to the theme's English translation.

## Image Pipeline

The theme paints kiln's `lqip_uri` via the `<span class="lqip">` wrapper kiln emits around content `<img>` (and that templates emit around featured / bg images — see `kiln/docs/themes.md` for the upstream contract). `lqip.css` shows the backdrop; `lqip.js` reveals each image with the same fade-in behavior. `theme.js` flips `html.lqip-fade-enabled` in `<head>` so JS-disabled clients still see images.

- **Body images**: auto-wrapped by kiln. No template work.
- **Featured images** (`templates/post.html` banner, `templates/home.html` cards): templates emit the wrapper themselves, gated on `{% if featured_image.lqip_uri %}`. Per-context size overrides (`.post-banner-media .lqip`, `.home-card > .lqip`) live in `lqip.css`.
- **Body background** (`config.params.background`): hand-rolled in `base.html`. Sites supply `image` + `lqip_uri` (a pre-computed data URI); the wrapper pins fixed-fullscreen with `object-fit: cover`, and `position` / `position_mobile` drive `object-position` via `--bg-position*` CSS vars.

## Coding Conventions

### HTML Templates

- Use `| safe` filter on all URL outputs to prevent MiniJinja HTML-escaping slashes.
- **Partials** live in `_partials/` and are included via `{% include "_partials/name.html" %}`.
- **Whitespace control**: Use `{%-` (left-trim) to eat template tag whitespace while preserving HTML indentation. Use `-%}` (right-trim) sparingly.
- **Attribute wrapping**: When an opening tag exceeds ~100 characters, place each attribute on its own line, indented one level deeper than the tag. Keep lines that are inherently long from a single Jinja expression (e.g., a conditional `content="..."` in a `<meta>` tag) as-is.

### CSS

- Prefer Tailwind utilities over custom CSS.
- In `@apply`, use Tailwind v4 trailing-important syntax (`w-auto!`) rather than leading-important (`!w-auto`).
- `@import` order in `main.css` determines cascade order within the same `@layer`.

### Documentation

- Markdown prose is **not hard-wrapped** — paragraphs are single long lines and flow with the reader's viewport. Match the surrounding style; do not introduce 80-column line breaks inside paragraphs.

### Git Conventions

- Commit messages: `type(scope): description`
  - Types: `feat`, `fix`, `refactor`, `docs`, `test`, `ci`, `chore`, `style`, `perf`
  - Scope: area of change (e.g., `template`, `css`, `js`)
- Keep commits atomic — one logical change per commit.
- PRs: assign to `hakula139`, label `enhancement` for `feat`.

### Pre-commit

Pre-commit hooks are driven by [git-hooks-nix](https://github.com/cachix/git-hooks.nix), wired in `flake.nix`. Entering the dev shell (`nix develop` or via direnv) installs `.git/hooks/pre-commit` automatically. Hooks: Prettier (with `prettier-plugin-tailwindcss` for class sorting), markdownlint, cspell, nixfmt / statix / deadnix, and basic file hygiene. Node-side hooks no-op when `node_modules/` is absent (e.g., inside the Nix sandbox); CI runs the equivalent commands directly via `pnpm`.

### Spell Checking

- Config in `cspell.json`. Add project-specific words to `.cspell/words.txt` (one word per line, sorted alphabetically).
- Generated files (`pnpm-lock.yaml`, `static/`) are excluded via `ignorePaths`.
