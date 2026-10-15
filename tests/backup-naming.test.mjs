import test from "node:test";
import assert from "node:assert/strict";
import { backupDateFromFilename } from "../src/lib/backup-naming.ts";

test("recognizes daily backup filenames", () => {
  assert.equal(backupDateFromFilename("cafe-2026-10-14.db"), "2026-10-14");
});

test("recognizes timestamped manual backup filenames", () => {
  assert.equal(backupDateFromFilename("cafe-2026-10-14_102305.db"), "2026-10-14");
});

test("rejects unsupported names and malformed timestamps", () => {
  for (const name of [
    "other-2026-10-14.db",
    "cafe-2026-10-14_1023.db",
    "cafe-2026-10-14.db.bak",
    "../cafe-2026-10-14.db",
  ]) {
    assert.equal(backupDateFromFilename(name), null, name);
  }
});


test("validates real calendar dates and manual backup times", () => {
  assert.equal(backupDateFromFilename("cafe-2024-02-29.db"), "2024-02-29");
  assert.equal(backupDateFromFilename("cafe-2026-02-29.db"), null);
  assert.equal(backupDateFromFilename("cafe-2026-02-30.db"), null);
  assert.equal(backupDateFromFilename("cafe-2026-13-01.db"), null);
  assert.equal(backupDateFromFilename("cafe-2026-10-14_235959.db"), "2026-10-14");
  assert.equal(backupDateFromFilename("cafe-2026-10-14_246000.db"), null);
  assert.equal(backupDateFromFilename("cafe-2026-10-14_126060.db"), null);
});
