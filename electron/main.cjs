const { app, BrowserWindow, dialog } = require("electron");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");

const execFileAsync = promisify(execFile);

let nextApp;
let server;
let mainWindow;

const appDir = app.getAppPath();

async function applyMigrations(dbPath) {
  const prismaCli = path.join(appDir, "node_modules", "prisma", "build", "index.js");
  const prismaConfig = path.join(appDir, "prisma.config.ts");

  if (!fs.existsSync(prismaCli) || !fs.existsSync(prismaConfig)) {
    throw new Error("Database migration tooling is missing from the installation.");
  }

  await execFileAsync(
    process.execPath,
    [prismaCli, "migrate", "deploy", "--config", prismaConfig],
    {
      cwd: appDir,
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1",
        DATABASE_URL: `file:${dbPath}`,
      },
      windowsHide: true,
      maxBuffer: 10 * 1024 * 1024,
    }
  );
}

async function prepareWritableData() {
  const userDataDir = app.getPath("userData");
  const dataDir = path.join(userDataDir, "data");
  const backupsDir = path.join(dataDir, "backups");
  fs.mkdirSync(backupsDir, { recursive: true });

  const dbPath = path.join(dataDir, "cafe.db");
  if (!fs.existsSync(dbPath)) {
    const bundledDb = path.join(appDir, "data", "cafe.db");
    if (!fs.existsSync(bundledDb)) {
      throw new Error("The initial database was not packaged with Cafe Panel.");
    }
    fs.copyFileSync(bundledDb, dbPath);
  }

  // Upgrade existing user databases before the application opens a Prisma client.
  // A failed migration aborts startup without deleting or replacing the user's database.
  await applyMigrations(dbPath);

  // Application data and backups must remain outside the installation directory.
  process.chdir(userDataDir);
}

async function startServer() {
  await prepareWritableData();
  process.env.NODE_ENV = "production";
  process.env.NEXT_TELEMETRY_DISABLED = "1";

  const next = require(path.join(appDir, "node_modules", "next"));
  nextApp = next({ dev: false, dir: appDir });
  await nextApp.prepare();

  const handler = nextApp.getRequestHandler();
  server = http.createServer((req, res) => handler(req, res));
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Could not determine the local server port.");
  }

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
  await mainWindow.loadURL(`http://127.0.0.1:${address.port}`);
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(startServer).catch((error) => {
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
  if (server) {
    server.close();
    server = null;
  }
});
