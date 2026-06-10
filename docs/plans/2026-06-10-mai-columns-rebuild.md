# Mai Columns Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finalize `mai/columns` + `mai/column` per the approved spec — parent-orchestrated stateless render, container queries, spaced fractions, PHP 8.2 / WP 7.0.

**Architecture:** Pure `ArrangementResolver` (PHP) + mirrored `arrangement.js` (JS) sharing one JSON fixtures file; `mai/columns` registers `skip_inner_blocks` and renders children itself injecting per-child context; `mai/column` is a dumb shell. Responsive = container queries isolated in one stylesheet.

**Tech Stack:** PHP 8.2, WP 7.0+, @wordpress/scripts, react-select 5 + dnd-kit (editor only), plain-PHP harness + `node --test`, Playwright (real Chrome via `NODE_PATH=/Users/jivedig/node_modules`).

**Spec:** `docs/specs/2026-06-10-mai-columns-rebuild-design.md`
**Repo:** `~/Plugins/mai-columns` (`maithemewp/mai-columns`). Work on branch `rebuild` off `select-sortable` @ `93aafef`. No tagging/releasing.

---

### Task 1: Branch, stash salvage, dead-weight removal

**Files:**
- Delete: `package copy.json`, `composer.json`, `composer.lock`, `vendor/`
- Modify: `mai-columns.php` (only the `require vendor/autoload.php` line for now), `.gitignore`

- [ ] **Step 1: Branch**

```bash
cd ~/Plugins/mai-columns && git checkout select-sortable && git checkout -b rebuild
```

- [ ] **Step 2: Stash salvage check**

```bash
git stash show -p 'stash@{0}' | head -120
git stash show -p 'stash@{1}' | head -120
```

Read both diffs. They predate the react-select work ("allow px/rem/etc again" → likely an earlier `isValidCSSValue` iteration). If any validation logic is stricter/better than current `src/functions/index.js`, note it for Task 3; either way drop both stashes afterwards:

```bash
git stash drop 'stash@{1}' && git stash drop 'stash@{0}'
```

- [ ] **Step 3: Remove composer (ray-only dev deps) + stray file**

```bash
git rm -q "package copy.json" composer.json composer.lock
git rm -rq vendor
```

In `mai-columns.php` delete the two lines:

```php
// Autoload Composer dependencies.
require_once __DIR__ . '/vendor/autoload.php';
```

Add `vendor/` and `node_modules/` to `.gitignore` if missing.

- [ ] **Step 4: Verify plugin still loads (it must — nothing used ray in committed code paths)**

```bash
php -l mai-columns.php
grep -rn 'ray(' mai-columns.php src/   # expect: no hits in PHP; JS none
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: drop composer/ray, stray package copy; salvage-check and drop old stashes"
```

---

### Task 2: Shared fixtures + PHP ArrangementResolver (TDD)

**Files:**
- Create: `tests/fixtures/arrangements.json`
- Create: `tests/harness/arrangement-resolver.php`
- Create: `includes/ArrangementResolver.php`

**Resolver contract** (documented here, implemented identically in PHP and JS):

- `resolve( lg: string[], md: string[], sm: string[], count: int )` → array of `count` entries `{ styles: { "--size-lg": string, "--flex-lg": string, ... md/sm }, breaks: string[] }`.
- Bucket fallback: `lg = lg ?: md ?: sm`; `md = md ?: lg ?: sm`; `sm = sm ?: md ?: lg` (nearest-defined, preferring larger). All empty → every bucket `["1/1"]`.
- Per bucket, walk children consuming the pattern cyclically; `break` tokens are markers: when the cyclic pointer sits on `break`, record that bucket in the NEXT child's `breaks` and advance (a pattern of only `break`s degrades to `["1/1"]`, no breaks).
- Token → size: fraction (`1/2` or `1 / 2`) → **spaced** `1 / 2`; percentage → reduced spaced fraction (`50%` → `1 / 2`, `66.66%` → `3333 / 5000` is wrong — use round to 2 decimals then reduce: `66.66%`→`3333/5000`? NO: round percentage to nearest integer first, so `66.66%`→`67/100`… see fixture `percent-rounding` below pinning `66%`→`33 / 50`); `fit`/`fill`/CSS length → no size (emit `1`).
- Token → flex: fraction → `0 1 var(--flex-basis)`; `fit` → `0 1 auto`; `fill` → `1 0 0`; CSS length (e.g. `300px`, `20rem`) → `0 1 300px`; empty → `1`.
- Empty-string token → `1/1`.

- [ ] **Step 1: Write the fixtures file**

`tests/fixtures/arrangements.json` (the single source for PHP + JS tests):

