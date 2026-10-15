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
import { logger } from "@/lib/logging";
import { recordBusinessAudit } from "@/lib/logging/business-audit";

const INITIAL_ADMIN_ID = "initial-admin";

export async function setupAdmin(formData: FormData): Promise<ActionResult> {
  const exists = await adminExists();
  if (exists) {
    logger.warn("auth.setup.rejected", "Initial administrator setup rejected because an administrator already exists");
    await recordBusinessAudit({
      event: "auth.setup.rejected",
      action: "setup",
      entityType: "Admin",
      result: "failure",
      metadata: { reason: "already_initialized" },
    });
    return { success: false, error: "مدیر قبلاً راه‌اندازی شده است." };
  }

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!password) return { success: false, error: "رمز عبور الزامی است." };
  if (password.length < 6) return { success: false, error: "رمز عبور باید حداقل ۶ کاراکتر باشد." };
  if (password.length > 100) return { success: false, error: "رمز عبور بیش از حد بلند است." };
  if (password !== confirm) return { success: false, error: "رمز عبور و تکرار آن یکسان نیستند." };

  try {
    const passwordHash = await hashPassword(password);
    await prisma.admin.create({ data: { id: INITIAL_ADMIN_ID, passwordHash } });
    const token = await createSession();
    await setSessionCookie(token);
  } catch (error) {
    logger.error("auth.setup.failed", "Initial administrator setup failed", error);
    if (await adminExists().catch(() => false)) {
      await recordBusinessAudit({
        event: "auth.setup.rejected",
        action: "setup",
        entityType: "Admin",
        result: "failure",
        metadata: { reason: "concurrent_initialization" },
      });
      return { success: false, error: "مدیر قبلاً راه‌اندازی شده است." };
    }
    await recordBusinessAudit({
      event: "auth.setup.failed",
      action: "setup",
      entityType: "Admin",
      result: "failure",
      metadata: { reason: "setup_error" },
    });
    return { success: false, error: "خطا در راه‌اندازی. دوباره تلاش کن." };
  }

  await recordBusinessAudit({
    event: "auth.setup.succeeded",
    action: "setup",
    entityType: "Admin",
    entityId: INITIAL_ADMIN_ID,
    actorId: INITIAL_ADMIN_ID,
    result: "success",
  });
  logger.info("auth.setup.succeeded", "Initial administrator setup succeeded", { actorId: INITIAL_ADMIN_ID });
  redirect("/menu");
}
