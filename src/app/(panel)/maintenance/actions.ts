"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createManualBackup } from "@/lib/backup";
import type { ActionResult } from "@/lib/types";
import { verifySession } from "@/lib/auth";

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

  // Auto backup — always, before any destructive operation
  const backup = await createManualBackup();
  if (!backup) {
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
      // Order matters: OrderItems cascade with Orders.
      // If both orders and menuItems: orders first (removes OrderItems).

      if (filters.orders) {
        const r = await tx.order.deleteMany();
        deleted.orders = r.count;
      }

      if (filters.customers) {
        const r = await tx.customer.deleteMany();
        deleted.customers = r.count;
      }

      if (filters.menuItems) {
        // Only delete items NOT referenced by any OrderItem.
        // If orders were also deleted above, this will succeed for all.
        // If not, items used in existing orders are skipped to preserve data integrity.
        const usedIds = await tx.orderItem.findMany({
          select: { menuItemId: true },
          distinct: ["menuItemId"],
        });
        const usedSet = new Set(usedIds.map((u) => u.menuItemId));

        const all = await tx.menuItem.findMany({ select: { id: true } });
        const deletable = all
          .filter((m) => !usedSet.has(m.id))
          .map((m) => m.id);

        if (deletable.length > 0) {
          const r = await tx.menuItem.deleteMany({
            where: { id: { in: deletable } },
          });
          deleted.menuItems = r.count;
        }
      }

      if (filters.sessions) {
        const r = await tx.session.deleteMany();
        deleted.sessions = r.count;
      }
    });

    revalidatePath("/orders");
    revalidatePath("/menu");
    revalidatePath("/customers");
    revalidatePath("/reports");

    return {
      success: true,
      backupFilename: backup.filename,
      deleted,
    };
  } catch (err) {
    console.error("resetDatabase failed:", err);
    return {
      success: false,
      error: "خطا در اجرای عملیات. backup ساخته شد ولی حذف انجام نشد.",
    };
  }
}