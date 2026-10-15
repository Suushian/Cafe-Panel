export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const drainPendingAudit = async (): Promise<number> => {
    const { exportAuditBatch } = await import("@/lib/logging/audit-exporter");
    return exportAuditBatch(500);
  };

  try {
    await drainPendingAudit();
  } catch (error) {
    try {
      const { logger } = await import("@/lib/logging/logger");
      logger.error("audit.export.startup.failed", "Could not drain pending audit outbox during startup", error);
    } catch {
      // Startup must remain diagnosable even if the logging subsystem itself cannot initialize.
    }
  }

  // A failed export must not remain pending indefinitely when no further audit events occur.
  // Use an unreferenced timer so this retry loop does not keep the application alive at shutdown.
  const retry = async (): Promise<void> => {
    try {
      const count = await drainPendingAudit();
      if (count > 0) {
        const { logger } = await import("@/lib/logging/logger");
        logger.info("audit.export.retry.completed", "Pending audit events exported", { count });
      }
    } catch (error) {
      try {
        const { logger } = await import("@/lib/logging/logger");
        logger.error("audit.export.retry.failed", "Pending audit export will be retried", error);
      } catch {
        // Do not crash the application because diagnostics are unavailable.
      }
    } finally {
      const timer = setTimeout(() => void retry(), 60_000);
      timer.unref?.();
    }
  };

  const timer = setTimeout(() => void retry(), 60_000);
  timer.unref?.();
}
