import test from "node:test";
import assert from "node:assert/strict";
import { backupDateFromFilename } from "../src/lib/backup-naming.ts";

test("accepts daily and timestamped backup filenames", () => {
  assert.equal(backupDateFromFilename("cafe-2024-02-29.db"), "2024-02-29");
  assert.equal(backupDateFromFilename("cafe-2026-10-16.db"), "2026-10-16");
  assert.equal(backupDateFromFilename("cafe-2026-10-16_235959.db"), "2026-10-16");
  assert.equal(backupDateFromFilename("cafe-2026-01-02_000000.db"), "2026-01-02");
});

test("rejects impossible dates and invalid clock times", () => {
  for (const name of [
    "cafe-2026-02-29.db",
    "cafe-2026-04-31.db",
    "cafe-0000-01-01.db",
    "cafe-2026-10-16_246000.db",
    "cafe-2026-10-16_126060.db",
    "cafe-2026-10-16_1260.db",
  ]) {
    assert.equal(backupDateFromFilename(name), null, name);
  }
});

test("rejects unsupported names and malformed timestamps", () => {
  for (const name of [
    "",
    "cafe.db",
    "other-2026-10-14.db",
    "cafe-2026-10-14_1023.db",
    "cafe-2026-10-14_999999.db",
    "cafe-2026-13-01.db",
    "cafe-2026-10-14.db.bak",
    "../cafe-2026-10-14.db",
  ]) {
    assert.equal(backupDateFromFilename(name), null, name);
  }
});