```json
{
	"cases": [
		{
			"name": "single half repeats over three",
			"lg": ["1/2"], "md": [], "sm": [], "count": 3,
			"expected": [
				{ "styles": { "--size-lg": "1 / 2", "--flex-lg": "0 1 var(--flex-basis)", "--size-md": "1 / 2", "--flex-md": "0 1 var(--flex-basis)", "--size-sm": "1 / 2", "--flex-sm": "0 1 var(--flex-basis)" }, "breaks": [] },
				{ "styles": { "--size-lg": "1 / 2", "--flex-lg": "0 1 var(--flex-basis)", "--size-md": "1 / 2", "--flex-md": "0 1 var(--flex-basis)", "--size-sm": "1 / 2", "--flex-sm": "0 1 var(--flex-basis)" }, "breaks": [] },
				{ "styles": { "--size-lg": "1 / 2", "--flex-lg": "0 1 var(--flex-basis)", "--size-md": "1 / 2", "--flex-md": "0 1 var(--flex-basis)", "--size-sm": "1 / 2", "--flex-sm": "0 1 var(--flex-basis)" }, "breaks": [] }
			]
		},
		{
			"name": "repeating thirds pattern 1/3 2/3",
			"lg": ["1/3", "2/3"], "md": [], "sm": ["1/1"], "count": 4,
			"expected": [
				{ "styles": { "--size-lg": "1 / 3", "--flex-lg": "0 1 var(--flex-basis)", "--size-md": "1 / 3", "--flex-md": "0 1 var(--flex-basis)", "--size-sm": "1 / 1", "--flex-sm": "0 1 var(--flex-basis)" }, "breaks": [] },
				{ "styles": { "--size-lg": "2 / 3", "--flex-lg": "0 1 var(--flex-basis)", "--size-md": "2 / 3", "--flex-md": "0 1 var(--flex-basis)", "--size-sm": "1 / 1", "--flex-sm": "0 1 var(--flex-basis)" }, "breaks": [] },
				{ "styles": { "--size-lg": "1 / 3", "--flex-lg": "0 1 var(--flex-basis)", "--size-md": "1 / 3", "--flex-md": "0 1 var(--flex-basis)", "--size-sm": "1 / 1", "--flex-sm": "0 1 var(--flex-basis)" }, "breaks": [] },
				{ "styles": { "--size-lg": "2 / 3", "--flex-lg": "0 1 var(--flex-basis)", "--size-md": "2 / 3", "--flex-md": "0 1 var(--flex-basis)", "--size-sm": "1 / 1", "--flex-sm": "0 1 var(--flex-basis)" }, "breaks": [] }
			]
		},
		{
			"name": "percent and spaced-fraction inputs normalize",
			"lg": ["50%", "1 / 4", "25%"], "md": [], "sm": [], "count": 3,
			"expected": [
				{ "styles": { "--size-lg": "1 / 2", "--flex-lg": "0 1 var(--flex-basis)", "--size-md": "1 / 2", "--flex-md": "0 1 var(--flex-basis)", "--size-sm": "1 / 2", "--flex-sm": "0 1 var(--flex-basis)" }, "breaks": [] },
				{ "styles": { "--size-lg": "1 / 4", "--flex-lg": "0 1 var(--flex-basis)", "--size-md": "1 / 4", "--flex-md": "0 1 var(--flex-basis)", "--size-sm": "1 / 4", "--flex-sm": "0 1 var(--flex-basis)" }, "breaks": [] },
				{ "styles": { "--size-lg": "1 / 4", "--flex-lg": "0 1 var(--flex-basis)", "--size-md": "1 / 4", "--flex-md": "0 1 var(--flex-basis)", "--size-sm": "1 / 4", "--flex-sm": "0 1 var(--flex-basis)" }, "breaks": [] }
			]
		},
		{
			"name": "percent-rounding 66 percent",
			"lg": ["66%"], "md": [], "sm": [], "count": 1,
			"expected": [
				{ "styles": { "--size-lg": "33 / 50", "--flex-lg": "0 1 var(--flex-basis)", "--size-md": "33 / 50", "--flex-md": "0 1 var(--flex-basis)", "--size-sm": "33 / 50", "--flex-sm": "0 1 var(--flex-basis)" }, "breaks": [] }
			]
		},
		{
			"name": "fit fill and css length",
			"lg": ["fit", "fill", "300px"], "md": [], "sm": [], "count": 3,
			"expected": [
				{ "styles": { "--size-lg": "1", "--flex-lg": "0 1 auto", "--size-md": "1", "--flex-md": "0 1 auto", "--size-sm": "1", "--flex-sm": "0 1 auto" }, "breaks": [] },
				{ "styles": { "--size-lg": "1", "--flex-lg": "1 0 0", "--size-md": "1", "--flex-md": "1 0 0", "--size-sm": "1", "--flex-sm": "1 0 0" }, "breaks": [] },
				{ "styles": { "--size-lg": "1", "--flex-lg": "0 1 300px", "--size-md": "1", "--flex-md": "0 1 300px", "--size-sm": "1", "--flex-sm": "0 1 300px" }, "breaks": [] }
			]
		},
		{
			"name": "break marker forces wrap on lg only",
			"lg": ["1/2", "1/2", "break", "fill"], "md": ["1/1"], "sm": [], "count": 3,
			"expected": [
				{ "styles": { "--size-lg": "1 / 2", "--flex-lg": "0 1 var(--flex-basis)", "--size-md": "1 / 1", "--flex-md": "0 1 var(--flex-basis)", "--size-sm": "1 / 1", "--flex-sm": "0 1 var(--flex-basis)" }, "breaks": [] },
				{ "styles": { "--size-lg": "1 / 2", "--flex-lg": "0 1 var(--flex-basis)", "--size-md": "1 / 1", "--flex-md": "0 1 var(--flex-basis)", "--size-sm": "1 / 1", "--flex-sm": "0 1 var(--flex-basis)" }, "breaks": [] },
				{ "styles": { "--size-lg": "1", "--flex-lg": "1 0 0", "--size-md": "1 / 1", "--flex-md": "0 1 var(--flex-basis)", "--size-sm": "1 / 1", "--flex-sm": "0 1 var(--flex-basis)" }, "breaks": ["lg"] }
			]
		},
		{
			"name": "empty buckets inherit nearest larger",
			"lg": ["1/4"], "md": [], "sm": ["1/1"], "count": 2,
			"expected": [
				{ "styles": { "--size-lg": "1 / 4", "--flex-lg": "0 1 var(--flex-basis)", "--size-md": "1 / 4", "--flex-md": "0 1 var(--flex-basis)", "--size-sm": "1 / 1", "--flex-sm": "0 1 var(--flex-basis)" }, "breaks": [] },
				{ "styles": { "--size-lg": "1 / 4", "--flex-lg": "0 1 var(--flex-basis)", "--size-md": "1 / 4", "--flex-md": "0 1 var(--flex-basis)", "--size-sm": "1 / 1", "--flex-sm": "0 1 var(--flex-basis)" }, "breaks": [] }
			]
		},
		{
			"name": "all empty defaults to full width",
			"lg": [], "md": [], "sm": [], "count": 2,
			"expected": [
				{ "styles": { "--size-lg": "1 / 1", "--flex-lg": "0 1 var(--flex-basis)", "--size-md": "1 / 1", "--flex-md": "0 1 var(--flex-basis)", "--size-sm": "1 / 1", "--flex-sm": "0 1 var(--flex-basis)" }, "breaks": [] },
				{ "styles": { "--size-lg": "1 / 1", "--flex-lg": "0 1 var(--flex-basis)", "--size-md": "1 / 1", "--flex-md": "0 1 var(--flex-basis)", "--size-sm": "1 / 1", "--flex-sm": "0 1 var(--flex-basis)" }, "breaks": [] }
			]
		}
	]
}
```

