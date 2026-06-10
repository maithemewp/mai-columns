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
(600–1023px), and Narrow (under 600px). Buckets measure the container the
columns sit in — a columns block inside a sidebar or a narrow nested column
uses its Narrow arrangement even on a desktop screen. Nested columns respond
to their own available room.

An empty bucket inherits the next-wider setting. A fresh block starts with
`fill` on Wide (equal columns) and `100%` on Narrow (stacked), with Medium
inheriting Wide.

= Requirements =

* WordPress 7.0+
* PHP 8.2+

Works with any theme. Block themes get the full padding/gap/color controls
from theme.json; classic themes use the block's own defaults.

== Changelog ==

= 0.2.0 =
* Rebuild: parent-orchestrated render — the parent block resolves the whole
  arrangement and passes each column its values; no saved ids, no shared
  state. Duplicated blocks, repeated patterns, and nested columns all render
  correctly, and the editor no longer opens dirty.
* Container queries: width buckets respond to available room instead of the
  viewport (editor labels renamed Desktop/Tablet/Mobile → Wide/Medium/Narrow).
* Editor preview and front-end render share one fixture-locked arrangement
  resolver (PHP + JS mirrors) so they cannot drift.
* Arrangement control: custom tokens can repeat without polluting the
  options list; fractions/percentages over 100% rejected.
* Fractions in style attributes serialize spaced (`1 / 2`) to survive
  content-filter regexes.
* Requires WordPress 7.0+ / PHP 8.2+; composer/dev-tooling removed.

= 0.1.0 =
* Initial development release.
