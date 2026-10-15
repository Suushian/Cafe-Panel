import test from "node:test";
import assert from "node:assert/strict";
import { redact } from "../src/lib/logging/redaction.ts";

test("redact masks secret-bearing fields recursively", () => {
  const result = redact({
    username: "operator",
    password: "plain-secret",
    nested: { accessToken: "token-value", label: "safe" },
  });
  assert.deepEqual(result, {
    username: "operator",
    password: "[REDACTED]",
    nested: { accessToken: "[REDACTED]", label: "safe" },
  });
});

test("redact removes bearer credentials embedded in strings", () => {
  const result = redact({ message: "Authorization: Bearer abc.def.ghi" });
  assert.equal(result.message, "Authorization: Bearer [REDACTED]");
});

test("redact bounds arrays, strings, and recursive depth", () => {
  const long = "x".repeat(5000);
  const result = redact({ long, values: Array.from({ length: 120 }, (_, i) => i) });
  assert.equal(result.long.length, 4000);
  assert.equal(result.values.length, 100);
});
