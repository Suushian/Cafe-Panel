"use server";

import { redirect } from "next/navigation";
import {
  adminExists,
  getAdmin,
  verifyPassword,
  createSession,
  setSessionCookie,
} from "@/lib/auth";
import type { ActionResult } from "@/lib/types";
import { prisma } from "@/lib/prisma";
import { getPasswordLengthError } from "@/lib/password-policy";

/* Persistent rate limit stored in SQLite so restarts do not reset failed attempts. */
const RATE_LIMIT_ID = "admin";
const MAX_ATTEMPTS = 5;
const BLOCK_MS = 60 * 1000;

async function checkRateLimit(): Promise<{ ok: true } | { ok: false; retryInSec: number }> {
  const attempt = await prisma.loginRateLimit.findUnique({ where: { id: RATE_LIMIT_ID } });
  if (!attempt?.blockedUntil) return { ok: true };
  const remaining = attempt.blockedUntil.getTime() - Date.now();
  if (remaining > 0) return { ok: false, retryInSec: Math.ceil(remaining / 1000) };
  // Expired blocks are reset atomically by recordFailure. Do not write here:
  // a concurrent failed attempt could otherwise be overwritten by this reset.
  return { ok: true };
}

async function recordFailure(): Promise<void> {
  // One SQLite UPSERT both increments the counter and applies the lock.
  // Requests arriving after the lock is active cannot increment/reset it.
  await prisma.$queryRaw<Array<{ count: number; blockedUntil: Date | null }>>`
    INSERT INTO "LoginRateLimit" ("id", "count", "blockedUntil", "updatedAt")
    VALUES (${RATE_LIMIT_ID}, 1, NULL, CURRENT_TIMESTAMP)
    ON CONFLICT("id") DO UPDATE SET
      "count" = CASE
        WHEN "LoginRateLimit"."blockedUntil" IS NOT NULL
          AND julianday("LoginRateLimit"."blockedUntil") > julianday('now')
          THEN "LoginRateLimit"."count"
        WHEN "LoginRateLimit"."blockedUntil" IS NOT NULL THEN 1
        WHEN "LoginRateLimit"."count" + 1 >= ${MAX_ATTEMPTS} THEN 0
        ELSE "LoginRateLimit"."count" + 1
      END,
      "blockedUntil" = CASE
        WHEN "LoginRateLimit"."blockedUntil" IS NOT NULL
          AND julianday("LoginRateLimit"."blockedUntil") > julianday('now')
          THEN "LoginRateLimit"."blockedUntil"
        WHEN "LoginRateLimit"."blockedUntil" IS NOT NULL THEN NULL
        WHEN "LoginRateLimit"."count" + 1 >= ${MAX_ATTEMPTS}
          THEN strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+' || ${BLOCK_MS / 1000} || ' seconds')
        ELSE NULL
      END,
      "updatedAt" = CURRENT_TIMESTAMP
    RETURNING "count", "blockedUntil"
  `;
}

async function clearFailures(): Promise<void> {
  await prisma.loginRateLimit.deleteMany({ where: { id: RATE_LIMIT_ID } });
}

export async function loginAdmin(formData: FormData): Promise<ActionResult> {
  const exists = await adminExists();
  if (!exists) {
    return { success: false, error: "مدیر هنوز راه‌اندازی نشده است." };
  }

  const password = String(formData.get("password") ?? "");
  if (!password) {
    return { success: false, error: "رمز عبور الزامی است." };
  }
  if (getPasswordLengthError(password)) {
    return { success: false, error: "رمز عبور نامعتبر است." };
  }

  let rl: Awaited<ReturnType<typeof checkRateLimit>>;
  try {
    rl = await checkRateLimit();
  } catch (err) {
    console.error("login rate limit check failed:", err);
    return { success: false, error: "خطای موقت در بررسی ورود. دوباره تلاش کن." };
  }
  if (!rl.ok) {
    return {
      success: false,
      error: `تلاش‌های ناموفق زیاد. لطفاً ${rl.retryInSec} ثانیه دیگر دوباره تلاش کن.`,
    };
  }

  const admin = await getAdmin();
  if (!admin) {
    return { success: false, error: "مدیر یافت نشد." };
  }

  const valid = await verifyPassword(password, admin.passwordHash);

  // Re-check after password hashing: concurrent failures may have locked the
  // account since the initial pre-hash check.
  if (valid) {
    try {
      const finalRateLimit = await checkRateLimit();
      if (!finalRateLimit.ok) {
        return {
          success: false,
          error: `تلاش‌های ناموفق زیاد. لطفاً ${finalRateLimit.retryInSec} ثانیه دیگر دوباره تلاش کن.`,
        };
      }
    } catch (err) {
      console.error("login rate limit recheck failed:", err);
      return { success: false, error: "خطای موقت در بررسی ورود. دوباره تلاش کن." };
    }
  }

  if (!valid) {
    try {
      await recordFailure();
    } catch (err) {
      console.error("login failure counter update failed:", err);
      return { success: false, error: "خطای موقت در بررسی ورود. دوباره تلاش کن." };
    }
    return { success: false, error: "رمز عبور نادرست است." };
  }

  try {
    await clearFailures();
  } catch (err) {
    console.error("login failure counter reset failed:", err);
    return { success: false, error: "خطای موقت در ورود. دوباره تلاش کن." };
  }

  try {
    const token = await createSession();
    await setSessionCookie(token);
  } catch (err) {
    console.error("loginAdmin failed:", err);
    return { success: false, error: "خطا در ورود. دوباره تلاش کن." };
  }

  redirect("/menu");
}