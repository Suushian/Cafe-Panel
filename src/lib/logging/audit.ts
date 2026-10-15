import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { logger } from "./logger";

export interface AuditInput {
  event: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  actorId?: string | null;
  result: "success" | "failure";
  operationId?: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export async function recordAudit(input: AuditInput): Promise<string> {
  const eventId = randomUUID();
  const timestamp = new Date();
  const payload = {
    eventId,
    timestamp: timestamp.toISOString(),
    event: input.event,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    actorId: input.actorId ?? null,
    result: input.result,
    operationId: input.operationId ?? null,
    changes: input.changes ?? null,
    metadata: input.metadata ?? null,
  };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.auditEvent.create({
        data: {
          id: eventId,
          event: input.event,
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId ?? null,
          actorId: input.actorId ?? null,
          result: input.result,
          operationId: input.operationId ?? null,
          payloadJson: JSON.stringify(payload),
          createdAt: timestamp,
        },
      });
      await tx.auditOutbox.create({
        data: { id: eventId, payloadJson: JSON.stringify(payload), createdAt: timestamp },
      });
    });
    return eventId;
  } catch (error) {
    logger.error("audit.write.failed", "Failed to persist audit event", error, {
      event: input.event,
      action: input.action,
      entityType: input.entityType,
    });
    throw error;
  }
}
