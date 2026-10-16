import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Resolve the path once and convert it to a file URL. Passing a raw Windows
  // path (for example, D:\\work\\cafe.db) to libSQL can fail because the
  // backslashes and drive letter are interpreted as URL syntax.
  const dbPath = path.resolve(process.cwd(), "data", "cafe.db");
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
