import { redact } from "./redaction";

export function serializeError(input: unknown): { name: string; message: string; stack?: string; code?: string } | undefined {
  if (input == null) return undefined;
  if (input instanceof Error) {
    const candidate = input as Error & { code?: unknown };
    return {
      name: input.name || "Error",
      message: String(redact(input.message)),
      ...(input.stack ? { stack: String(redact(input.stack)) } : {}),
      ...(typeof candidate.code === "string" ? { code: candidate.code } : {}),
    };
  }
  return { name: "UnknownError", message: String(redact(input)) };
}
