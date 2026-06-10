// Mai Columns front-end matrix. Run:
// NODE_PATH=/Users/jivedig/node_modules node /tmp/mai-columns-e2e.mjs
import { createRequire } from "node:module";
import { resolve as resolveArrangement } from "/Users/jivedig/Plugins/mai-columns/src/functions/arrangement.mjs";

const require = createRequire("/Users/jivedig/node_modules/");
const { chromium } = require("playwright");

const URL = "https://balloon-juice.test/mai-columns-matrix/";
const WIDTHS = [360, 800, 1200];

// Mirrors the fixture page's block attributes.
const CASES = {
	"case-a": { lg: ["1/3", "2/3"], md: [], sm: ["1/1"], count: 4 },
	"case-b": { lg: ["fit", "fill", "300px"], md: [], sm: [], count: 3 },
	"case-c": { lg: ["1/2", "1/2", "break", "fill"], md: ["1/1"], sm: [], count: 3 },
	"case-d": { lg: ["1/4", "3/4"], md: [], sm: ["1/1"], count: 2 },
	"case-e": { lg: ["1/2", "1/2"], md: [], sm: ["1/1"], count: 2 },
	"case-e-inner": { lg: ["1/3", "2/3"], md: [], sm: ["1/1"], count: 2 },
};

let pass = 0;
let fail = 0;

const assert = (cond, label) => {
	if (cond) {
		pass++;
	} else {
		fail++;
		console.log(`  FAIL: ${label}`);
	}
};

const bucketFor = (containerWidth) =>
	containerWidth < 640 ? "sm" : containerWidth < 1024 ? "md" : "lg";

// "0 1 var(--flex-basis)" -> { grow: "0", shrink: "1", basis: "var(--flex-basis)" }
const parseFlex = (flex) => {
	const [grow, shrink, ...basis] = flex.split(" ");
	return { grow, shrink, basis: basis.join(" ") };
};

const readContainer = (el) => {
	const cs = getComputedStyle(el);
	const cols = [...el.children]
		.filter((c) => c.classList.contains("mai-column"))
		.map((c) => {
			const ccs = getComputedStyle(c);
			const r = c.getBoundingClientRect();
			return { grow: ccs.flexGrow, shrink: ccs.flexShrink, basis: ccs.flexBasis, w: r.width, y: r.top };
		});
	const breaks = [...el.children]
		.filter((c) => c.classList.contains("mai-column__break"))
		.map((c) => ({ cls: c.className, display: getComputedStyle(c).display }));
	return {
		width: el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight),
		columnGap: cs.columnGap,
		isLayoutFlex: el.classList.contains("is-layout-flex"),
		cols,
		breaks,
	};
};

const assertInstance = (info, def, tag) => {
	const bucket = bucketFor(info.width);
	const expected = resolveArrangement(def.lg, def.md, def.sm, def.count);
	tag = `${tag} (container ${Math.round(info.width)}px → ${bucket})`;

	assert(info.cols.length === def.count, `${tag}: ${def.count} columns rendered (got ${info.cols.length})`);

	// gap !important recheck: must be a real length, not stomped to normal/0.
	assert(
		info.columnGap !== "normal" && parseFloat(info.columnGap) > 0,
		`${tag}: column-gap survives without !important (got ${info.columnGap}, is-layout-flex=${info.isLayoutFlex})`,
	);

	info.cols.forEach((col, i) => {
		const exp = parseFlex(expected[i].styles[`--flex-${bucket}`]);
		assert(col.grow === exp.grow, `${tag} col${i + 1}: flex-grow ${exp.grow} (got ${col.grow})`);
		assert(col.shrink === exp.shrink, `${tag} col${i + 1}: flex-shrink ${exp.shrink} (got ${col.shrink})`);

		if (exp.basis === "var(--flex-basis)") {
			const size = expected[i].styles[`--size-${bucket}`];
			const [n, , d] = size.split(" ");
			const frac = Number(n) / Number(d);
			const gap = parseFloat(info.columnGap);
			const expectedW = info.width * frac - gap * (1 - frac);
			assert(
				Math.abs(col.w - expectedW) < 2,
				`${tag} col${i + 1}: width ≈ ${expectedW.toFixed(1)} for ${size} (got ${col.w.toFixed(1)})`,
			);
		} else if (exp.basis === "auto") {
			assert(col.basis === "auto", `${tag} col${i + 1}: basis auto (got ${col.basis})`);
		} else if (exp.basis === "0") {
			assert(parseFloat(col.basis) === 0, `${tag} col${i + 1}: basis 0 (got ${col.basis})`);
		} else {
			assert(col.basis === exp.basis, `${tag} col${i + 1}: basis ${exp.basis} (got ${col.basis})`);
		}
	});

	// Break spans: present per resolver, display block only in their bucket.
	const expectedBreakBuckets = expected.flatMap((e) => e.breaks);
	assert(
		info.breaks.length === expectedBreakBuckets.length,
		`${tag}: ${expectedBreakBuckets.length} break spans (got ${info.breaks.length})`,
	);
	info.breaks.forEach((b) => {
		const bBucket = b.cls.match(/mai-column__break-(\w+)/)?.[1];
		const expDisplay = bBucket === bucket ? "block" : "none";
		assert(b.display === expDisplay, `${tag}: break-${bBucket} display ${expDisplay} (got ${b.display})`);
	});

	// Geometry: 1/1 columns stack on distinct rows.
	const sizes = expected.map((e) => e.styles[`--size-${bucket}`]);
	if (sizes.every((s) => s === "1 / 1")) {
		const distinct = new Set(info.cols.map((c) => Math.round(c.y))).size;
		assert(distinct === def.count, `${tag}: stacked — ${def.count} distinct rows (got ${distinct})`);
	}

	// Geometry: an lg break forces the flagged child onto a new row.
	if ("lg" === bucket && expectedBreakBuckets.includes("lg")) {
		const last = info.cols[def.count - 1];
		const prev = info.cols[def.count - 2];
		assert(last.y > prev.y, `${tag}: break — last column on a new row`);
	}
};

