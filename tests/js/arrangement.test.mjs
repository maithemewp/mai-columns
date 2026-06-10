import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve as resolveArrangement } from "../../src/functions/arrangement.mjs";

const fixtures = JSON.parse(
	readFileSync(new URL("../fixtures/arrangements.json", import.meta.url)),
);

for (const c of fixtures.cases) {
	test(c.name, () => {
		assert.deepEqual(resolveArrangement(c.lg, c.md, c.sm, c.count), c.expected);
	});
}
