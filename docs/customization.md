# Customization

IgnIt is built to be bent. Most surfaces — colors, typography, navigation, icons, copy, comment provider — can be customized from your site without forking the theme. This document is the how-to guide; for the schema reference behind the knobs, see [Parameters](parameters.md). For translatable strings, see [i18n](i18n.md).

## Visual Tokens

IgnIt's design tokens live in `@theme { ... }` inside [`static/css/_src/main.css`](../static/css/_src/main.css), with a parallel set of dark-mode overrides under `[data-theme='dark']`. The token namespaces are:

| Prefix        | Purpose                                                                       |
| ------------- | ----------------------------------------------------------------------------- |
| `--color-*`   | Page surfaces, text, links, borders, selection highlight, syntax theme        |
| `--radius-*`  | Border radii (`md`, `lg`, `xl`, `card`)                                       |
| `--shadow-*`  | Box shadows (`md`, `card`) + a `--drop-shadow-text` for over-image legibility |
| `--surface-*` | Glass panel fills, borders, hover states, scroll shadow, overlay backdrop     |
| `--callout-*` | Per-callout-kind accent colors (12 variants)                                  |
| `--syntax-*`  | Code-block token colors                                                       |

Sites override individual tokens by emitting their own CSS that re-declares the variable inside the appropriate scope. The declaration must hit the correct level: site-wide tokens go on `:root` or `[data-theme]`, dark-mode-only overrides go on `[data-theme='dark']`. The value is consumed everywhere the theme's compiled CSS reads it, so a single override propagates through every component that uses the token.

```css
:root {
  --color-link: #c84d72; /* light-mode link color */
}

[data-theme='dark'] {
  --color-link: #ffaad0; /* dark-mode override */
}
```

