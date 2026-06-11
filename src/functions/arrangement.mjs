/**
 * Pure arrangement math — the line-for-line JS mirror of
 * includes/ArrangementResolver.php, locked to the same shared fixtures
 * (tests/fixtures/arrangements.json) so the editor preview and the PHP
 * front-end render cannot drift. Plain ESM, no WP imports: node --test
 * consumes it raw and edit.js bundles it via webpack.
 *
 * Fractions serialize SPACED ("1 / 2", never "1/2"): a recipe plugin's
 * fraction-beautifier once regex-replaced bare 1/2 inside style="" with a ½
 * glyph on a Mai Engine site. Spaced form is equally valid in calc().
 */

const BUCKETS = ["lg", "md", "sm"];

/**
 * Resolves per-child styles and break markers for all buckets.
 *
 * Reversed buckets emit per-child --order-{bucket} props (count down to 1)
 * — CSS `order` applies before flex line wrapping, so it reverses rows and
 * stacked layouts alike.
 *
 * @param {string[]}                lg
 * @param {string[]}                md
 * @param {string[]}                sm
 * @param {number}                  count
 * @param {Object<string,boolean>}  reverse Per-bucket reverse flags, e.g. { sm: true }.
 *
 * @return {Array<{styles: Object<string,string>, breaks: string[]}>}
 */
export const resolve = (lg, md, sm, count, reverse = {}) => {
	const buckets = withFallbacks({ lg, md, sm });
	const result  = Array.from({ length: count }, () => ({ styles: {}, breaks: [] }));

	for (const bucket of BUCKETS) {
		let pattern  = buckets[bucket];
		const tokens = pattern.filter((t) => "break" !== t);

		// A pattern of only breaks degrades to full-width, no breaks.
		if (!tokens.length) {
			pattern = ["1/1"];
		}

		let p   = 0;
		const n = pattern.length;

		for (let i = 0; i < count; i++) {
			// Consume break markers: they flag the NEXT child.
			while ("break" === pattern[p % n]) {
				if (!result[i].breaks.includes(bucket)) {
					result[i].breaks.push(bucket);
				}
				p++;
			}

			const token = String(pattern[p % n]);
			p++;

			result[i].styles[`--size-${bucket}`] = size(token);
			result[i].styles[`--flex-${bucket}`] = flex(token);

			if (reverse[bucket]) {
				result[i].styles[`--order-${bucket}`] = String(count - i);
			}
		}
	}

	// Group each child's props lg, md, sm (the order the fixtures pin).
	for (const entry of result) {
		const ordered = {};

		for (const bucket of BUCKETS) {
			ordered[`--size-${bucket}`] = entry.styles[`--size-${bucket}`];
			ordered[`--flex-${bucket}`] = entry.styles[`--flex-${bucket}`];

			if (undefined !== entry.styles[`--order-${bucket}`]) {
				ordered[`--order-${bucket}`] = entry.styles[`--order-${bucket}`];
			}
		}

		entry.styles = ordered;
	}

	return result;
};

/**
 * Nearest-defined fallback, preferring the larger bucket; all-empty
 * degrades to full width.
 *
 * @param {Object<string,string[]>} buckets
 *
 * @return {Object<string,string[]>}
 */
const withFallbacks = (buckets) => {
	const defined = (arr) => (arr && arr.length ? arr : null);

	const lg = defined(buckets.lg) ?? defined(buckets.md) ?? defined(buckets.sm);
	const md = defined(buckets.md) ?? defined(buckets.lg) ?? defined(buckets.sm);
	const sm = defined(buckets.sm) ?? defined(buckets.md) ?? defined(buckets.lg);

	return {
		lg: lg ?? ["1/1"],
		md: md ?? ["1/1"],
		sm: sm ?? ["1/1"],
	};
};

/**
 * Spaced fraction for fractional tokens; "1" (full flex share) otherwise.
 *
 * @param {string} token
 *
 * @return {string}
 */
const size = (token) => toFraction(token) || "1";

/**
 * Flex shorthand per token type.
 *
 * @param {string} token
 *
 * @return {string}
 */
const flex = (token) => {
	if ("fit" === token) {
		return "0 1 auto";
	}

	if ("fill" === token) {
		return "1 0 0";
	}

	if (toFraction(token)) {
		return "0 1 var(--flex-basis)";
	}

	// Arbitrary CSS length (300px, 20rem, …) — fixed: siblings never
	// squeeze it (it wraps instead); the 100% cap shrinks it only when
	// the container itself is narrower than the fixed size.
	return `0 0 min(${token}, 100%)`;
};

/**
 * Normalizes "1/2", "1 / 2", and "50%" to the SPACED fraction "1 / 2".
 * Empty means full width. Returns '' for non-fractional tokens
 * (fit/fill/lengths).
 *
 * @param {string} token
 *
 * @return {string}
 */
const toFraction = (token) => {
	token = token.trim();

	if ("" === token) {
		return "1 / 1";
	}

	const fraction = token.match(/^(\d+)\s*\/\s*(\d+)$/);

	if (fraction) {
		return `${parseInt(fraction[1], 10)} / ${parseInt(fraction[2], 10)}`;
	}

	// Percentages round to the nearest integer percent, then reduce.
	if (/^\d+(\.\d+)?%$/.test(token)) {
		const numerator   = Math.round(parseFloat(token));
		const denominator = 100;
		const divisor     = gcd(numerator, denominator);

		return `${numerator / divisor} / ${denominator / divisor}`;
	}

	return "";
};

/**
 * Greatest common divisor.
 *
 * @param {number} a
 * @param {number} b
 *
 * @return {number}
 */
const gcd = (a, b) => (0 === b ? a : gcd(b, a % b));