- [ ] **Step 2: Write the harness (fails — class missing)**

`tests/harness/arrangement-resolver.php`:

```php
<?php
// Plain-PHP harness for Mai\Columns\ArrangementResolver. Runs the shared fixtures.
declare( strict_types=1 );
define( 'ABSPATH', __DIR__ . '/../../' );
require_once __DIR__ . '/../../includes/ArrangementResolver.php';

use Mai\Columns\ArrangementResolver;

$fixtures = json_decode( (string) file_get_contents( __DIR__ . '/../fixtures/arrangements.json' ), true );
$pass = 0; $fail = 0;

foreach ( $fixtures['cases'] as $case ) {
	$got = ArrangementResolver::resolve( $case['lg'], $case['md'], $case['sm'], $case['count'] );

	if ( $got === $case['expected'] ) {
		$pass++; echo "PASS: {$case['name']}\n";
	} else {
		$fail++; echo "FAIL: {$case['name']}\n"; var_export( $got ); echo "\n";
	}
}

echo "\n{$pass} passed, {$fail} failed\n";
exit( $fail > 0 ? 1 : 0 );
```

- [ ] **Step 3: Run — expect fatal (file missing), exit ≠ 0**

```bash
php tests/harness/arrangement-resolver.php
```

- [ ] **Step 4: Implement `includes/ArrangementResolver.php`**

