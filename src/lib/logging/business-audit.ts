import { recordAudit, type AuditInput } from "./audit";
import { logger } from "./logger";

/** Audit failures are surfaced in technical logs without lying about an already committed business action. */
export async function recordBusinessAudit(input: AuditInput): Promise<void> {
  try {
    await recordAudit(input);
  } catch (error) {
    logger.error("audit.business.record.failed", "Business action completed but its audit event could not be persisted", error, {
      event: input.event,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? undefined,
    });
  }
}
