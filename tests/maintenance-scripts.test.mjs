import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

function read(path) {
  return fs.readFileSync(new URL(path, import.meta.url), "utf8");
}

test("database utility scripts use the configured libSQL adapter", () => {
  for (const path of [
    "../scripts-clear-all.cjs",
    "../scripts-seed-report.cjs",
    "../scripts-test-order.cjs",
    "../scripts/seed-menu.cjs",
  ]) {
    const source = read(path);
    assert.match(source, /@prisma\/adapter-libsql/);
    assert.doesNotMatch(source, /@prisma\/adapter-better-sqlite3/);
  }
});

test("destructive cleanup requires an explicit confirmation flag", () => {
  const source = read("../scripts-clear-all.cjs");
  assert.match(source, /CAFE_PANEL_CONFIRM_CLEAR !== "YES"/);
});

test("menu seeding refuses to overwrite an existing menu", () => {
  const source = read("../scripts/seed-menu.cjs");
  assert.match(source, /const existing = await prisma\.menuItem\.count\(\)/);
  assert.doesNotMatch(source, /prisma\.menuItem\.deleteMany\(\)/);
});

test("report seeding checks for every menu item it references", () => {
  assert.match(read("../scripts-seed-report.cjs"), /menu\.length < 4/);
});

test("Windows stop launcher only delegates to verified process ownership checks", () => {
  const stop = read("../launch/Stop.bat");
  const processHelper = read("../launch/ServerProcess.ps1");
  assert.match(stop, /ServerProcess\.ps1.*-Action stop/);
  assert.match(processHelper, /IndexOf\(\$projectDir/);
  assert.match(processHelper, /taskkill\.exe \/T \/F \/PID \$rootId/);
  assert.match(processHelper, /Refusing to stop it/);
});
