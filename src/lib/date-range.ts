const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateParam(value: string | null | undefined): value is string {
  if (typeof value !== "string" || !DATE_RE.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return false;

  // Date constructors normalize impossible dates (for example, February 31),
  // so compare the calendar fields after constructing the date explicitly.
  const parsed = new Date(0);
  parsed.setHours(0, 0, 0, 0);
  parsed.setFullYear(year, month - 1, day);
  return parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day;
}

export function getTodayParam(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function dayRange(dateParam: string): { start: Date; end: Date } {
  // Parse as local date
  const [y, m, d] = dateParam.split("-").map(Number);
  const start = new Date(y, m - 1, d, 0, 0, 0, 0);
  const end = new Date(y, m - 1, d, 23, 59, 59, 999);
  return { start, end };
}

export function shiftDate(dateParam: string, days: number): string {
  const [y, m, d] = dateParam.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function formatDateParam(dateParam: string): string {
  const [y, m, d] = dateParam.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(dt);
}
