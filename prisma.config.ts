import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "prisma/config";

const dbPath = path.resolve(process.cwd(), "data", "cafe.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

// Prisma CLI's SQLite schema engine expects a datasource URL with the
// Windows drive path after "file:", rather than a file:// URL authority.
const prismaDatasourceUrl = `file:${dbPath.replace(/\\\\/g, "/")}`;

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? prismaDatasourceUrl,
  },
});