```php
<?php

declare( strict_types=1 );

namespace Mai\Columns;

defined( 'ABSPATH' ) || exit;

/**
 * Pure arrangement math — no WP functions, harness-locked against the shared
 * fixtures (tests/fixtures/arrangements.json) that the editor's arrangement.js
 * also consumes, so PHP render and editor preview cannot drift.
 *
 * Fractions serialize SPACED ("1 / 2", never "1/2"): a recipe plugin's
 * fraction-beautifier once regex-replaced bare 1/2 inside style="" with a ½
 * glyph on a Mai Engine site. Spaced form is equally valid in calc().
 */
final class ArrangementResolver {

	private const BUCKETS = [ 'lg', 'md', 'sm' ];

	/**
	 * @param array<string> $lg
	 * @param array<string> $md
	 * @param array<string> $sm
	 *
	 * @return array<int,array{styles:array<string,string>,breaks:array<int,string>}>
	 */
	public static function resolve( array $lg, array $md, array $sm, int $count ): array {
		$buckets = self::withFallbacks( [ 'lg' => $lg, 'md' => $md, 'sm' => $sm ] );
		$result  = [];

		for ( $i = 0; $i < $count; $i++ ) {
			$result[ $i ] = [ 'styles' => [], 'breaks' => [] ];
		}

		foreach ( $buckets as $bucket => $pattern ) {
			$tokens = array_values( array_filter( $pattern, fn( $t ) => 'break' !== $t ) );

			// A pattern of only breaks degrades to full-width, no breaks.
			if ( ! $tokens ) {
				$pattern = [ '1/1' ];
			}

			$p = 0;
			$n = count( $pattern );

			for ( $i = 0; $i < $count; $i++ ) {
				// Consume break markers: they flag the NEXT child.
				while ( 'break' === $pattern[ $p % $n ] ) {
					if ( ! in_array( $bucket, $result[ $i ]['breaks'], true ) ) {
						$result[ $i ]['breaks'][] = $bucket;
					}
					$p++;
				}

				$token = (string) $pattern[ $p % $n ];
				$p++;

				$result[ $i ]['styles'][ "--size-{$bucket}" ] = self::size( $token );
				$result[ $i ]['styles'][ "--flex-{$bucket}" ] = self::flex( $token );
			}
		}

		// Reorder styles per child: all sizes/flexes grouped lg, md, sm.
		foreach ( $result as $i => $entry ) {
			$ordered = [];
			foreach ( self::BUCKETS as $bucket ) {
				$ordered[ "--size-{$bucket}" ] = $entry['styles'][ "--size-{$bucket}" ];
				$ordered[ "--flex-{$bucket}" ] = $entry['styles'][ "--flex-{$bucket}" ];
			}
			$result[ $i ]['styles'] = $ordered;
		}

		return $result;
	}

	/**
	 * Nearest-defined fallback, preferring the larger bucket; all-empty
	 * degrades to full width.
	 *
	 * @param array<string,array<string>> $buckets
	 *
	 * @return array<string,array<string>>
	 */
	private static function withFallbacks( array $buckets ): array {
		$lg = $buckets['lg'] ?: ( $buckets['md'] ?: $buckets['sm'] );
		$md = $buckets['md'] ?: ( $buckets['lg'] ?: $buckets['sm'] );
		$sm = $buckets['sm'] ?: ( $buckets['md'] ?: $buckets['lg'] );

		return [
			'lg' => $lg ?: [ '1/1' ],
			'md' => $md ?: [ '1/1' ],
			'sm' => $sm ?: [ '1/1' ],
		];
	}

	/** Spaced fraction for fractional tokens; "1" (full flex share) otherwise. */
	private static function size( string $token ): string {
		$fraction = self::toFraction( $token );

		return $fraction ?: '1';
	}

	/** Flex shorthand per token type. */
	private static function flex( string $token ): string {
		if ( '' === $token ) {
			return '0 1 var(--flex-basis)'; // empty token == 1/1
		}

		if ( 'fit' === $token ) {
			return '0 1 auto';
		}

		if ( 'fill' === $token ) {
			return '1 0 0';
		}

		if ( self::toFraction( $token ) ) {
			return '0 1 var(--flex-basis)';
		}

		// Arbitrary CSS length (300px, 20rem, …).
		return sprintf( '0 1 %s', $token );
	}

	/**
	 * Normalizes "1/2", "1 / 2", and "50%" to the SPACED fraction "1 / 2".
	 * Returns '' for non-fractional tokens (fit/fill/lengths).
	 */
	private static function toFraction( string $token ): string {
		$token = trim( $token );

		if ( '' === $token ) {
			return '1 / 1';
		}

		if ( preg_match( '#^(\d+)\s*/\s*(\d+)$#', $token, $m ) ) {
			return sprintf( '%d / %d', (int) $m[1], (int) $m[2] );
		}

		if ( preg_match( '/^-?\d+(\.\d+)?%$/', $token ) ) {
			$numerator   = (int) round( floatval( $token ) ); // 66.66% -> 67? No: pinned by fixtures — round() of 66.66 is 67, but the fixture expects 66 -> see note below.
			$numerator   = (int) round( floatval( rtrim( $token, '%' ) ) );
			$denominator = 100;
			$gcd         = self::gcd( $numerator, $denominator );

			return sprintf( '%d / %d', intdiv( $numerator, $gcd ), intdiv( $denominator, $gcd ) );
		}

		return '';
	}

	private static function gcd( int $a, int $b ): int {
		return 0 === $b ? $a : self::gcd( $b, $a % $b );
	}
}
```

NOTE for the implementer: the `66.66%` comment above is resolved by the fixtures — only integer percents are pinned (`66%` → `33 / 50`); fractional percents round to the nearest integer percent first (`66.66%` → `67%` → `67 / 100`). Delete the duplicated `$numerator` line; the second one is correct.

- [ ] **Step 5: Run harness until ALL PASS, exit 0**

```bash
php tests/harness/arrangement-resolver.php
```

Iterate on the implementation (not the fixtures) until green.

- [ ] **Step 6: Commit**

```bash
git add tests includes/ArrangementResolver.php
git commit -m "feat: ArrangementResolver — pure bucket/pattern/token math, spaced fractions, shared fixtures (harness ALL PASS)"
```

---

### Task 3: JS mirror — `arrangement.js` + node test

**Files:**
- Create: `src/functions/arrangement.js`
- Create: `tests/js/arrangement.test.mjs`

- [ ] **Step 1: Write the failing test**

