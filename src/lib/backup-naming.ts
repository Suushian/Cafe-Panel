/**
 * Return the calendar date encoded in a supported backup filename.
 * Daily backups use cafe-YYYY-MM-DD.db; manual backups add _HHMMSS.
 */
export function backupDateFromFilename(filename: string): string | null {
  const match = filename.match(/^cafe-(\d{4}-\d{2}-\d{2})(?:_(\d{2})(\d{2})(\d{2}))?\.db$/);
  if (!match) return null;

  const [year, month, day] = match[1].split("-").map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return null;

  const parsed = new Date(0);
  parsed.setHours(0, 0, 0, 0);
  parsed.setFullYear(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) return null;

  if (match[2] !== undefined) {
    const hour = Number(match[2]);
    const minute = Number(match[3]);
    const second = Number(match[4]);
    if (hour > 23 || minute > 59 || second > 59) return null;
  }

  return match[1];
}
