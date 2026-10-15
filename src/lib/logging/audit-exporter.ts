import fs from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { redact } from "./redaction";
import { logger } from "./logger";

function auditFilePath(): string {
  return path.join(process.env.CAFE_LOG_DIR || path.join(process.cwd(), "logs"), "audit.jsonl");
}

/**
 * Drains a bounded batch from the transactional outbox to the append-only JSONL export.
 * Duplicate lines are possible if the process stops after append but before marking exported;
 * consumers should de-duplicate by eventId.
 */
export async function exportAuditBatch(limit = 100): Promise<number> {
  const batchSize = Math.max(1, Math.min(500, Math.floor(limit)));
  const events = await prisma.auditOutbox.findMany({
    where: { exportedAt: null },
    orderBy: { createdAt: "asc" },
    take: batchSize,
  });
  if (events.length === 0) return 0;

  const file = auditFilePath();
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const lines = events.map((item) => JSON.stringify(redact(JSON.parse(item.payloadJson)))).join("\n") + "\n";
    fs.appendFileSync(file, lines, { encoding: "utf8", mode: 0o600 });
    const now = new Date();
    await prisma.auditOutbox.updateMany({
      where: { id: { in: events.map((item) => item.id) }, exportedAt: null },
      data: { exportedAt: now },
    });
    return events.length;
  } catch (error) {
    logger.error("audit.export.failed", "Failed to export audit events", error, { count: events.length });
    throw error;
  }
}