const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext({ ignoreHTTPSErrors: true });
const page = await context.newPage();

const consoleErrors = [];
page.on("console", (msg) => {
	if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push(String(err)));

for (const viewport of WIDTHS) {
	await page.setViewportSize({ width: viewport, height: 1200 });
	await page.goto(URL, { waitUntil: "networkidle" });
	console.log(`\n=== viewport ${viewport}px ===`);

	for (const [caseClass, def] of Object.entries(CASES)) {
		const containers = page.locator(`.mai-columns.${caseClass}`);
		const instanceCount = await containers.count();
		assert(
			instanceCount === (caseClass === "case-d" ? 2 : 1),
			`${caseClass}: expected instance count (got ${instanceCount})`,
		);

		for (let inst = 0; inst < instanceCount; inst++) {
			const info = await containers.nth(inst).evaluate(readContainer);
			assertInstance(info, def, `${caseClass}[${inst}] @${viewport}`);
		}
	}

	// Case D repeat-render: both instances byte-identical geometry.
	const dWidths = await page
		.locator(".mai-columns.case-d .mai-column")
		.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().width));
	assert(
		Math.abs(dWidths[0] - dWidths[2]) < 1 && Math.abs(dWidths[1] - dWidths[3]) < 1,
		`case-d @${viewport}: duplicated instance geometry matches (${dWidths.map((w) => w.toFixed(1)).join(", ")})`,
	);

	const eWidths = await page.evaluate(() => ({
		outer: document.querySelector(".mai-columns.case-e").clientWidth,
		inner: document.querySelector(".mai-columns.case-e-inner").clientWidth,
	}));
	console.log(`  case-e widths: outer ${eWidths.outer}px / inner ${eWidths.inner}px (buckets ${bucketFor(eWidths.outer)}/${bucketFor(eWidths.inner)})`);
}

// ── Forced-lg pass ───────────────────────────────────────────────────────
// The BJ theme caps every container at ~740px (md). Container queries answer
// to the element's own inline-size, so forcing a width legitimately
// exercises the lg bucket CSS against the same markup.
console.log(`\n=== forced lg (inline width 1100px) ===`);
for (const [caseClass, def] of Object.entries(CASES)) {
	if ("case-e-inner" === caseClass) continue; // stays nested/narrow by design

	const containers = page.locator(`.mai-columns.${caseClass}`);
	const instanceCount = await containers.count();

	for (let inst = 0; inst < instanceCount; inst++) {
		const info = await containers.nth(inst).evaluate((el) => {
			el.style.width = "1100px";
			el.style.maxWidth = "none";
			void el.offsetWidth; // force reflow so @container rules apply
			const cs = getComputedStyle(el);
			const cols = [...el.children]
				.filter((c) => c.classList.contains("mai-column"))
				.map((c) => {
					const ccs = getComputedStyle(c);
					const r = c.getBoundingClientRect();
					return { grow: ccs.flexGrow, shrink: ccs.flexShrink, basis: ccs.flexBasis, w: r.width, y: r.top };
				});
			const breaks = [...el.children]
				.filter((c) => c.classList.contains("mai-column__break"))
				.map((c) => ({ cls: c.className, display: getComputedStyle(c).display }));
			return {
				width: el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight),
				columnGap: cs.columnGap,
				isLayoutFlex: el.classList.contains("is-layout-flex"),
				cols,
				breaks,
			};
		});
		assertInstance(info, def, `${caseClass}[${inst}] @forced-lg`);
	}
}

assert(consoleErrors.length === 0, `zero console errors (got: ${consoleErrors.join(" | ")})`);

await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
