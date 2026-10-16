import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("development and production startup apply Prisma migrations before Next.js starts", () => {
  const packageJson = JSON.parse(
    fs.readFileSync(new URL("../package.json", import.meta.url), "utf8")
  );

  assert.match(packageJson.scripts.predev, /prisma migrate deploy/);
  assert.match(packageJson.scripts.predev, /prisma generate/);
  assert.match(packageJson.scripts.predev.indexOf("prisma migrate deploy") < packageJson.scripts.predev.indexOf("prisma generate") ? "true" : "false", /^true$/);
  assert.match(packageJson.scripts.prestart, /prisma migrate deploy/);
});
