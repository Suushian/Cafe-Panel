import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const packageJson = JSON.parse(
  fs.readFileSync(new URL("../package.json", import.meta.url), "utf8")
);
const packageLock = JSON.parse(
  fs.readFileSync(new URL("../package-lock.json", import.meta.url), "utf8")
);

test("Prisma CLI is a production dependency for packaged Electron startup", () => {
  assert.equal(packageJson.dependencies.prisma, "^7.10.0");
  assert.equal(packageJson.devDependencies.prisma, undefined);
  assert.equal(packageLock.packages["node_modules/prisma"].version, "7.10.0");
});

test("lint dependencies are locked and lint does not install packages at runtime", () => {
  assert.equal(packageJson.devDependencies.eslint, "9.39.1");
  assert.equal(packageJson.devDependencies["@typescript-eslint/parser"], "8.71.2");
  assert.equal(packageJson.scripts.lint, "eslint .");
  assert.equal(packageLock.packages["node_modules/eslint"].version, "9.39.1");
  assert.equal(packageLock.packages["node_modules/@typescript-eslint/parser"].version, "8.71.2");
});
