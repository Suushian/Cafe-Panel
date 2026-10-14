import test from "node:test";
import assert from "node:assert/strict";
import { computeDiscountAmount, isDiscountType } from "../src/lib/discount.ts";

test("computes percent discounts and rounds to whole tomans", () => {
  assert.equal(computeDiscountAmount(1001, "percent", 10), 100);
  assert.equal(computeDiscountAmount(999, "percent", 12.5), 125);
});

test("caps discounts at subtotal and rejects non-positive values", () => {
  assert.equal(computeDiscountAmount(500, "percent", 150), 500);
  assert.equal(computeDiscountAmount(500, "amount", 900), 500);
  assert.equal(computeDiscountAmount(500, "amount", -1), 0);
  assert.equal(computeDiscountAmount(500, "amount", Number.NaN), 0);
});

test("handles no-discount and validates discount types", () => {
  assert.equal(computeDiscountAmount(500, "none", 20), 0);
  assert.equal(isDiscountType("percent"), true);
  assert.equal(isDiscountType("invalid"), false);
});