To get a site stylesheet onto every page, override `base.html` (see [Template overrides](#template-overrides)) and add a `<link>` after the theme's `<link href=".../css/style.css">`. Anything you ship as a fork of the theme's `style.css` replaces it entirely and loses every token; cascade your file on top instead.

For changes scoped to one post, kiln's [per-page CSS](https://github.com/hakula139/kiln/blob/main/docs/content.md) picks up a co-located `style.css` next to the post's `index.md`. Use it for one-off styling without touching site-wide files.

## Template Overrides

kiln's [override model](https://github.com/hakula139/kiln/blob/main/docs/themes.md#override-model) resolves templates from your site's `templates/` directory before falling back to the theme's. Drop a same-named file into your site to replace any IgnIt template — `base.html`, a partial under `_partials/`, a directive under `directives/`.

```text
my-site/templates/
├── base.html                           # Replaces theme/templates/base.html entirely
└── _partials/
    └── layout/
        └── footer.html                 # Replaces theme/templates/_partials/layout/footer.html
```

Common reasons to override:

- **`base.html`** — add an analytics snippet, a custom stylesheet `<link>`, or extra `<meta>` tags before `</head>`.
- **`_partials/layout/footer.html`** — replace the default attribution with your own copyright text.
- **`_partials/comments/<provider>.html`** — wire a comments provider IgnIt doesn't bundle (see [Comments providers](#comments-providers)).

Overriding wholesale loses future theme updates for that file. Prefer surgical overrides: copy the partial that contains the bit you need to change, edit just that, leave everything else inherited.

## Social Icons

Menu items configured under `[[menu.main]]` or `[[menu.social]]` carry an `icon` field. IgnIt's icon dispatcher accepts two forms:

| Spec form         | Renders as                                       | Source                                                                                          |
| ----------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `"fab fa-github"` | `<i class="fab fa-github">`                      | Font Awesome glyph (any FA class, including `fas`, `far`, `fal`, custom).                       |
| `"svg:github"`    | Inline `<svg>` from `_partials/icons/github.svg` | Theme-bundled SVG, or a same-name file in your site's `templates/_partials/icons/` (site wins). |

The dispatcher picks based on the `svg:` prefix; everything else falls through to the Font Awesome path.

### Bundled Registry

The theme ships these `svg:<slug>` entries out of the box:

| Slug           | Source                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------- |
| `bilibili`     | [Simple Icons](https://simpleicons.org/?q=bilibili)                                          |
| `douban`       | [Simple Icons](https://simpleicons.org/?q=douban)                                            |
| `fediverse`    | [neodb-social/neodb](https://github.com/neodb-social/neodb) — used for NeoDB, Mastodon, etc. |
| `github`       | [Simple Icons](https://simpleicons.org/?q=github)                                            |
| `linkedin`     | [Simple Icons](https://simpleicons.org/?q=linkedin)                                          |
| `listenbrainz` | [metabrainz/design-system](https://github.com/metabrainz/design-system)                      |
| `mastodon`     | [Simple Icons](https://simpleicons.org/?q=mastodon)                                          |
| `qq`           | [Simple Icons](https://simpleicons.org/?q=qq)                                                |
| `steam`        | [Simple Icons](https://simpleicons.org/?q=steam)                                             |
| `telegram`     | [Simple Icons](https://simpleicons.org/?q=telegram)                                          |
| `zhihu`        | [Simple Icons](https://simpleicons.org/?q=zhihu)                                             |

Bundled SVGs are stripped of `<title>` and `role="img"` markers (the parent anchor carries `aria-label`, so the SVG itself is `aria-hidden`). Fill is unset so the path inherits `currentColor`, which lets a single icon scale across light / dark themes and adopt hover colors via the surrounding `<a>`.

### Adding a Custom Icon

The dispatcher resolves SVG slugs through kiln's path loader, which checks the site's templates directory before the theme's. To add or replace an icon:

1. Save your SVG at `<your-site>/templates/_partials/icons/<slug>.svg`. The viewBox should be square (e.g. `0 0 24 24`); the path should have no explicit `fill`, so it picks up `currentColor` from the surrounding link.
2. Reference it from your menu config:

   ```toml
   [[menu.social]]
   name = "menu_social_bangumi"
   url = "https://bgm.tv/user/example"
   icon = "svg:bangumi"
   weight = 9
   external = true
   ```

A site icon at the same slug as a theme-bundled one transparently overrides the theme version, which is useful when you prefer a different visual style for, say, your `github` glyph.

When mixing FA and SVG icons in the same menu group, the theme's CSS aligns both to the same horizontal slot (1.25em, the FA `fa-fw` value) so labels line up across rows regardless of icon source.

## i18n Overrides

Site translations layer on top of theme translations per [kiln's i18n model](https://github.com/hakula139/kiln/blob/main/docs/themes.md#internationalization). The full list of keys IgnIt ships is documented in [i18n](i18n.md).

To translate the theme into a language IgnIt doesn't ship, place a complete `i18n/<bcp47>.toml` in your site. To override individual strings in a language IgnIt already supports, ship just the keys you want to change. Everything else falls through to the theme's translation.

```toml
# my-site/i18n/en.toml
back_to_top = "Top"          # tighter than IgnIt's default "Back to top"
```

## Comments Providers

`[params.comments]` enables comments and selects a provider; provider-specific keys live under `[params.comments.<provider>]` (see [Parameters](parameters.md#paramscomments)). The provider name maps directly to a partial: `provider = "twikoo"` includes `_partials/comments/twikoo.html`.

To wire a provider IgnIt doesn't ship, add the partial in your site:

```text
my-site/templates/_partials/comments/giscus.html
```

The partial is responsible for emitting the provider's mount markup and CDN scripts. Theme defaults register CDN deps with SRI under `[params.deps.<provider>]` in `theme.toml`; new providers follow the same pattern (see [`CLAUDE.md`](../CLAUDE.md#dependencies) for the SRI regeneration flow).

Once the partial is in place, set the provider in your site config:

```toml
[params.comments]
enabled = true
provider = "giscus"

[params.comments.giscus]
repo = "owner/repo"
# ...remaining provider-specific keys
```

The dispatcher emits the partial only when `enabled = true`, so disabling comments site-wide also drops the provider's CDN dep entirely.

## Webfonts

Inter Variable and Maple Mono Variable are self-hosted under [`static/fonts/`](../static/fonts/) and declared in [`static/css/_src/fonts.css`](../static/css/_src/fonts.css). They're consumed via the `--font-sans` and `--font-mono` design tokens, with CJK falling through to system fonts (Sarasa Gothic SC, PingFang SC, Noto Sans CJK SC) at the end of the cascade.

To swap the body font, override the token in your site CSS:

```css
:root {
  --font-sans: 'Your Variable', system-ui, sans-serif;
}
```

Then ensure your face is loaded, either by linking a `@font-face` declaration from your override stylesheet, or by replacing `static/fonts/` outright via the [static-asset override](#template-overrides) mechanism (kiln serves `static/` from your site ahead of the theme's).

## Static Asset Overrides

Same precedence rule as templates: files in your site's `static/` directory shadow theme files at the same path. Common cases:

| Asset            | Path                          | Reason to override                      |
| ---------------- | ----------------------------- | --------------------------------------- |
| Favicon (32×32)  | `static/favicon.ico`          | Per-site brand mark                     |
| Apple touch icon | `static/apple-touch-icon.png` | Per-site brand mark                     |
| Web manifest     | `static/manifest.webmanifest` | App name, theme color, install icon set |
| `robots.txt`     | `static/robots.txt`           | Crawler controls                        |

Avoid replacing `static/css/style.css` outright, since you lose every theme component class. Cascade a site stylesheet on top instead, as described in [Visual Tokens](#visual-tokens).
