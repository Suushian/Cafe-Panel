import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createClient } from "@libsql/client";

test("SQLite migration rejects invalid order status, type, and discount values", async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "cafe-domain-migration-"));
  const dbPath = path.join(dir, "domain.db");
  const client = createClient({ url: `file:${dbPath}` });
  t.after(async () => {
    client.close();
    await fs.rm(dir, { recursive: true, force: true });
  });

  await client.execute(`CREATE TABLE "Order" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "orderType" TEXT NOT NULL DEFAULT 'dine_in',
    "discountType" TEXT NOT NULL DEFAULT 'none'
  )`);
  const migration = await fs.readFile(
    path.join(process.cwd(), "prisma/migrations/20261014111500_order_domain_checks/migration.sql"),
    "utf8"
  );
  await client.executeMultiple(migration);

  await client.execute({
    sql: 'INSERT INTO "Order" ("id", "status", "orderType", "discountType") VALUES (?, ?, ?, ?)',
    args: ["valid", "open", "dine_in", "none"],
  });

  for (const [id, status, orderType, discountType] of [
    ["bad-status", "refunded", "dine_in", "none"],
    ["bad-type", "open", "pickup", "none"],
    ["bad-discount", "open", "dine_in", "coupon"],
  ]) {
    await assert.rejects(client.execute({
      sql: 'INSERT INTO "Order" ("id", "status", "orderType", "discountType") VALUES (?, ?, ?, ?)',
      args: [id, status, orderType, discountType],
    }));
  }

  await assert.rejects(client.execute({
    sql: 'UPDATE "Order" SET "status" = ? WHERE "id" = ?',
    args: ["refunded", "valid"],
  }));
});
