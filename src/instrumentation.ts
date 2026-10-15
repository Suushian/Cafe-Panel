export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { exportAuditBatch } = await import("@/lib/logging/audit-exporter");
    await exportAuditBatch(500);
  } catch (error) {
    try {
      const { logger } = await import("@/lib/logging/logger");
      logger.error("audit.export.startup.failed", "Could not drain pending audit outbox during startup", error);
    } catch {
      // Startup must remain diagnosable even if the logging subsystem itself cannot initialize.
    }
  }
}
