import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const editPage = fs.readFileSync(
  new URL("../src/app/(panel)/orders/[id]/edit/page.tsx", import.meta.url),
  "utf8"
);
const orderClient = fs.readFileSync(
  new URL("../src/app/(panel)/orders/new/components/NewOrderClient.tsx", import.meta.url),
  "utf8"
);

test("editing an order preserves unavailable historical lines until explicitly removed", () => {
  assert.match(editPage, /prisma\.menuItem\.findMany\(\{\s*orderBy:/);
  assert.match(editPage, /const initialCart = order\.items\s*\.map\(/);
  assert.doesNotMatch(editPage, /\.filter\(\(line\) => availableIds\.has\(line\.menuItemId\)\)/);
  assert.match(orderClient, /unavailableCartCount > 0/);
  assert.match(orderClient, /برای ذخیره، آن‌ها را از سبد حذف کن/);
});
