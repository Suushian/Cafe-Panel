const SECRET_KEY = /(password|passwd|token|secret|authorization|cookie|session|api[-_]?key|credential|private[-_]?key|client[-_]?secret|refresh[-_]?token)/i;
const SENSITIVE_TEXT = /(bearer\\s+)[A-Za-z0-9._~+/=-]+/gi;
const SENSITIVE_QUERY = /([?&](?:access_token|refresh_token|token|api_key|apikey|password|secret|authorization)=)[^&#\\s]*/gi;
const MAX_STRING_LENGTH = 4000;
const MAX_DEPTH = 6;
const MAX_ITEMS = 100;

export function redact(value: unknown, depth = 0, seen = new WeakSet<object>()): unknown {
  if (depth > MAX_DEPTH) return "[MaxDepth]";
  if (typeof value === "string") {
    return value
      .replace(SENSITIVE_TEXT, "$1[REDACTED]")
      .replace(SENSITIVE_QUERY, "$1[REDACTED]")
      .slice(0, MAX_STRING_LENGTH);
  }
  if (Array.isArray(value)) {
    if (seen.has(value)) return "[Circular]";
    seen.add(value);
    return value.slice(0, MAX_ITEMS).map((item) => redact(item, depth + 1, seen));
  }
  if (value && typeof value === "object") {
    if (seen.has(value)) return "[Circular]";
    seen.add(value);
    const output: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>).slice(0, MAX_ITEMS)) {
      output[key] = SECRET_KEY.test(key) ? "[REDACTED]" : redact(child, depth + 1, seen);
    }
    return output;
  }
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "function") return "[Function]";
  if (typeof value === "symbol") return String(value);
  return value;
}
