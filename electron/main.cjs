const { app, BrowserWindow, dialog } = require("electron");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { createMainLogger } = require("./logging.cjs");

let nextApp;
let server;
let mainWindow;

const appDir = app.getAppPath();
const logDirectory = () => path.join(app.getPath("userData"), "logs");
const log = createMainLogger(logDirectory, app.getVersion());

async function prepareWritableData() {
  const userDataDir = app.getPath("userData");
  const dataDir = path.join(userDataDir, "data");
  const backupsDir = path.join(dataDir, "backups");
  fs.mkdirSync(backupsDir, { recursive: true });
  fs.mkdirSync(logDirectory(), { recursive: true });
  log.info("app.data.prepare.started", "Preparing writable application data", { userDataDir });

  const dbPath = path.join(dataDir, "cafe.db");
  if (!fs.existsSync(dbPath)) {
    const bundledDb = path.join(appDir, "data", "cafe.db");
    if (!fs.existsSync(bundledDb)) {
      throw new Error("The initial database was not packaged with Cafe Panel.");
    }
    fs.copyFileSync(bundledDb, dbPath);
    log.info("database.initial.copy.completed", "Copied initial database into user data directory");
  }

  process.chdir(userDataDir);
}

function runDatabaseMigrations() {
  const dbPath = path.join(app.getPath("userData"), "data", "cafe.db");
  const prismaCli = path.join(appDir, "node_modules", "prisma", "build", "index.js");
  if (!fs.existsSync(prismaCli)) throw new Error("Prisma CLI was not packaged; database migrations cannot run.");
  log.info("database.migration.started", "Applying pending database migrations");
  const result = spawnSync(process.execPath, [prismaCli, "migrate", "deploy", "--schema", path.join(appDir, "prisma", "schema.prisma")], {
    cwd: appDir, encoding: "utf8", timeout: 120000, maxBuffer: 4 * 1024 * 1024,
    env: { ...process.env, ELECTRON_RUN_AS_NODE: "1", DATABASE_URL: "file:" + dbPath.replace(/\\/g, "/"), PRISMA_HIDE_UPDATE_MESSAGE: "1" }
  });
  if (result.stdout) log.info("database.migration.output", "Migration command output", { output: result.stdout.slice(-6000) });
  if (result.stderr) log.warn("database.migration.stderr", "Migration command diagnostics", { output: result.stderr.slice(-3000) });
  if (result.error || result.status !== 0) {
    const error = result.error || new Error("Prisma migrate deploy exited with status " + result.status);
    log.fatal("database.migration.failed", "Database migration failed", error, { status: result.status });
    throw error;
  }
  log.info("database.migration.completed", "Database migrations completed");
}

async function startServer() {
  log.info("app.startup.started", "Cafe Panel startup started", {
    platform: process.platform,
    arch: process.arch,
    appPath: appDir
  });
  await prepareWritableData();
  runDatabaseMigrations();
  process.env.NODE_ENV = "production";
  process.env.NEXT_TELEMETRY_DISABLED = "1";
  process.env.CAFE_LOG_DIR = logDirectory();

  const next = require(path.join(appDir, "node_modules", "next"));
  nextApp = next({ dev: false, dir: appDir });
  await nextApp.prepare();
  log.info("server.next.ready", "Next.js application prepared");

  const handler = nextApp.getRequestHandler();
  server = http.createServer((req, res) => {
    const startedAt = Date.now();
    res.once("finish", () => {
      const level = res.statusCode >= 500 ? "warn" : "info";
      log[level]("http.request.completed", "Local HTTP request completed", {
        method: req.method,
        path: String(req.url || "").split("?")[0].slice(0, 200),
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt
      });
    });
    try {
      const result = handler(req, res);
      if (result && typeof result.catch === "function") {
        result.catch((error) => {
          log.error("http.request.handler.failed", "Unhandled local HTTP request handler failure", error, {
            method: req.method,
            path: String(req.url || "").split("?")[0].slice(0, 200)
          });
          if (!res.headersSent && !res.writableEnded) {
            res.statusCode = 500;
            res.end("Internal Server Error");
          } else if (!res.writableEnded) {
            res.destroy();
          }
        });
      }
    } catch (error) {
      log.error("http.request.handler.failed", "Synchronous local HTTP request handler failure", error, {
        method: req.method,
        path: String(req.url || "").split("?")[0].slice(0, 200)
      });
      if (!res.headersSent && !res.writableEnded) {
        res.statusCode = 500;
        res.end("Internal Server Error");
      } else if (!res.writableEnded) {
        res.destroy();
      }
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Could not determine the local server port.");
  }
  log.info("server.http.ready", "Local HTTP server is listening", { address: "127.0.0.1", port: address.port });

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 940,
    minWidth: 1024,
    minHeight: 700,
    title: "Cafe Panel",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  mainWindow.webContents.on("render-process-gone", (_event, details) => {
    log.error("renderer.process.gone", "Renderer process exited unexpectedly", new Error(details.reason || "Renderer exited"), details);
  });
  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    log.error("renderer.load.failed", "Renderer failed to load", new Error(errorDescription), {
      errorCode,
      url: String(validatedURL || "").split("?")[0]
    });
  });
  await mainWindow.loadURL(`http://127.0.0.1:${address.port}`);
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  log.info("app.startup.completed", "Cafe Panel startup completed");
}

app.whenReady().then(startServer).catch((error) => {
  log.fatal("app.startup.failed", "Cafe Panel failed to start", error);
  console.error("Cafe Panel startup failed:", error);
  dialog.showErrorBox(
    "Cafe Panel could not start",
    `The application failed to start. Your data has not been intentionally removed.\n\n${error?.stack || error}`
  );
  app.quit();
});

app.on("window-all-closed", () => {
  app.quit();
});

app.on("before-quit", () => {
  log.info("app.shutdown.started", "Cafe Panel is shutting down");
  if (server) {
    server.close();
    server = null;
  }
});
