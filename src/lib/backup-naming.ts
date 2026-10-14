/**
 * Return the calendar date encoded in a supported backup filename.
 * Daily backups use cafe-YYYY-MM-DD.db; manual backups add _HHMMSS.
 */
export function backupDateFromFilename(filename: string): string | null {
  const match = filename.match(/^cafe-(\d{4}-\d{2}-\d{2})(?:_\d{6})?\.db$/);
  return match?.[1] ?? null;
}
