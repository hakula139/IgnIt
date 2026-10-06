# Parameter Reference

IgnIt reads its configuration from the `[params]` table in your site's `config.toml`. Theme defaults come from `theme.toml`, and site values override theme values per [kiln's parameter merging rules](https://github.com/hakula139/kiln/blob/main/docs/themes.md#parameter-merging).

## `[params]`

Top-level theme switches.

| Field                | Type     | Default                          | Description                                                                                                                                                                  |
| -------------------- | -------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cdn`                | `string` | `"https://cdn.jsdelivr.net/npm"` | CDN base URL for vendor dependencies (Font Awesome, KaTeX, lightGallery, Mermaid, Twikoo). Swap to a mirror or self-hosted base if needed.                                   |
| `code_max_lines`     | `int`    | `40`                             | Maximum visible lines before fenced code blocks gain a vertical scrollbar. `0` disables the limit.                                                                           |
| `emojis`             | `bool`   | `true`                           | Replace `:shortcode:` with the corresponding Unicode emoji during rendering.                                                                                                 |
| `fontawesome`        | `bool`   | `true`                           | Load the Font Awesome stylesheet. Disable when no `fa-*` classes are referenced anywhere in templates or content.                                                            |
| `table_nowrap_width` | `int`    | `30`                             | No-wrap threshold in terminal columns (CJK and emoji count as 2). Wrapping cells have a minimum width of half this value in em. `0` allows non-empty columns to wrap freely. |

## `[params.background]`

Site-wide background image with optional LQIP backdrop. Omit the table to use solid panel backgrounds.

| Field             | Type     | Default                  | Description                                                                                                                          |
| ----------------- | -------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `image`           | `string` | none                     | Site-relative path to the background image. Required when the table is present.                                                      |
| `lqip_uri`        | `string` | none                     | Pre-computed `data:image/webp;base64,...` URI rendered as a blurred backdrop until the full image decodes. Optional but recommended. |
| `position`        | `string` | `"center"`               | Desktop CSS `object-position` value (e.g., `"top"`, `"70% 50%"`).                                                                    |
| `position_mobile` | `string` | falls back to `position` | Mobile-only CSS `object-position`. Useful for crops that frame poorly on portrait viewports.                                         |

`lqip_uri` is a hand-rolled placeholder because kiln auto-generates LQIPs only for content `<img>` tags. See [kiln's image pipeline docs](https://github.com/hakula139/kiln/blob/main/docs/themes.md#image-rendering) for the data-URI format.

## `[params.home]` / `[params.home.profile]`

Home-page profile panel and pagination.

| Field      | Type  | Default | Description                                                                     |
| ---------- | ----- | ------- | ------------------------------------------------------------------------------- |
| `paginate` | `int` | `8`     | Posts per page on the home listing. Falls back to `params.paginate` when unset. |

```toml
[params.home.profile]
avatar = "/assets/images/avatar.webp" # Site-relative or absolute URL
title = "Site Title" # Falls back to config.title when unset
subtitle = "An optional tagline"
```

| Field      | Type     | Default        | Description                                                                |
| ---------- | -------- | -------------- | -------------------------------------------------------------------------- |
| `avatar`   | `string` | none           | Profile avatar image. Site-relative path or absolute URL. Omit to hide.    |
| `title`    | `string` | `config.title` | Heading shown above the subtitle. Override to display a different name.    |
| `subtitle` | `string` | none           | Tagline below the title. `\n` adds a mobile-only line break. Omit to hide. |

In a double-quoted subtitle, `\n` places a line break below 640px. At larger widths the two parts join directly, so put a space before `\n` when the words need one.

The optional social row under the profile is populated from `[[menu.social]]` and rendered in `weight` order. See [Customization → Social icons](customization.md#social-icons) for the icon spec format.

## `[params.section]`

Section-archive pagination.

| Field      | Type  | Default | Description                                                                      |
| ---------- | ----- | ------- | -------------------------------------------------------------------------------- |
| `paginate` | `int` | `10`    | Posts per page on `/posts/<section>/` archives. Falls back to `params.paginate`. |

## `[params.comments]`

Per-post comment system.

| Field      | Type     | Default    | Description                                                                                 |
| ---------- | -------- | ---------- | ------------------------------------------------------------------------------------------- |
| `enabled`  | `bool`   | `false`    | Master switch. The comments partial and its CDN dep load only when enabled.                 |
| `provider` | `string` | `"twikoo"` | Provider key selected by the comments dispatcher. `"twikoo"` is the only built-in provider. |

Provider-specific configuration lives under `[params.comments.<provider>]`:

```toml
[params.comments]
enabled = true
provider = "twikoo"

[params.comments.twikoo]
api_url = "https://twikoo.example.com"
visitor = true
```

| Field     | Type     | Default | Description                                                                |
| --------- | -------- | ------- | -------------------------------------------------------------------------- |
| `api_url` | `string` | —       | Twikoo API endpoint.                                                       |
| `visitor` | `bool`   | `false` | Show and increment the Twikoo view count on each post and standalone page. |

The visitor counter requires comments to be enabled with the Twikoo provider. It records raw page hits, so each successful Twikoo initialization increments the count, including reloads and repeat visits.

Adding a provider is a [Customization](customization.md#comments-providers) topic.

## `[params.lightgallery]`

Fullscreen gallery for article figures and Twikoo content images. Enabling it loads lightGallery's core, thumbnail, and zoom assets.

```toml
[params.lightgallery]
enabled = true
license_key = "your-license-key"
```

| Field         | Type     | Default | Description                                                                                                                                             |
| ------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`     | `bool`   | `false` | Enable gallery wrapping and load the lightGallery assets.                                                                                               |
| `license_key` | `string` | none    | License key passed to lightGallery. Omit it to use the temporary evaluation key. See [lightGallery licensing](https://www.lightgalleryjs.com/license/). |

## `[params.footer]`

Footer copyright line and license badge.

```toml
[params.footer]
since = 2018
license = "CC BY-NC-SA 4.0"
license_url = "https://creativecommons.org/licenses/by-nc-sa/4.0/"
powered_by = true
```

| Field         | Type     | Default | Description                                                                                              |
| ------------- | -------- | ------- | -------------------------------------------------------------------------------------------------------- |
| `since`       | `int`    | none    | Copyright start year. The footer renders `<since>–<current year>` when set, current year only otherwise. |
| `license`     | `string` | none    | License name shown after the copyright line.                                                             |
| `license_url` | `string` | none    | URL the license name links to.                                                                           |
| `powered_by`  | `bool`   | `true`  | Show the "Powered by kiln & IgnIt" attribution line.                                                     |

## `[params.deps.<name>]`

Pinned versions and SRI hashes for vendor CDN dependencies. The table is theme-internal and changes only when a dep version is bumped. Contributor steps for changing a dependency are in [`AGENTS.md`](../AGENTS.md#dependencies). Sites consuming defaults do not need to touch this table.

## Menu groups

`[[menu.main]]` populates the header navigation, and `[[menu.social]]` populates the home profile social row. Both follow [kiln's menu schema](https://github.com/hakula139/kiln/blob/main/docs/themes.md#navigation-menus). IgnIt extends the `icon` field to accept either a Font Awesome class string (`"fab fa-github"`) or a `svg:<slug>` reference resolved against `templates/_partials/icons/<slug>.svg`. See [Customization → Social icons](customization.md#social-icons) for the bundled registry and the override pattern.
