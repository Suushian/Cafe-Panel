import test from "node:test";
import assert from "node:assert/strict";
import { csvEscape } from "../src/lib/csv.ts";

test("quotes CSV delimiters, quotes, and both newline forms", () => {
  assert.equal(csvEscape("a,b"), '"a,b"');
  assert.equal(csvEscape('say "hello"'), '"say ""hello"""');
  assert.equal(csvEscape("first\rsecond"), '"first\rsecond"');
  assert.equal(csvEscape("first\nsecond"), '"first\nsecond"');
});

test("neutralizes spreadsheet formulas in untrusted text", () => {
  for (const value of ["=1+1", "+SUM(A1:A2)", "-1+2", "@SUM(A1)", "\t=1+1"]) {
    assert.equal(csvEscape(value).startsWith("'"), true, value);
  }
});

test("keeps numeric values as numeric CSV cells", () => {
  assert.equal(csvEscape(123), "123");
  assert.equal(csvEscape(0), "0");
});
