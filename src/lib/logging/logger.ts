import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { redact } from "./redaction";
import { serializeError } from "./error-serializer";
import type { LogLevel, LogRecord, LoggerContext } from "./schema";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 5;
const DEFAULT_LEVEL: LogLevel = process.env.CAFE_LOG_LEVEL === "debug" ? "debug" : "info";
const RANK: Record<LogLevel, number> = { trace: 0, debug: 1, info: 2, warn: 3, error: 4, fatal: 5 };

function logDirectory(): string {
  const configured = process.env.CAFE_LOG_DIR;
  return path.resolve(configured || path.join(process.cwd(), "logs"));
}

function rotateIfNeeded(filePath: string, incomingBytes: number): void {
  try {
    if (!fs.existsSync(filePath) || fs.statSync(filePath).size + incomingBytes <= MAX_FILE_BYTES) return;
    for (let index = MAX_FILES - 1; index >= 1; index--) {
      const source = index === 1 ? filePath : `${filePath}.${index - 1}`;
      const target = `${filePath}.${index}`;
      if (fs.existsSync(source)) {
        if (fs.existsSync(target)) fs.unlinkSync(target);
        fs.renameSync(source, target);
      }
    }
  } catch {
    // Logging must never recursively fail while attempting rotation.
  }
}

function writeRecord(record: LogRecord): void {
  const directory = logDirectory();
  const filePath = path.join(directory, record.level === "error" || record.level === "fatal" ? "errors.jsonl" : "app.jsonl");
  try {
    fs.mkdirSync(directory, { recursive: true });
    const line = JSON.stringify(redact(record)) + "\n";
    rotateIfNeeded(filePath, Buffer.byteLength(line));
    fs.appendFileSync(filePath, line, { encoding: "utf8", mode: 0o600 });
  } catch (writeError) {
    // Avoid recursion; stderr is the last-resort channel for a failed log sink.
    try { process.stderr.write(`[Cafe Panel logger failure] ${String(writeError)}\n`); } catch { /* ignore */ }
  }
}

export class Logger {
  constructor(private readonly context: LoggerContext = {}) {}

  child(context: LoggerContext): Logger {
    return new Logger({ ...this.context, ...context, metadata: { ...this.context.metadata, ...context.metadata } });
  }

  trace(event: string, message: string, metadata?: Record<string, unknown>): void { this.log("trace", event, message, metadata); }
  debug(event: string, message: string, metadata?: Record<string, unknown>): void { this.log("debug", event, message, metadata); }
  info(event: string, message: string, metadata?: Record<string, unknown>): void { this.log("info", event, message, metadata); }
  warn(event: string, message: string, metadata?: Record<string, unknown>): void { this.log("warn", event, message, metadata); }
  error(event: string, message: string, error?: unknown, metadata?: Record<string, unknown>): void {
    this.log("error", event, message, metadata, error);
  }
  fatal(event: string, message: string, error?: unknown, metadata?: Record<string, unknown>): void {
    this.log("fatal", event, message, metadata, error);
  }

  private log(level: LogLevel, event: string, message: string, metadata?: Record<string, unknown>, error?: unknown): void {
    if (RANK[level] < RANK[DEFAULT_LEVEL]) return;
    const record: LogRecord = {
      timestamp: new Date().toISOString(),
      level,
      event: event.slice(0, 160),
      message: message.slice(0, 2000),
      service: "next-server",
      appVersion: process.env.npm_package_version || "unknown",
      environment: process.env.NODE_ENV || "development",
      processId: process.pid,
      ...(this.context.component ? { component: this.context.component } : {}),
      ...(this.context.sessionId ? { sessionId: this.context.sessionId } : {}),
      ...(this.context.requestId ? { requestId: this.context.requestId } : {}),
      ...(this.context.operationId ? { operationId: this.context.operationId } : {}),
      ...(this.context.metadata || metadata ? { metadata: { ...this.context.metadata, ...metadata } } : {}),
      ...(error !== undefined ? { error: serializeError(error) } : {}),
    };
    writeRecord(record);
    if (level === "warn" || level === "error" || level === "fatal") {
      try { console.error(JSON.stringify({ level, event: record.event, message: record.message })); } catch { /* ignore */ }
    }
  }
}

export const logger = new Logger({ sessionId: randomUUID() });
