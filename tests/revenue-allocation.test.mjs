import test from "node:test";
import assert from "node:assert/strict";
import { allocateNetLineAmounts } from "../src/lib/revenue-allocation.ts";

test("allocates net revenue proportionally and preserves the order total", () => {
  const allocated = allocateNetLineAmounts(
    [{ gross: 100 }, { gross: 200 }],
    240
  );
  assert.deepEqual(allocated, [80, 160]);
  assert.equal(allocated.reduce((sum, amount) => sum + amount, 0), 240);
});

test("uses deterministic largest-remainder rounding", () => {
  const allocated = allocateNetLineAmounts(
    [{ gross: 1 }, { gross: 1 }, { gross: 1 }],
    2
  );
  assert.deepEqual(allocated, [1, 1, 0]);
  assert.equal(allocated.reduce((sum, amount) => sum + amount, 0), 2);
});

test("handles zero payable totals and empty orders", () => {
  assert.deepEqual(allocateNetLineAmounts([{ gross: 100 }, { gross: 200 }], 0), [0, 0]);
  assert.deepEqual(allocateNetLineAmounts([], 0), []);
});

test("rejects invalid gross line amounts", () => {
  assert.throws(
    () => allocateNetLineAmounts([{ gross: -1 }], 10),
    RangeError
  );
});
