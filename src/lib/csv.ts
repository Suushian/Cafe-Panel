/**
 * Escape one CSV field and neutralize spreadsheet formula injection in text.
 * Numeric values remain numeric; untrusted text beginning with a formula marker
 * is prefixed with an apostrophe before normal CSV quoting is applied.
 */
export function csvEscape(value: string | number): string {
  const raw = String(value);
  const safe = typeof value === "string" && /^[\u0000-\u0020]*[=+\-@]/.test(value)
    ? `'${raw}`
    : raw;

  if (/[,"\r\n]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}