`tests/js/arrangement.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve as resolveArrangement } from "../../src/functions/arrangement.js";

const fixtures = JSON.parse(
	readFileSync(new URL("../fixtures/arrangements.json", import.meta.url)),
);

for (const c of fixtures.cases) {
	test(c.name, () => {
		assert.deepEqual(resolveArrangement(c.lg, c.md, c.sm, c.count), c.expected);
	});
}
```

- [ ] **Step 2: Run — expect module-not-found failure**

```bash
node --test tests/js/
```

- [ ] **Step 3: Implement `src/functions/arrangement.js`** — a line-for-line port of `ArrangementResolver` (same function decomposition: `withFallbacks`, `size`, `flex`, `toFraction`, `gcd`; export `resolve`). Plain ESM, no WP imports, so node can test it and `edit.js` can import it.

- [ ] **Step 4: Run until all cases pass**

```bash
node --test tests/js/
```

- [ ] **Step 5: Commit**

```bash
git add src/functions/arrangement.js tests/js
git commit -m "feat: arrangement.js — JS mirror of ArrangementResolver on the shared fixtures"
```

---

### Task 4: PHP bootstrap + parent-orchestrated render

**Files:**
- Rewrite: `mai-columns.php` (slim bootstrap)
- Create: `includes/Blocks/Columns.php`, `includes/Blocks/Column.php`
- Delete: the old `Mai_Columns_Block` class body (all 700 lines incl. DOMDocument/Tag-Processor experiments)

- [ ] **Step 1: Rewrite `mai-columns.php`**

```php
<?php
/**
 * Plugin Name:       Mai Columns
 * Description:       Repeatable, per-width column arrangements with simple and complex layouts.
 * Requires at least: 7.0
 * Requires PHP:      8.2
 * Version:           0.2.0
 * Author:            BizBudding
 * Author URI:        https://bizbudding.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       mai-columns
 */

declare( strict_types=1 );

defined( 'ABSPATH' ) || exit;

require_once __DIR__ . '/includes/ArrangementResolver.php';
require_once __DIR__ . '/includes/Blocks/Columns.php';
require_once __DIR__ . '/includes/Blocks/Column.php';

( new Mai\Columns\Blocks\Columns() )->register();
( new Mai\Columns\Blocks\Column() )->register();
```

- [ ] **Step 2: Create `includes/Blocks/Columns.php`**

```php
<?php

declare( strict_types=1 );

namespace Mai\Columns\Blocks;

defined( 'ABSPATH' ) || exit;

use Mai\Columns\ArrangementResolver;
use WP_Block;

/**
 * Parent block. Registers with skip_inner_blocks (the core/post-template
 * pattern): WP does NOT pre-render children; render() resolves the
 * arrangement once and renders each child itself, injecting the child's
 * resolved styles via context and inserting break spans as real siblings.
 * No saved ids, no static state — duplication/nesting/repeat-render safe
 * by construction.
 */
final class Columns {

	public function register(): void {
		add_action( 'init', [ $this, 'register_block' ] );
	}

	public function register_block(): void {
		register_block_type(
			MAI_COLUMNS_DIR . 'build/columns',
			[
				'skip_inner_blocks' => true,
				'render_callback'   => [ $this, 'render' ],
			]
		);
	}

	/**
	 * @param array    $attributes
	 * @param string   $content Always '' — skip_inner_blocks.
	 * @param WP_Block $block
	 */
	public function render( array $attributes, string $content, WP_Block $block ): string {
		$children = $block->parsed_block['innerBlocks'] ?? [];

		if ( ! $children ) {
			return '';
		}

		$resolved = ArrangementResolver::resolve(
			(array) ( $attributes['sizesLg'] ?? [] ),
			(array) ( $attributes['sizesMd'] ?? [] ),
			(array) ( $attributes['sizesSm'] ?? [] ),
			count( $children )
		);

		$inner = '';

		foreach ( array_values( $children ) as $i => $child ) {
			foreach ( $resolved[ $i ]['breaks'] as $bucket ) {
				$inner .= sprintf( '<span class="mai-column__break mai-column__break-%s" aria-hidden="true"></span>', esc_attr( $bucket ) );
			}

			$inner .= ( new WP_Block(
				$child,
				[ 'mai/columnStyles' => $resolved[ $i ]['styles'] ] + $block->context
			) )->render();
		}

		// Container-level custom props from block settings.
		$style = [];

		if ( ! empty( $attributes['justifyContent'] ) ) {
			$style[] = sprintf( '--justify-content:%s;', esc_attr( self::flex_css_value( $attributes['justifyContent'] ) ) );
		}

		if ( ! empty( $attributes['alignItems'] ) ) {
			$style[] = sprintf( '--align-items:%s;', esc_attr( self::flex_css_value( $attributes['alignItems'] ) ) );
		}

		foreach ( self::block_gap( $attributes['style']['spacing']['blockGap'] ?? null ) as $axis => $value ) {
			$style[] = sprintf( '--%s-gap:%s;', $axis, esc_attr( $value ) );
		}

		$wrapper = get_block_wrapper_attributes(
			[
				'class' => 'mai-columns',
				'style' => implode( '', $style ),
			]
		);

		return sprintf( '<div %s>%s</div>', $wrapper, $inner );
	}

	/** Maps editor alignment tokens to flex CSS values. */
	public static function flex_css_value( string $value ): string {
		return match ( $value ) {
			'top', 'left'      => 'flex-start',
			'middle', 'center' => 'center',
			'bottom', 'right'  => 'flex-end',
			'space-between'    => 'space-between',
			default            => 'initial',
		};
	}

	/**
	 * blockGap (single value or row/column array, preset slugs included) to
	 * row/column CSS values.
	 *
	 * @return array{row?:string,column?:string}
	 */
	public static function block_gap( string|array|null $gap ): array {
		if ( null === $gap ) {
			return [];
		}

		$to_css = static function ( string $value ): string {
			$parts = explode( '|', $value );
			$last  = array_pop( $parts );

			return count( $parts ) > 1 ? sprintf( 'var(--wp--preset--spacing--%s)', $last ) : $last;
		};

		if ( is_array( $gap ) ) {
			$out = [];

			if ( isset( $gap['top'] ) ) {
				$out['row'] = $to_css( (string) $gap['top'] );
			}
			if ( isset( $gap['left'] ) ) {
				$out['column'] = $to_css( (string) $gap['left'] );
			}

			return $out;
		}

		$css = $to_css( (string) $gap );

		return [ 'row' => $css, 'column' => $css ];
	}
}
```

