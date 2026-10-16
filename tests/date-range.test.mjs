import test from "node:test";
import assert from "node:assert/strict";
import { isValidDateParam, dayRange, shiftDate } from "../src/lib/date-range.ts";

test("accepts valid calendar dates, including leap days", () => {
  assert.equal(isValidDateParam("2024-02-29"), true);
  assert.equal(isValidDateParam("2026-10-16"), true);
});

test("rejects malformed and impossible calendar dates", () => {
  for (const value of [
    null,
    undefined,
    "",
    "2026-1-01",
    "2026-13-01",
    "2026-00-10",
    "2026-04-31",
    "2026-02-29",
    "2026-02-31",
    "0000-01-01",
  ]) {
    assert.equal(isValidDateParam(value), false, String(value));
  }
});

test("day ranges and date shifting preserve local calendar days", () => {
  const { start, end } = dayRange("2026-10-16");
  assert.equal(start.getFullYear(), 2026);
  assert.equal(start.getMonth(), 9);
  assert.equal(start.getDate(), 16);
  assert.equal(start.getHours(), 0);
  assert.equal(end.getHours(), 23);
  assert.equal(end.getDate(), 16);
  assert.equal(shiftDate("2024-02-28", 1), "2024-02-29");
  assert.equal(shiftDate("2024-02-29", 1), "2024-03-01");
});
