import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

function read(relativePath) {
  return fs.readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

function assertGuarded(source, functionName) {
  const marker = `export async function ${functionName}`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `Expected exported function ${functionName}`);
  const next = source.indexOf("\nexport async function ", start + marker.length);
  const body = source.slice(start, next === -1 ? source.length : next);
  assert.match(
    body,
    /if\s*\(!\(await verifySession\(\)\)\)/,
    `${functionName} must verify the administrator session before performing work`
  );
}

test("customer, menu, order, and maintenance server actions require an admin session", () => {
  const cases = [
    ["../src/app/(panel)/customers/actions.ts", ["createCustomer", "updateCustomer", "deleteCustomer"]],
    ["../src/app/(panel)/menu/actions.ts", ["createMenuItem", "updateMenuItem", "deleteMenuItem"]],
    ["../src/app/(panel)/orders/actions.ts", ["createOrder", "updateOrder", "updateOrderStatus"]],
    ["../src/app/(panel)/maintenance/actions.ts", ["resetDatabase"]],
  ];

  for (const [path, functionNames] of cases) {
    const source = read(path);
    assert.match(source, /import \{ verifySession \} from "@\/lib\/auth";/);
    for (const functionName of functionNames) assertGuarded(source, functionName);
  }
});

test("CSV report export rejects requests without a valid administrator session", () => {
  const source = read("../src/app/(panel)/reports/export/route.ts");
  assert.match(source, /import \{ verifySession \} from "@\/lib\/auth";/);
  assert.match(source, /export async function GET\(request: Request\)\s*\{\s*if \(!\(await verifySession\(\)\)\)/);
  assert.match(source, /status:\s*401/);
});