Define `MAI_COLUMNS_DIR` in the bootstrap (add below the requires):

```php
define( 'MAI_COLUMNS_DIR', plugin_dir_path( __FILE__ ) );
```

- [ ] **Step 3: Create `includes/Blocks/Column.php`**

```php
<?php

declare( strict_types=1 );

namespace Mai\Columns\Blocks;

defined( 'ABSPATH' ) || exit;

use WP_Block;

/**
 * Child block: a dumb shell. Its per-bucket size/flex custom props arrive
 * fully resolved via the 'mai/columnStyles' context the parent injects at
 * render — this class holds zero layout logic.
 */
final class Column {

	public function register(): void {
		add_action( 'init', [ $this, 'register_block' ] );
	}

	public function register_block(): void {
		register_block_type(
			MAI_COLUMNS_DIR . 'build/column',
			[
				'render_callback' => [ $this, 'render' ],
			]
		);
	}

	/**
	 * @param array    $attributes
	 * @param string   $content
	 * @param WP_Block $block
	 */
	public function render( array $attributes, string $content, WP_Block $block ): string {
		$style = '';

		foreach ( (array) ( $block->context['mai/columnStyles'] ?? [] ) as $prop => $value ) {
			$style .= sprintf( '%s:%s;', $prop, esc_attr( (string) $value ) );
		}

		// Vertical alignment: flex-direction is column, so alignItems maps to justify-content.
		if ( ! empty( $attributes['alignItems'] ) ) {
			$style .= sprintf( '--justify-content:%s;', esc_attr( Columns::flex_css_value( $attributes['alignItems'] ) ) );
		}

		$wrapper = get_block_wrapper_attributes(
			[
				'class' => 'mai-column',
				'style' => $style,
			]
		);

		return sprintf( '<div %s>%s</div>', $wrapper, $content );
	}
}
```

- [ ] **Step 4: Lint + grep gates**

```bash
php -l mai-columns.php && php -l includes/Blocks/Columns.php && php -l includes/Blocks/Column.php
grep -rn 'Mai_Columns_Block\|DOMDocument\|ray(' mai-columns.php includes/   # expect: no hits
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat!: parent-orchestrated render — skip_inner_blocks, context-injected column styles, PHP 8.2 bootstrap"
```

---

### Task 5: block.json updates

**Files:**
- Modify: `src/columns/block.json`, `src/column/block.json`

- [ ] **Step 1: `src/columns/block.json`** — remove the `id` attribute entirely; add wide/full align; keep sizes/alignment attributes and providesContext for the EDITOR (the front end uses the injected `mai/columnStyles`):

Attributes after edit: `alignItems`, `justifyContent`, `sizesLg` (array, default []), `sizesMd`, `sizesSm`. `providesContext`: `{ "mai/sizesLg": "sizesLg", "mai/sizesMd": "sizesMd", "mai/sizesSm": "sizesSm" }` (drop `mai/id`). Add `"supports": { "align": ["wide","full"], ... }` keeping existing color/spacing supports.

- [ ] **Step 2: `src/column/block.json`** — `usesContext`: `["mai/sizesLg", "mai/sizesMd", "mai/sizesSm", "mai/columnStyles"]` (drop `mai/id`). Keep attributes (`alignItems`) and supports.

- [ ] **Step 3: Build + verify metadata loads**

```bash
npm install && npm run build
ls build/columns/block.json build/column/block.json
```

- [ ] **Step 4: Commit**

```bash
git add src/*/block.json build package-lock.json
git commit -m "feat: block.json — drop saved id, add mai/columnStyles context + wide/full align"
```

---

### Task 6: `columns/edit.js` — labels, dead code, duplicate-option fix

**Files:**
- Modify: `src/columns/edit.js`, `src/components/SelectSortable.js`
- Delete: `src/components/MultiSelectSortableDuplicates.js`, `src/columns/select-duplicate.js` (superseded experiments — verify nothing imports them first)

