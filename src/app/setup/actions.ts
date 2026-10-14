"use server";

import { redirect } from "next/navigation";
import {
  adminExists,
  hashPassword,
  createSession,
  setSessionCookie,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types";

const INITIAL_ADMIN_ID = "initial-admin";

export async function setupAdmin(formData: FormData): Promise<ActionResult> {
  const exists = await adminExists();
  if (exists) {
    return { success: false, error: "مدیر قبلاً راه‌اندازی شده است." };
  }

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!password) {
    return { success: false, error: "رمز عبور الزامی است." };
  }
  if (password.length < 6) {
    return { success: false, error: "رمز عبور باید حداقل ۶ کاراکتر باشد." };
  }
  if (password.length > 100) {
    return { success: false, error: "رمز عبور بیش از حد بلند است." };
  }
  if (password !== confirm) {
    return { success: false, error: "رمز عبور و تکرار آن یکسان نیستند." };
  }

  try {
    const passwordHash = await hashPassword(password);

    // A stable primary key makes concurrent first-run requests race safely:
    // SQLite can persist only one row with this id.
    await prisma.admin.create({
      data: { id: INITIAL_ADMIN_ID, passwordHash },
    });

    const token = await createSession();
    await setSessionCookie(token);
  } catch (err) {
    console.error("setupAdmin failed:", err);
    // A competing setup request may have created the singleton admin first.
    if (await adminExists().catch(() => false)) {
      return { success: false, error: "مدیر قبلاً راه‌اندازی شده است." };
    }
    return { success: false, error: "خطا در راه‌اندازی. دوباره تلاش کن." };
  }

  redirect("/menu");
}
