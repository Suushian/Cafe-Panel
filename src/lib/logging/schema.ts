export const LOG_LEVELS = ["trace", "debug", "info", "warn", "error", "fatal"] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

export interface LogRecord {
  timestamp: string;
  level: LogLevel;
  event: string;
  message: string;
  service: "next-server" | "electron-main" | "renderer" | "audit";
  appVersion: string;
  environment: string;
  processId?: number;
  sessionId?: string;
  requestId?: string;
  operationId?: string;
  durationMs?: number;
  component?: string;
  metadata?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
}

export interface LoggerContext {
  component?: string;
  sessionId?: string;
  requestId?: string;
  operationId?: string;
  metadata?: Record<string, unknown>;
}

export function isLogLevel(value: unknown): value is LogLevel {
  return typeof value === "string" && (LOG_LEVELS as readonly string[]).includes(value);
}
