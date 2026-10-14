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

/* Persistent rate limit stored in SQLite so restarts do not reset failed attempts. */
const RATE_LIMIT_ID = "admin";
const MAX_ATTEMPTS = 5;
const BLOCK_MS = 60 * 1000;

async function checkRateLimit(): Promise<{ ok: true } | { ok: false; retryInSec: number }> {
  const attempt = await prisma.loginRateLimit.findUnique({ where: { id: RATE_LIMIT_ID } });
  if (!attempt?.blockedUntil) return { ok: true };
  const remaining = attempt.blockedUntil.getTime() - Date.now();
  if (remaining > 0) return { ok: false, retryInSec: Math.ceil(remaining / 1000) };
  await prisma.loginRateLimit.update({
    where: { id: RATE_LIMIT_ID },
    data: { count: 0, blockedUntil: null },
  });
  return { ok: true };
}

async function recordFailure(): Promise<void> {
  const attempt = await prisma.loginRateLimit.upsert({
    where: { id: RATE_LIMIT_ID },
    create: { id: RATE_LIMIT_ID, count: 1 },
    update: { count: { increment: 1 } },
  });
  if (attempt.count >= MAX_ATTEMPTS) {
    await prisma.loginRateLimit.update({
      where: { id: RATE_LIMIT_ID },
      data: { count: 0, blockedUntil: new Date(Date.now() + BLOCK_MS) },
    });
  }
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