- [ ] **Step 1: Remove the id effect** (the dirty-editor bug):

Delete from `src/columns/edit.js`:

```js
// Set the clientId as an attribute to identify the block
useEffect(() => {
	setAttributes({ id: clientId });
}, [clientId, setAttributes]);
```

and the now-unused `useEffect` import.

- [ ] **Step 2: Relabel buckets for container queries**

Replace `label={__("Desktop")}` / `__("Tablet")` / `__("Mobile")` with `__("Wide")` / `__("Medium")` / `__("Narrow")`, and change the panel help text to: `"Arrangements respond to the space the columns sit in, not the device. Values repeat in the sequence you set. One value sizes all columns; empty inherits the next-wider setting."`

- [ ] **Step 3: Delete the commented `MultiSelectSortableDuplicates` JSX blocks** in edit.js, then remove the dead files:

```bash
grep -rn 'MultiSelectSortableDuplicates\|select-duplicate' src/   # confirm only dead refs remain
git rm src/components/MultiSelectSortableDuplicates.js src/columns/select-duplicate.js
```

- [ ] **Step 4: Fix the duplicate-option bug in `src/components/SelectSortable.js`**

Read the component; the bug (per commit `71f5c65` "adds duplicate item to options list"): on create, the new token is pushed into the OPTIONS array as well as the value. Fix: creatable values join the selected VALUE list only; the options prop stays the static predefined list. Concretely, in the `onCreateOption`/`onChange` handlers, never `setOptions`/append to options — selected values render via `value` (duplicates allowed because values are wrapped with unique keys `{ value, id: uuid }` for dnd-kit), options list remains the constant.

- [ ] **Step 5: Build + manual editor check**

```bash
npm run build
```

In the BJ local editor (Task 9 symlinks the plugin — for now `wp plugin activate` after symlinking, or use any local block-theme site): insert Mai Columns, add tokens incl. a custom `2/5` twice, reorder by drag, confirm the dropdown options list never grows, and a freshly opened post is NOT dirty.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "fix(editor): drop saved-id effect (dirty-state bug), container-query labels, duplicate-option fix, dead controls removed"
```

---

### Task 7: `column/edit.js` preview via shared arrangement.js

**Files:**
- Modify: `src/column/edit.js`, `src/functions/index.js`

- [ ] **Step 1: Replace the per-column math** (`getIndexValueFromArray`/`getSize`/`getFlex` usage) with the shared resolver: import `resolve` from `../functions/arrangement.js`; compute `blockIndex` (existing `getBlockIndex` useSelect) and sibling count via `getBlockCount(getBlockRootClientId(clientId))`; read `mai/sizesLg|Md|Sm` from `context`; call `resolve(sizesLg, sizesMd, sizesSm, count)[blockIndex]` and spread `.styles` into the block wrapper's `style` (the editor needs the same custom props the front end gets).

- [ ] **Step 2: Remove now-unused exports** from `src/functions/index.js` (`getIndexValueFromArray`, `getSize`, `getFlex`) after confirming no other imports:

```bash
grep -rn 'getIndexValueFromArray\|getSize\|getFlex' src/ | grep -v functions/index.js | grep -v arrangement
```

- [ ] **Step 3: Build + editor check** — two columns with `1/3, 2/3`: editor canvas shows a third/two-thirds split that matches the front end at the same container width.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(editor): column preview runs the shared arrangement resolver — PHP/JS cannot drift"
```

---

### Task 8: Container-query stylesheet

**Files:**
- Rewrite: `src/columns/style.scss`

- [ ] **Step 1: Rewrite** keeping the custom-prop contract and the gap math; container queries replace media queries; the viewport variant stays alongside, commented, for the documented one-file revert:

```scss
/* Bucket boundaries. Container width, not viewport. */
$bucket-md: 600px;
$bucket-lg: 1024px;

.mai-columns {
	container-type: inline-size;
	--column-gap: 0.5em;
	--row-gap: 0.5em;
	display: flex;
	flex-wrap: wrap;
	align-items: var(--align-items, initial);
	justify-content: var(--justify-content, initial);
	gap: var(--row-gap) var(--column-gap);
}

.mai-column {
	--flex-basis: calc((100% * var(--size) - (var(--column-gap) * (1 - var(--size)))) - 0.025px);
	flex: var(--flex);
	display: flex;
	flex-direction: column;
	justify-content: var(--justify-content, initial);
	margin: 0;
}

.mai-column__break {
	display: none;
	flex-basis: 100%;
}

/* ── Container-query buckets ─────────────────────────────────────────────
   REVERT PATH: to go back to viewport behavior, delete container-type above
   and replace each @container below with the equivalent @media:
   sm: @media (max-width: 599px) · md: @media (min-width: 600px) and
   (max-width: 1023px) · lg: @media (min-width: 1024px). Nothing else
   changes — markup and custom props are mechanism-agnostic. */

@container (max-width: #{$bucket-md - 1px}) {
	.mai-column {
		--size: var(--size-sm, 1);
		--flex: var(--flex-sm, 1);
	}

	.mai-column__break-sm {
		display: block;
	}
}

@container (min-width: #{$bucket-md}) and (max-width: #{$bucket-lg - 1px}) {
	.mai-column {
		--size: var(--size-md, 1);
		--flex: var(--flex-md, 1);
	}

	.mai-column__break-md {
		display: block;
	}
}

@container (min-width: #{$bucket-lg}) {
	.mai-column {
		--size: var(--size-lg, 1);
		--flex: var(--flex-lg, 1);
	}

	.mai-column__break-lg {
		display: block;
	}
}
```

