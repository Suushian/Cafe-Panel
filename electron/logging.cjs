const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const MAX_BYTES = 10 * 1024 * 1024;
const ROTATIONS = 5;

function safe(value) {
  const secrets = /(password|passwd|token|secret|authorization|cookie|session|api[-_]?key|credential)/i;
  if (Array.isArray(value)) return value.slice(0, 100).map(safe);
  if (value && typeof value === "object") {
    const result = {};
    for (const [key, child] of Object.entries(value).slice(0, 100)) {
      result[key] = secrets.test(key) ? "[REDACTED]" : safe(child);
    }
    return result;
  }
  if (typeof value === "string") {
    return value.replace(/(bearer\s+)[A-Za-z0-9._~+/=-]+/gi, "$1[REDACTED]").slice(0, 4000);
  }
  if (typeof value === "bigint") return value.toString();
  return value;
}

function createMainLogger(getLogDirectory, appVersion) {
  function write(level, event, message, details) {
    const record = safe({
      timestamp: new Date().toISOString(),
      level,
      event,
      message,
      service: "electron-main",
      appVersion,
      environment: process.env.NODE_ENV || "production",
      processId: process.pid,
      hostname: os.hostname(),
      ...(details ? { details } : {})
    });
    try {
      const directory = getLogDirectory();
      fs.mkdirSync(directory, { recursive: true });
      const filename = level === "error" || level === "fatal" ? "errors.jsonl" : "app.jsonl";
      const file = path.join(directory, filename);
      const line = JSON.stringify(record) + "\n";
      if (fs.existsSync(file) && fs.statSync(file).size + Buffer.byteLength(line) > MAX_BYTES) {
        for (let i = ROTATIONS - 1; i >= 1; i--) {
          const from = i === 1 ? file : file + "." + (i - 1);
          const to = file + "." + i;
          if (fs.existsSync(from)) {
            try { fs.rmSync(to, { force: true }); } catch {}
            fs.renameSync(from, to);
          }
        }
      }
      fs.appendFileSync(file, line, { encoding: "utf8", mode: 0o600 });
    } catch (error) {
      try { process.stderr.write("[Cafe Panel logging failure] " + String(error) + "\n"); } catch {}
    }
  }
  return {
    info: (event, message, details) => write("info", event, message, details),
    warn: (event, message, details) => write("warn", event, message, details),
    error: (event, message, error, details) => write("error", event, message, {
      ...(details || {}),
      error: error ? { name: error.name || "Error", message: String(error.message || error), stack: error.stack } : undefined
    }),
    fatal: (event, message, error, details) => write("fatal", event, message, {
      ...(details || {}),
      error: error ? { name: error.name || "Error", message: String(error.message || error), stack: error.stack } : undefined
    })
  };
}

module.exports = { createMainLogger };
