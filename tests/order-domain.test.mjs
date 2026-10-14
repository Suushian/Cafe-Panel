import test from "node:test";
import assert from "node:assert/strict";
import { isOrderStatus } from "../src/lib/order-status.ts";
import { isOrderType } from "../src/lib/order-type.ts";

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
