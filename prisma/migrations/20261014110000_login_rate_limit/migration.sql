CREATE TABLE "LoginRateLimit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "count" INTEGER NOT NULL DEFAULT 0,
    "blockedUntil" DATETIME,
    "updatedAt" DATETIME NOT NULL
);

CREATE INDEX "LoginRateLimit_blockedUntil_idx" ON "LoginRateLimit"("blockedUntil");
