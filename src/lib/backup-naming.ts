/**
 * Return the calendar date encoded in a supported backup filename.
 * Daily backups use cafe-YYYY-MM-DD.db; manual backups add _HHMMSS.
 * Validate the actual calendar date and clock time, not just their shape.
 */
export function backupDateFromFilename(filename: string): string | null {
  const match = filename.match(
    /^cafe-(\d{4})-(\d{2})-(\d{2})(?:_(\d{2})(\d{2})(\d{2}))?\.db$/
  );
  if (!match) return null;

  const [, yearRaw, monthRaw, dayRaw, hourRaw, minuteRaw, secondRaw] = match;
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  if (year < 1 || month < 1 || month > 12 || day < 1) return null;

  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    leapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  if (day > daysInMonth[month - 1]) return null;

  if (hourRaw !== undefined) {
    const hour = Number(hourRaw);
    const minute = Number(minuteRaw);
    const second = Number(secondRaw);
    if (hour > 23 || minute > 59 || second > 59) return null;
  }

  return `${yearRaw}-${monthRaw}-${dayRaw}`;
}
