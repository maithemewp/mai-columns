# Mai Columns rebuild — design

> **Status:** Approved design, pending plan (`docs/plans/`). Decisions locked
> with Mike 2026-06-10 (brainstorm in the Balloon Juice rebuild session).
> Starting point: `select-sortable` @ `93aafef` (latest line = `develop` + the
> two react-select sortable-control commits).

## What this is

Finalize the stalled v0.1.0 `mai/columns` + `mai/column` native blocks as a
maintained plugin: repeatable per-breakpoint column arrangements
(`25%…100%`, fractions, arbitrary CSS sizes, `fit`, `fill`, `break`) edited
through a sortable/creatable react-select control, rendered as flexbox with
CSS custom properties.

**Targets:** PHP 8.2+, **WordPress 7.0+** (locked — we use current block
APIs freely), any theme (block themes get full padding/gap/etc. controls
from theme.json; classic themes degrade to the block's own defaults). Repo
`maithemewp/mai-columns`. **No tagging/release in scope** — develop until
Mike tags it himself. Version stays `0.x` until then.

## Decisions (locked 2026-06-10)

1. **Standalone** — zero mai-engine/ACF dependencies. The ACF Mai Columns in
   mai-engine is untouched; no content migration (non-goal).
2. **Container queries** for the responsive model. Buckets mean available
   room, not devices. The entire mechanism lives in ONE stylesheet layer so
   reverting to viewport media queries is a one-file diff (both variants
   documented side-by-side in that file; no runtime toggle — YAGNI).
3. **Keep react-select + dnd-kit** for the arrangement control (editor-only
   bundle; sortable + creatable + duplicate tokens is exactly what native
   components still can't do). Fix the known duplicate-option-in-list bug.
4. **Architecture A-prime: parent-orchestrated render, zero identity.**
   Mike's question ("inner blocks render before the parent — will runtime
   stamping work?") killed the runtime-id variant and led here; verified in
   WP 7.0 source.
5. **Flexbox, not grid** (grid can't center an incomplete last row —
   `justify-content` does it free). Recorded non-goal.
6. **Attribute names keep** `sizesLg` / `sizesMd` / `sizesSm` (existing test
   content keeps working); the saved `id` attribute is **deleted**.
7. **Fractions serialize with spaces in style attributes**: `--size-lg: 1 / 2`,
   never `1/2`. Mai Engine scar tissue (2026-06-10, Mike): a recipe plugin's
   fraction-beautifier regex-replaced bare `1/2` inside `style=""` with a ½
   glyph and broke layouts. `N / D` is equally valid in `calc()` and immune.
   The resolver ACCEPTS `1/2`, `1 / 2`, and `50%` as input; OUTPUT is always
   the spaced form.

## Architecture

### Render (the core fix)

`mai/columns` registers with **`skip_inner_blocks => true`** (the
`core/post-template` pattern, `class-wp-block.php:541`): WP does NOT
pre-render children; the parent's `render_callback` receives empty content
and renders children itself:

1. Resolve the arrangement ONCE via a pure `ArrangementResolver` unit:
   per-bucket fallback chains (lg→md→sm and reverse, as the current code
   does), `break` extraction, modulo repeat over N children, token parsing
   (fraction / percentage→reduced-fraction / `fit` / `fill` / arbitrary CSS
   length). No WP functions — plain-PHP-harness testable.
2. Loop `$block->parsed_block['innerBlocks']`: for child *i*, render via
   `new WP_Block( $child, $parent_context + resolved values for i )` —
   per-child context like post-template passes `postId`.
3. Insert `break` spans as REAL SIBLINGS from the parent
   (`<span class="mai-column__break mai-column__break-{bucket}">`) — no
   child-side prepending.
4. Wrap in the `.mai-columns` container div (`get_block_wrapper_attributes`,
   container-level custom props: `--align-items`, `--justify-content`,
   `--row-gap`/`--column-gap` from blockGap).

`mai/column` becomes a dumb shell: reads its resolved size/flex values from
context, emits its wrapper with `--size-{bucket}` / `--flex-{bucket}` custom
props + its own supports (color, padding, blockGap, vertical alignment).

**No static arrays, no counters, no saved or runtime ids anywhere.**
Duplication-safe, nesting-safe, repeat-render-safe by construction. The
abandoned DOMDocument and Tag-Processor experiments in `mai-columns.php` are
deleted.

### Why not the saved-id model (the three bugs it carried)

1. `useEffect` re-stamped `id = clientId` every editor session → every edit
   screen opened dirty, every save churned content.
2. Duplicated blocks / twice-rendered patterns shared a saved id → position
   counters interleaved → wrong widths.
3. Request-lifetime static arrays → second render of the same block (query
   loop, REST/lazy render) continued counting instead of restarting.

These three become the regression-test matrix.

### Responsive layer (one file)

`.mai-columns { container-type: inline-size; }` + three `@container`
buckets selecting which `--size-{bucket}` / `--flex-{bucket}` feeds the live
`--size` / `--flex`, plus per-bucket `mai-column__break-*` visibility —
mechanically identical to the current viewport version (`style.scss`), with
the `@media` variant kept alongside in comments for the documented revert.
Bucket boundaries (600 / 1024 px to start) live as SCSS vars; editor field
labels become **Wide / Medium / Narrow** with help text "based on the space
the columns sit in, not the device".

`--flex-basis` gap math stays:
`calc((100% * var(--size) - (var(--column-gap) * (1 - var(--size)))) - 0.025px)`.
The `gap … !important` workaround against `is-layout-flex` gets re-checked
on WP 7.0 and removed if core no longer stomps it.

### Editor

- `edit.js` keeps the three `SelectSortable` fields (relabeled), toolbar
  justify/vertical-align/Add Column, blockGap support. The dead
  `MultiSelectSortableDuplicates` commented blocks and the `id` `useEffect`
  are deleted.
- **Fix the duplicate-option bug**: creating a custom token must not inject
  a duplicate entry into the options list (selected values may repeat;
  the OPTIONS menu must stay unique).
- Editor preview parity: the same stylesheet runs in the editor (container
  queries make the canvas preview honest); per-column custom props are
  computed by a small JS `arrangement.js` module that mirrors
  `ArrangementResolver` — **both consume one shared JSON fixtures file**, so
  PHP and JS can't drift.
- Salvage check: two old stashes on `develop` (`allow px/rem/etc again`) —
  inspect for validation logic worth keeping, then drop the stashes.

### Modernization envelope

- PHP 8.2+: `declare(strict_types=1)`, namespace (`Mai\Columns`), typed
  properties, small focused classes (`Plugin`, `Blocks\Columns`,
  `Blocks\Column`, `ArrangementResolver`), docblocks per the WHY convention
  (between hook call and callback).
- Headers: `Requires at least: 7.0`, `Requires PHP: 8.2`.
- `block.json` apiVersion 3 (already); add `supports.align` on the parent
  (wide/full); keep child supports (color, padding, blockGap).
- Tooling: current `@wordpress/scripts`, react-select / dnd-kit bumped to
  latest, `package copy.json` deleted, build committed per repo convention.
- All `ray()` calls and commented experiments removed.
- readme.txt rewritten (what it does, token vocabulary, container-query
  bucket explanation).

## Testing

- **PHP harness** (plain PHP, no WP): `ArrangementResolver` — fallback
  chains both directions, modulo repeat, fraction/percent reduction
  (`50%`→`1/2`), `fit`/`fill` flex values, `break` extraction, arbitrary CSS
  lengths, empty-bucket inheritance.
- **Shared fixtures**: one JSON file of arrangement→expected-values cases
  consumed by both the PHP harness and a JS test for `arrangement.js`.
- **Playwright (real Chrome)**: a fixture page with (a) a 1/3+2/3 repeating
  arrangement at three container widths, (b) `fit`/`fill`/`break` behavior,
  (c) the regression matrix — duplicated block, same block twice via
  pattern, nested columns-in-columns — asserting computed flex-basis per
  column.
- Editor smoke: control creates/sorts/duplicates tokens; no dirty state on
  fresh open (bug 1 regression).

## Non-goals

- CSS grid layout (last-row centering), viewport-mode toggle, ACF
  mai-columns migration, tagging/releasing (PUC/version bump deferred until
  Mike tags), Balloon Juice adoption (separate follow-up plan — the
  masthead-as-flexbox walkthrough kicks that off).

## Follow-up (out of scope, recorded)

- BJ pilot: masthead / sidebar / footer conversions once the plugin is
  solid.
- Release round: version 1.0.0, tag, PUC wiring — Mike's call on timing.
