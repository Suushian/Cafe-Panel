import "server-only";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";

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

function backupDate(filename: string): string | null {
  // Daily: cafe-YYYY-MM-DD.db; manual: cafe-YYYY-MM-DD_HHMMSS.db
  const match = filename.match(/^cafe-(\d{4}-\d{2}-\d{2})(?:_\d{6})?\.db$/);
  return match?.[1] ?? null;
}

export async function listBackups(): Promise<BackupInfo[]> {
  ensureDir();
  const dir = backupsDir();
  const entries = fs.readdirSync(dir).filter((f) => f.endsWith(".db"));

  const result: BackupInfo[] = [];
  for (const filename of entries) {
    const date = backupDate(filename);
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
  // VACUUM INTO produces a consistent snapshot. Do not silently fall back to
  // copying a live SQLite file: that copy may be inconsistent or incomplete.
  const safe = targetPath.replace(/\\/g, "/").replace(/'/g, "''");
  try {
    await prisma.$executeRawUnsafe(`VACUUM INTO '${safe}'`);
  } catch (err) {
    // Remove a partial target if SQLite created one before reporting failure.
    try {
      if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
    } catch {
      // Preserve the original backup error.
    }
    throw new Error("SQLite VACUUM INTO backup failed; no fallback copy was made.", {
      cause: err,
    });
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
    console.error("ensureDailyBackup failed:", err);
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
    console.error("createManualBackup failed:", err);
    return null;
  }
}
