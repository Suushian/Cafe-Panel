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

/* Simple in-memory rate limit */
type Attempt = { count: number; blockedUntil: number | null };
const attempts = new Map<string, Attempt>();
const MAX_ATTEMPTS = 5;
const BLOCK_MS = 60 * 1000; // 1 minute

function checkRateLimit(key: string): { ok: true } | { ok: false; retryInSec: number } {
  const now = Date.now();
  const a = attempts.get(key);
  if (!a) return { ok: true };
  if (a.blockedUntil && a.blockedUntil > now) {
    return { ok: false, retryInSec: Math.ceil((a.blockedUntil - now) / 1000) };
  }
  return { ok: true };
}

function recordFailure(key: string) {
  const now = Date.now();
  const a = attempts.get(key) ?? { count: 0, blockedUntil: null };
  a.count += 1;
  if (a.count >= MAX_ATTEMPTS) {
    a.blockedUntil = now + BLOCK_MS;
    a.count = 0;
  }
  attempts.set(key, a);
}

function clearFailures(key: string) {
  attempts.delete(key);
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

  const key = "admin";
  const rl = checkRateLimit(key);
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
    recordFailure(key);
    return { success: false, error: "رمز عبور نادرست است." };
  }

  clearFailures(key);

  try {
    const token = await createSession();
    await setSessionCookie(token);
  } catch (err) {
    console.error("loginAdmin failed:", err);
    return { success: false, error: "خطا در ورود. دوباره تلاش کن." };
  }

  redirect("/menu");
}