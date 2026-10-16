import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Ensure the directory exists in ZIP downloads and fresh installations,
  // where empty directories are not preserved by Git.
  const dbPath = path.resolve(process.cwd(), "data", "cafe.db");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  // Convert the absolute path to a proper file URL. This safely handles
  // Windows drive letters, backslashes, and spaces in the project path.
  const url = pathToFileURL(dbPath).href;
  const adapter = new PrismaLibSql({ url });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
