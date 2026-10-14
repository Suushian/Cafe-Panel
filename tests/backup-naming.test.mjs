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
