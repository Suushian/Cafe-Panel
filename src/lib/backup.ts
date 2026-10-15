import "server-only";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import { backupDateFromFilename } from "@/lib/backup-naming";
import { logger } from "@/lib/logging";

const RETENTION_DAYS = 30;

export type BackupInfo = {
  filename: string;
  date: string;       // YYYY-MM-DD
  sizeBytes: number;
  createdAt: Date;
};

function backupsDir(): string {
  return path.join(process.cwd(), "data", "backups");
}

function ensureDir(): void {
  const dir = backupsDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function listBackups(): Promise<BackupInfo[]> {
  ensureDir();
  const dir = backupsDir();
  const entries = fs.readdirSync(dir).filter((f) => f.endsWith(".db"));

  const result: BackupInfo[] = [];
  for (const filename of entries) {
    const date = backupDateFromFilename(filename);
    if (!date) continue;

    const full = path.join(dir, filename);
    const stat = fs.statSync(full);
    if (!stat.isFile()) continue;

    result.push({
      filename,
      date,
      sizeBytes: stat.size,
      createdAt: stat.mtime,
    });
  }

  // mtime also distinguishes multiple manual backups made on the same day.
  result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return result;
}

export async function getLastBackup(): Promise<BackupInfo | null> {
  const all = await listBackups();
  return all[0] ?? null;
}

async function createBackupFile(targetPath: string): Promise<void> {
  const dbPath = path.join(process.cwd(), "data", "cafe.db");
  if (!fs.existsSync(dbPath)) {
    throw new Error("SQLite database file does not exist.");
  }

  // Use the same libSQL driver family as Prisma, but a dedicated connection.
  // This avoids running VACUUM through Prisma's query/transaction wrapper.
  const client = createClient({ url: `file:${dbPath}` });
  const safe = targetPath.replace(/\\/g, "/").replace(/'/g, "''");
  try {
    await client.execute(`VACUUM INTO '${safe}'`);
  } catch (err) {
    try {
      if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
    } catch {
      // Preserve the original backup error.
    }
    throw new Error("SQLite VACUUM INTO backup failed; no fallback copy was made.", {
      cause: err,
    });
  } finally {
    client.close();
  }
}

function cleanupOldBackups(): number {
  ensureDir();
  const dir = backupsDir();
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  let removed = 0;

  const entries = fs.readdirSync(dir).filter((f) => f.endsWith(".db"));
  for (const filename of entries) {
    const full = path.join(dir, filename);
    const stat = fs.statSync(full);
    if (stat.mtime.getTime() < cutoff) {
      try {
        fs.unlinkSync(full);
        removed++;
      } catch {
        // Ignore individual cleanup failures; preserve remaining backups.
      }
    }
  }
  return removed;
}

export type EnsureResult = {
  created: boolean;
  filename: string;
  removedOld: number;
};

export async function ensureDailyBackup(): Promise<EnsureResult | null> {
  try {
    ensureDir();
    const date = new Date();
    const filename = `cafe-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}.db`;
    const fullPath = path.join(backupsDir(), filename);

    if (fs.existsSync(fullPath)) {
      return { created: false, filename, removedOld: 0 };
    }

    await createBackupFile(fullPath);
    const removedOld = cleanupOldBackups();

    return { created: true, filename, removedOld };
  } catch (err) {
    logger.error("backup.daily.failed", "Daily database backup failed", err);
    return null;
  }
}

/**
 * Force a backup regardless of today's existing backups.
 * Uses a timestamp suffix to avoid collision.
 */
export async function createManualBackup(): Promise<BackupInfo | null> {
  try {
    ensureDir();
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    const stamp = `${y}-${m}-${d}_${hh}${mm}${ss}`;
    const filename = `cafe-${stamp}.db`;
    const fullPath = path.join(backupsDir(), filename);

    await createBackupFile(fullPath);

    const stat = fs.statSync(fullPath);
    return {
      filename,
      date: `${y}-${m}-${d}`,
      sizeBytes: stat.size,
      createdAt: stat.mtime,
    };
  } catch (err) {
    logger.error("backup.manual.failed", "Manual database backup failed", err);
    return null;
  }
}
