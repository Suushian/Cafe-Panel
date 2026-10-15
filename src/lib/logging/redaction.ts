const SECRET_KEY = /(password|passwd|token|secret|authorization|cookie|session|api[-_]?key|credential)/i;
const SENSITIVE_TEXT = /(bearer\s+)[A-Za-z0-9._~+/=-]+/gi;
const MAX_STRING_LENGTH = 4000;
const MAX_DEPTH = 6;

export function redact(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return "[MaxDepth]";
  if (typeof value === "string") {
    return value.replace(SENSITIVE_TEXT, "$1[REDACTED]").slice(0, MAX_STRING_LENGTH);
  }
  if (Array.isArray(value)) return value.slice(0, 100).map((item) => redact(item, depth + 1));
  if (value && typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>).slice(0, 100)) {
      output[key] = SECRET_KEY.test(key) ? "[REDACTED]" : redact(child, depth + 1);
    }
    return output;
  }
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "function") return "[Function]";
  return value;
}
