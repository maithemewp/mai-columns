# Block `supports` keys: experimental vs. stable

**Status:** current as of **WordPress 7.0** (verified 2026-06-11).
**TL;DR:** Both blocks' `block.json` intentionally use `__experimentalBorder` and
`__experimentalFontFamily` / `__experimentalFontWeight` / `__experimentalFontStyle` /
`__experimentalTextTransform` / `__experimentalTextDecoration` / `__experimentalLetterSpacing`.
**This is not stale — these are the only keys WP's PHP serializer reads.** Do **not**
"modernize" them to the un-prefixed names until the trigger below is met.

## Why these keys are still `__experimental*`

WordPress ran a multi-year effort to "stabilize" experimental block-support APIs, but
it landed on **different layers at different times**. The same feature name can be
stable in one layer and experimental in another:

| Layer | Stabilized in 7.0? | What you write |
| --- | --- | --- |
| `theme.json` `settings` / `styles` | ✅ yes | `border`, `fontFamily` (core maps `__experimentalBorder => border` in `class-wp-theme-json.php`) |
| `@wordpress/components` (e.g. `BorderControl`) | ✅ yes | un-prefixed (this is what the component docs show) |
| **`block.json` `supports` (the PHP serializer)** | ❌ **no — for border + 6 typography sub-keys** | **`__experimentalBorder`, `__experimentalFontFamily`, …** |

The trap: the BorderControl/theme.json docs show `border`, so the `block.json` key
*looks* like it should be `border` too. It isn't (yet).

**Stable already (use the clean key):** `fontSize`, `lineHeight`, `shadow`, `color`
(incl. `gradients`/`heading`/`button`), `spacing`, `align`, `anchor`, `layout`,
`interactivity`, `dimensions`, `position`. Only **border** and the **six typography
sub-controls** (font-family, font-weight, font-style, text-transform, text-decoration,
letter-spacing) lag.

## The evidence (re-run any time to re-confirm)

The serializers read only the `__experimental*` keys:

- `wp-includes/block-supports/border.php` → gated on `block_has_support($block_type, '__experimentalBorder')`.
- `wp-includes/block-supports/typography.php` → reads `$typography_supports['__experimentalFontFamily']` (and the other five).
- There is **no** stable↔experimental translator. `wp_migrate_old_typography_shape()`
  (`wp-includes/blocks.php`) only *relocates* keys under `supports.typography`; it does
  not rename them.

Core's own blocks prove it — in WP 7.0, **70** shipped `block.json` files declare
`__experimentalBorder` and **77** declare `__experimentalFontFamily`, including
`core/columns` / `core/column` (our exact parity target). Zero use a stable `border` /
`fontFamily` *supports* key.

Empirical proof (a stable key registers but never serializes):

```bash
# Stable border key → NO border CSS emitted.
wp eval '
register_block_type("test/bd", ["api_version"=>3,
  "supports"=>["border"=>["radius"=>true]],
  "render_callback"=>fn($a,$c)=>"<div ".get_block_wrapper_attributes().">x</div>"]);
echo str_contains(do_blocks("<!-- wp:test/bd {\"style\":{\"border\":{\"radius\":\"9px\"}}} /-->"),"border-radius:9px")?"works\n":"DEAD\n";'

# Stable fontFamily key → NO has-*-font-family class emitted.
wp eval '
register_block_type("test/ff", ["api_version"=>3,
  "supports"=>["typography"=>["fontFamily"=>true]],
  "render_callback"=>fn($a,$c)=>"<div ".get_block_wrapper_attributes().">x</div>"]);
echo str_contains(do_blocks("<!-- wp:test/ff {\"fontFamily\":\"crimson-text\"} /-->"),"has-crimson-text-font-family")?"works\n":"DEAD\n";'
```

Both print `DEAD` on WP 7.0.

## When it's time to update (the trigger + the steps)

**Trigger — flip to the stable keys only when BOTH are true:**

1. **Core migrates its own blocks.** Check that `core/columns` ships the stable keys:
   ```bash
   grep -E '"border"|"fontFamily"' wp-includes/blocks/columns/block.json
   ```
   When core's `columns`/`column` `block.json` uses `border:` / `fontFamily:` instead of
   the `__experimental*` forms, the serializer has been updated. (Core never ships its
   own blocks on deprecated keys, so this is the reliable signal.)
2. **The empirical test passes.** Re-run the two `wp eval` snippets above against the
   target WP version; both must print `works`.

Until then, the `__experimental*` keys remain correct and are *not* technical debt —
they are literal parity with core and back-compat is preserved when stabilization lands.

**Migration steps when the trigger is met:**

1. In `src/columns/block.json` and `src/column/block.json`, rename:
   - `__experimentalBorder` → `border`
   - `__experimentalFontFamily` → `fontFamily`, `__experimentalFontWeight` → `fontWeight`,
     `__experimentalFontStyle` → `fontStyle`, `__experimentalTextTransform` → `textTransform`,
     `__experimentalTextDecoration` → `textDecoration`, `__experimentalLetterSpacing` → `letterSpacing`
   - (`fontSize`, `lineHeight`, `shadow`, etc. are already stable — leave them.)
2. `npm run build` (copies `block.json` into `build/`, which is what registers at runtime —
   see `includes/Blocks/Columns.php`, `register_block_type( MAI_COLUMNS_DIR . 'build/columns' )`).
3. Verify the byline still renders its font: the `post-byline.html` part in the
   `balloon-juice` theme sets `"fontFamily":"crimson-text"` on `mai/columns`; the wrapper
   must keep emitting `has-crimson-text-font-family`:
   ```bash
   wp eval 'echo str_contains(do_blocks(file_get_contents(get_theme_file_path("parts/post-byline.html"))),"has-crimson-text-font-family")?"OK\n":"BROKEN\n";'
   ```
4. Bump `Requires at least` if the stable keys need a newer WP floor than the current 7.0.

## Background

This was discovered while fixing the `balloon-juice` post-byline: `mai/columns` carried
`"fontFamily":"crimson-text"` in saved markup, but the block declared no typography
support, so the attribute was inert and the font never rendered. Adding typography
support fixed it — but only with the `__experimental*` keys; a first pass using the
stable keys silently did nothing (and renaming `__experimentalBorder` → `border` broke
the previously-working border support).
