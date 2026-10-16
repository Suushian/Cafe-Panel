import test from "node:test";
import assert from "node:assert/strict";
import { isOrderStatus, ORDER_STATUSES } from "../src/lib/order-status.ts";

test("accepts each supported order status", () => {
  for (const status of ORDER_STATUSES) {
    assert.equal(isOrderStatus(status), true, status);
  }
});

test("rejects unknown and malformed order statuses", () => {
  for (const status of ["", "OPEN", "pending", "refunded", "undefined", "null"]) {
    assert.equal(isOrderStatus(status), false, status);
  }
});
