import test from "node:test";
import assert from "node:assert/strict";
import { computeDiscountAmount, isDiscountType, isValidDiscountValue } from "../src/lib/discount.ts";

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

test("validates discount values and rejects percentages above 100", () => {
  assert.equal(isValidDiscountValue("percent", 0), true);
  assert.equal(isValidDiscountValue("percent", 100), true);
  assert.equal(isValidDiscountValue("percent", 101), false);
  assert.equal(isValidDiscountValue("percent", -1), false);
  assert.equal(isValidDiscountValue("percent", 10.5), false);
  assert.equal(isValidDiscountValue("amount", 1_000_000_000), true);
  assert.equal(isValidDiscountValue("amount", 1_000_000_001), false);
  assert.equal(isValidDiscountValue("amount", Number.NaN), false);
});

import { getPayableAmount, isValidOrderTotal, MAX_ORDER_TOTAL } from "../src/lib/order-total.ts";

test("payable amount subtracts discount and never becomes negative", () => {
  assert.equal(getPayableAmount(1200, 200), 1000);
  assert.equal(getPayableAmount(1200, 0), 1200);
  assert.equal(getPayableAmount(500, 900), 0);
  assert.equal(getPayableAmount(0, 0), 0);
});

test("order totals respect SQLite signed 32-bit integer bounds", () => {
  assert.equal(isValidOrderTotal(1), true);
  assert.equal(isValidOrderTotal(MAX_ORDER_TOTAL), true);
  assert.equal(isValidOrderTotal(0), false);
  assert.equal(isValidOrderTotal(MAX_ORDER_TOTAL + 1), false);
  assert.equal(isValidOrderTotal(1.5), false);
});
