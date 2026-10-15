import test from "node:test";
import assert from "node:assert/strict";
import { getPasswordLengthError } from "../src/lib/password-policy.ts";

test("password policy accepts 6 through 100 characters", () => {
  assert.equal(getPasswordLengthError("12345"), "too-short");
  assert.equal(getPasswordLengthError("123456"), null);
  assert.equal(getPasswordLengthError("a".repeat(100)), null);
  assert.equal(getPasswordLengthError("a".repeat(101)), "too-long");
});
