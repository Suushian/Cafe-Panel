import test from "node:test";
import assert from "node:assert/strict";
import { MAX_ORDER_TOTAL, isValidOrderTotal } from "../src/lib/order-total.ts";

test("accepts positive integer order totals within the Prisma Int range", () => {
  assert.equal(isValidOrderTotal(1), true);
  assert.equal(isValidOrderTotal(MAX_ORDER_TOTAL), true);
});

test("rejects totals that cannot be safely stored", () => {
  for (const value of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, MAX_ORDER_TOTAL + 1]) {
    assert.equal(isValidOrderTotal(value), false, String(value));
  }
});
