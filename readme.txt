=== Mai Columns ===
Contributors:      bizbudding, jivedig
Tags:              block, columns, layout, flexbox, container queries
Requires at least: 7.0
Requires PHP:      8.2
Tested up to:      7.0
Stable tag:        0.2.0
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

Repeatable, per-width column arrangements with simple and complex layouts.

== Description ==

Mai Columns adds two blocks — Mai Columns and Mai Column — for building
column layouts that respond to the space they sit in, not the device.

= Arrangements =

Instead of sizing each column by hand, you define an arrangement: a sequence
of size tokens that repeats across however many columns you add. An
arrangement of `1/3, 2/3` over four columns yields two third/two-thirds rows;
add a fifth column and it lands on `1/3` automatically.

= Token vocabulary =

* Preset fractions — `25%`, `33%`, `50%`, `66%`, `75%`, `100%` (stored as
  reduced fractions like `1/4`, `1/3`).
* Custom fractions — any fraction up to `1/1`, e.g. `2/5`.
* Percentages — any value up to `100%`, normalized to a reduced fraction.
* CSS lengths — fixed-size columns like `300px` or `20rem`.
* `fit` — the column shrinks to its content.
* `fill` — the column expands to share the remaining space (equal widths
  when every column fills).
* `break` — forces the following column onto a new row in that width bucket.

= Wide / Medium / Narrow: container buckets, not devices =

Each arrangement is set per width bucket: Wide (1024px and up), Medium
(640–1023px), and Narrow (under 640px). Buckets measure the container the
columns sit in — a columns block inside a sidebar or a narrow nested column
uses its Narrow arrangement even on a desktop screen. Nested columns respond
to their own available room.

An empty bucket inherits the next-wider setting. A fresh block starts with
`fill` on Wide (equal columns) and `100%` on Narrow (stacked), with Medium
inheriting Wide.

= Ordering =

Reverse the visual order of all columns per bucket (e.g. text before image
when stacked on Narrow), or give an individual column its own order value
per bucket. Ordering is visual only — keyboard and screen reader order
follows the document.

= Requirements =

* WordPress 7.0+
* PHP 8.2+

Works with any theme. Block themes get the full padding/gap/color controls
from theme.json; classic themes use the block's own defaults.

== Screenshots ==

1. The Column Arrangements settings — sortable, repeatable size tokens per width bucket (Wide / Medium / Narrow).
2. A repeating fraction pattern: 1/3 + 2/3 over four columns.
3. Sizing tokens: fit hugs content, fill takes the leftover space, fixed CSS lengths like 300px.
4. Row breaks end a row before it is full — with fractions or sizing tokens.
5. Nested columns measure their own container and stack when their column is narrow, even on desktop.

== Changelog ==

= 0.2.0 =
* Fixed: Row composition follows the arrangement, never content — a fill
  column's wide content (long word, image) no longer forces unintended wraps
  (min-width: 0 on columns).
* Fixed: A parent's horizontal justify setting no longer bleeds into every
  column's vertical content alignment (custom-prop inheritance sealed at the
  column).
* Added: Border supports (color/radius/style/width) on both blocks.
* Fixed: Children now receive the full ancestry context (postId etc.) —
  context-consuming blocks like core/avatar rendered empty inside columns.
* Changed: Default column gap follows the theme's global block gap.
* Changed: Fixed-length columns (`300px`, `20rem`) are truly fixed — siblings
  never squeeze them (they wrap to a new row instead), shrinking only when the
  container itself is narrower than the fixed size.
* Added: Column blockGap renders as the column's content gap (children get the
  standard flex-layout margin reset — gap is the single spacing source,
  defaulting to the theme's global block gap).
* Added: Column ordering — per-bucket "Reverse" toggles on the parent and a
  per-column order value per bucket (visual order only; keyboard/screen reader
  order unchanged).
* Added: Tag-based updater (Plugin Update Checker v5) — sites see updates once
  releases are tagged.
* Changed: Rebuilt rendering — the parent block resolves the whole arrangement
  and passes each column its values. Duplicated blocks, repeated patterns, and
  nested columns all render correctly, and the editor no longer opens dirty.
* Changed: Width buckets respond to the container (container queries), not the
  viewport. Labels renamed Desktop/Tablet/Mobile → Wide/Medium/Narrow;
  boundaries 640/1024px.
* Changed: Editor preview and front-end render share one fixture-locked
  arrangement resolver (PHP + JS mirrors) so they cannot drift.
* Fixed: Custom tokens can repeat without polluting the options list;
  fractions/percentages over 100% rejected.
* Changed: Requires WordPress 7.0+ / PHP 8.2+.

= 0.1.0 =
* Initial development release.