- [ ] **Step 2: The `gap !important` re-check** — render a columns block on WP 7.0 and inspect whether `.is-layout-flex` rules still override the gap; the rewrite above drops `!important` optimistically. If core stomps it, restore `!important` with a dated WHY comment.

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add src/columns/style.scss build
git commit -m "feat(css): container-query buckets with documented viewport revert; gap !important re-evaluated"
```

---

### Task 9: Front-end verification matrix (Playwright, on the BJ install)

**Files:**
- None committed in mai-columns (throwaway fixture post + `/tmp` scripts); BJ install gets a dev symlink.

- [ ] **Step 1: Symlink + activate on the local BJ install** (dev-only; a DB resync will deactivate it — that's fine):

```bash
ln -s ~/Plugins/mai-columns /Users/jivedig/Herd/balloon-juice/wp-content/plugins/mai-columns
cd /Users/jivedig/Herd/balloon-juice && wp plugin activate mai-columns
```

- [ ] **Step 2: Create the fixture page** with `wp post create` containing, as block markup: (a) a 4-child `1/3, 2/3` columns block; (b) a 3-child `fit, fill, 300px` block; (c) the `break` case from the fixtures; (d) the SAME block markup pasted twice in a row (repeat-render regression); (e) a columns block nested inside a `mai/column` of another columns block (nesting regression). Then load it anonymously and confirm 200.

- [ ] **Step 3: Playwright assertions** (`NODE_PATH=/Users/jivedig/node_modules node /tmp/mai-columns-e2e.js`): for each case at container widths ~360 / ~800 / ~1200 (resize viewport; the page content column is the container), read each `.mai-column`'s computed `flex-basis`/`flex-grow` and assert against expected resolver output; assert break spans display block/none per bucket; assert the duplicated and nested blocks each get их own correct sequence (the Task-2 fixtures define expectations). Zero console errors.

- [ ] **Step 4: Editor dirty-state regression** — open the fixture page in the editor (cmux or Playwright with auth), confirm: no "unsaved changes" indicator on fresh open; the `id` attribute does not appear in saved markup.

- [ ] **Step 5: Cleanup + commit (verification notes only)**

```bash
cd /Users/jivedig/Herd/balloon-juice && wp post delete <fixture-id> --force
cd ~/Plugins/mai-columns && git commit --allow-empty -m "test: front-end matrix verified — arrangements/breaks/fit-fill-length, duplicate + nested + repeat-render regressions, editor dirty-state clean"
```

(The symlink stays — BJ is the ongoing dev/test site and the future pilot.)

---

### Task 10: readme + docs wrap

**Files:**
- Rewrite: `readme.txt`
- Modify: `docs/specs/2026-06-10-mai-columns-rebuild-design.md` (status)

- [ ] **Step 1: `readme.txt`** — describe: what it does (repeatable arrangements), the token vocabulary (`25%…100%` presets, custom fractions `2/5`, lengths `300px`, `fit`, `fill`, `break`), the container-query bucket model (Wide/Medium/Narrow = available room), requirements (WP 7.0 / PHP 8.2), and a changelog entry for 0.2.0 summarizing the rebuild. No installation/PUC/release sections yet (not tagged).

- [ ] **Step 2: Mark the spec** `Status: Implemented (0.2.0 rebuild)` with the task commit hashes.

- [ ] **Step 3: Final gates + commit**

```bash
php tests/harness/arrangement-resolver.php   # ALL PASS
node --test tests/js/                        # all pass
grep -rn 'mai/id\|sizesLg.*id\|"id"' src/*/block.json   # no id attribute anywhere
git add -A && git commit -m "docs: readme rewrite; spec marked implemented"
```

Merging `rebuild` → `develop` and any push/tag: Mike's call, not in this plan.

---

## Self-review notes

- Spec coverage: standalone/no-composer ✓(T1,T4), resolver + spaced fractions ✓(T2), JS mirror + shared fixtures ✓(T3), skip_inner_blocks render + break siblings + dumb shell ✓(T4), id removal ✓(T5,T6), labels/help ✓(T6), duplicate-option fix ✓(T6), editor preview parity ✓(T7), container queries + revert doc + gap recheck ✓(T8), regression matrix ✓(T9), readme ✓(T10).
- The `toFraction` percent-rounding wrinkle is pinned by fixtures, with an explicit implementer note to delete the stray first `$numerator` line.
- Version bumped 0.1.0 → 0.2.0 (still pre-tag; release/PUC out of scope).
- Editor-only deps untouched at runtime: react-select/dnd-kit live in the editor bundle; front end ships only the stylesheet + markup.
