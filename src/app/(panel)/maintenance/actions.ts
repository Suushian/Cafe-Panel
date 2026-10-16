"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { createManualBackup } from "@/lib/backup";
import type { ActionResult } from "@/lib/types";
import { logger } from "@/lib/logging";
import { recordBusinessAudit } from "@/lib/logging/business-audit";

const CONFIRM_WORD = "DELETE";

export type ResetFilters = {
  orders: boolean;
  customers: boolean;
  menuItems: boolean;
  sessions: boolean;
};

export type ResetResult =
  | {
      success: true;
      backupFilename: string;
      deleted: {
        orders: number;
        customers: number;
        menuItems: number;
        sessions: number;
      };
    }
  | { success: false; error: string };

export async function resetDatabase(
  filters: ResetFilters,
  confirmWord: string
): Promise<ResetResult> {
  if (!(await verifySession())) return { success: false, error: "نشست معتبر نیست. دوباره وارد شو." };
  if (confirmWord.trim() !== CONFIRM_WORD) {
    logger.warn("maintenance.reset.rejected", "Database reset rejected because confirmation phrase did not match");
    await recordBusinessAudit({
      event: "maintenance.reset.rejected",
      action: "reset",
      entityType: "Database",
      result: "failure",
      metadata: { reason: "confirmation_mismatch" },
    });
    return { success: false, error: "کلمه‌ی تأیید اشتباه است." };
  }

  const anythingSelected =
    filters.orders ||
    filters.customers ||
    filters.menuItems ||
    filters.sessions;

  if (!anythingSelected) {
    return { success: false, error: "حداقل یک بخش را انتخاب کن." };
  }

  let backup: Awaited<ReturnType<typeof createManualBackup>>;
  try {
    backup = await createManualBackup();
  } catch (error) {
    logger.error("maintenance.reset.backup.failed", "Automatic backup failed before database reset", error);
    await recordBusinessAudit({
      event: "maintenance.reset.failed",
      action: "reset",
      entityType: "Database",
      result: "failure",
      metadata: { reason: "backup_failed" },
    });
    return { success: false, error: "ساخت نسخه‌ی پشتیبان ناموفق بود. عملیات متوقف شد." };
  }
  if (!backup) {
    logger.error("maintenance.reset.backup.failed", "Automatic backup returned no backup before database reset");
    await recordBusinessAudit({
      event: "maintenance.reset.failed",
      action: "reset",
      entityType: "Database",
      result: "failure",
      metadata: { reason: "backup_unavailable" },
    });
    return {
      success: false,
      error: "ساخت نسخه‌ی پشتیبان ناموفق بود. عملیات متوقف شد.",
    };
  }

  const deleted = {
    orders: 0,
    customers: 0,
    menuItems: 0,
    sessions: 0,
  };

  try {
    await prisma.$transaction(async (tx) => {
      if (filters.orders) {
        const r = await tx.order.deleteMany();
        deleted.orders = r.count;
      }

      if (filters.customers) {
        const r = await tx.customer.deleteMany();
        deleted.customers = r.count;
      }

      if (filters.menuItems) {
        const usedIds = await tx.orderItem.findMany({
          select: { menuItemId: true },
          distinct: ["menuItemId"],
        });
        const usedSet = new Set(usedIds.map((u) => u.menuItemId));
        const all = await tx.menuItem.findMany({ select: { id: true } });
        const deletable = all.filter((m) => !usedSet.has(m.id)).map((m) => m.id);

        if (deletable.length > 0) {
          const r = await tx.menuItem.deleteMany({ where: { id: { in: deletable } } });
          deleted.menuItems = r.count;
        }
      }

      if (filters.sessions) {
        const r = await tx.session.deleteMany();
        deleted.sessions = r.count;
      }
    });

    await recordBusinessAudit({
      event: "maintenance.reset.succeeded",
      action: "reset",
      entityType: "Database",
      result: "success",
      metadata: {
        selected: {
          orders: filters.orders,
          customers: filters.customers,
          menuItems: filters.menuItems,
          sessions: filters.sessions,
        },
        deleted,
        backupCreated: true,
      },
    });
    logger.warn("maintenance.reset.succeeded", "Database reset completed after automatic backup", {
      selected: filters,
      deleted,
    });

    revalidatePath("/orders");
    revalidatePath("/menu");
    revalidatePath("/customers");
    revalidatePath("/reports");

    return { success: true, backupFilename: backup.filename, deleted };
  } catch (error) {
    logger.error("maintenance.reset.failed", "Database reset transaction failed", error, { selected: filters });
    await recordBusinessAudit({
      event: "maintenance.reset.failed",
      action: "reset",
      entityType: "Database",
      result: "failure",
      metadata: { reason: "transaction_failed", selected: filters },
    });
    return {
      success: false,
      error: "خطا در اجرای عملیات. backup ساخته شد ولی حذف انجام نشد.",
    };
  }
}
