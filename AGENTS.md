# AGENTS.md: IgnIt

Project-specific instructions for coding assistants working on the IgnIt theme. `CLAUDE.md` is a relative symlink to this file. Follow the user's global instructions for scope, writing, comments, and Git workflow.

IgnIt supplies MiniJinja templates, Tailwind CSS, and JavaScript to [kiln](https://github.com/hakula139/kiln) sites. Keep user-facing configuration guidance in [README.md](README.md) and [docs/](docs/). Check the theme contract and its consuming site when changing a shared template.

## Theme inputs and output

Follow [kiln's asset and stylesheet contracts](https://github.com/hakula139/kiln/blob/main/docs/assets.md). Preserve handwritten source comments.

Keep CSS rules in the partial for their concern. Use semantic component classes for repeated patterns and Tailwind utilities for small layout or responsive adjustments in templates. Define shared tokens in `tokens.css` under `@theme`, with dark values under `[data-theme='dark']`. Import order controls precedence within a layer. `prose.css`, `mermaid.css`, and `comments.css` contain unlayered overrides for typography or third-party styles. `print.css` must remain unlayered to take precedence when printing. Use Tailwind v4 utility names and trailing `!` for important utilities in `@apply`.

Maple Mono's variable font needs the `calt` feature setting in `tokens.css` for its ligatures.

## Templates and images

Shared fragments belong in `templates/_partials/` and are included by path. Use `{%-` to trim whitespace before template tags while preserving HTML indentation. Use `-%}` only where trailing whitespace must be removed. Wrap attributes one per line when an opening tag becomes long. MiniJinja autoescaping encodes `/` in URLs. Use `| safe` for trusted URLs supplied by kiln or site content and for renderer-produced HTML. Leave ordinary text escaped.

Wrap featured and background images in `.lqip` when `lqip_uri` exists. Follow [kiln's image rendering contract](https://github.com/hakula139/kiln/blob/main/docs/themes.md#image-rendering) when changing loading behavior.

## Dependencies

CDN dependencies are pinned to exact versions in `theme.toml`, with a separate SRI hash for each loaded asset under `[params.deps.<name>.sri]`. The head and body dependency partials select assets from page features and site configuration. When changing a version, calculate the SHA-384 hash of every loaded file at the new URL:

```bash
curl -sL "https://cdn.jsdelivr.net/npm/<pkg>@<version>/<path>" \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

## Internationalization

Templates read translations through `t('key')`. Client JavaScript reads `data-i18n-*` values on the document root or individual elements. Add a new string to both `i18n/en.toml` and `i18n/zh-Hans.toml`, then add it to the key reference in [docs/i18n.md](docs/i18n.md). kiln's site → theme → English fallback is documented there.

## Verification and conventions

Run `pnpm format`, `pnpm lint`, and `pnpm spellcheck` for touched source and documentation. `nix flake check` runs the Nix-side hooks. Node-side hooks no-op inside the Nix sandbox when `node_modules/` is absent, so run the `pnpm` checks directly as CI does.

Add project-specific spellings to `.cspell/words.txt`, one per line in alphabetical order. Assign pull requests to `hakula139` and label `feat` PRs `enhancement`.
