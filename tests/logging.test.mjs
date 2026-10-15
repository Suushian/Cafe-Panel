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

test("redact removes common secret query parameters from URLs", () => {
  const result = redact({ url: "https://localhost/path?access_token=abc123&safe=yes&api_key=xyz" });
  assert.equal(result.url, "https://localhost/path?access_token=[REDACTED]&safe=yes&api_key=[REDACTED]");
});

test("redact safely handles circular objects and repeated references", () => {
  const child = { label: "safe" };
  const input = { first: child, second: child };
  input.self = input;
  const result = redact(input);
  assert.deepEqual(result, {
    first: { label: "safe" },
    second: "[Circular]",
    self: "[Circular]",
  });
});
