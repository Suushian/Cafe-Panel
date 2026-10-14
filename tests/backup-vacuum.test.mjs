import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createClient } from "@libsql/client";

test("libSQL can create and integrity-check a consistent VACUUM INTO backup", async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "cafe-backup-test-"));
  const sourcePath = path.join(dir, "source.db");
  const backupPath = path.join(dir, "backup.db");
  const source = createClient({ url: `file:${sourcePath}` });
  t.after(async () => {
    source.close();
    await fs.rm(dir, { recursive: true, force: true });
  });

  await source.execute("CREATE TABLE smoke_test (id INTEGER PRIMARY KEY, value TEXT NOT NULL)");
  await source.execute({ sql: "INSERT INTO smoke_test (value) VALUES (?)", args: ["backup-ok"] });
  const escapedPath = backupPath.replace(/'/g, "''");
  await source.execute(`VACUUM INTO '${escapedPath}'`);

  const backup = createClient({ url: `file:${backupPath}` });
  t.after(() => backup.close());
  const integrity = await backup.execute("PRAGMA integrity_check");
  assert.equal(integrity.rows[0]?.integrity_check, "ok");
  const rows = await backup.execute("SELECT value FROM smoke_test");
  assert.equal(rows.rows.length, 1);
  assert.equal(rows.rows[0]?.value, "backup-ok");
});
