import test from "node:test";
import assert from "node:assert/strict";
import { isOrderStatus } from "../src/lib/order-status.ts";
import { isOrderType } from "../src/lib/order-type.ts";
import { computeDiscountAmount, computeOrderNetTotal } from "../src/lib/discount.ts";

test("accepts only supported order statuses", () => {
  assert.equal(isOrderStatus("open"), true);
  assert.equal(isOrderStatus("paid"), true);
  assert.equal(isOrderStatus("cancelled"), true);
  assert.equal(isOrderStatus("refunded"), false);
});

test("accepts only supported order types", () => {
  assert.equal(isOrderType("dine_in"), true);
  assert.equal(isOrderType("takeaway"), true);
  assert.equal(isOrderType("delivery"), true);
  assert.equal(isOrderType("pickup"), false);
});


test("discount amounts stay within valid order totals", () => {
  assert.equal(computeDiscountAmount(1000, "none", 500), 0);
  assert.equal(computeDiscountAmount(1000, "percent", 15), 150);
  assert.equal(computeDiscountAmount(1000, "percent", 150), 1000);
  assert.equal(computeDiscountAmount(1000, "amount", 1500), 1000);
  assert.equal(computeDiscountAmount(-1000, "amount", 100), 0);
  assert.equal(computeDiscountAmount(Number.NaN, "percent", 10), 0);
});

test("net order total clamps invalid or excessive discounts", () => {
  assert.equal(computeOrderNetTotal(1000, 250), 750);
  assert.equal(computeOrderNetTotal(1000, 1500), 0);
  assert.equal(computeOrderNetTotal(1000, -20), 1000);
  assert.equal(computeOrderNetTotal(1000, Number.NaN), 1000);
  assert.equal(computeOrderNetTotal(-1000, 10), 0);
});
