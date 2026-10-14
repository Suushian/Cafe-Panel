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

function dbPath(): string {
  return path.join(process.cwd(), "data", "cafe.db");
}

function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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
    const full = path.join(dir, filename);
    const stat = fs.statSync(full);
    const m = filename.match(/^cafe-(\d{4}-\d{2}-\d{2})\.db$/);
    if (!m) continue;
    result.push({
      filename,
      date: m[1],
      sizeBytes: stat.size,
      createdAt: stat.mtime,
    });
  }

  result.sort((a, b) => b.date.localeCompare(a.date));
  return result;
}

export async function getLastBackup(): Promise<BackupInfo | null> {
  const all = await listBackups();
  return all[0] ?? null;
}

async function createBackupFile(targetPath: string): Promise<void> {
  // Try VACUUM INTO first — SQLite's official consistent backup method.
  // Falls back to fs.copyFileSync if raw query fails (e.g. adapter limitation).
  try {
    const safe = targetPath.replace(/\\/g, "/").replace(/'/g, "''");
    await prisma.$executeRawUnsafe(`VACUUM INTO '${safe}'`);
    return;
  } catch (err) {
    console.warn("VACUUM INTO failed, falling back to copyFile:", err);
  }

  fs.copyFileSync(dbPath(), targetPath);
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
        // ignore
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
    const date = todayISO();
    const filename = `cafe-${date}.db`;
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