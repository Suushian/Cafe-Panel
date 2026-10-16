import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { defineConfig } from "prisma/config";

const dbPath = path.resolve(process.cwd(), "data", "cafe.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? pathToFileURL(dbPath).href,
  },
});
