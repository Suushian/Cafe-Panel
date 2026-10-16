"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { CATEGORIES } from "@/lib/categories";
import type { ActionResult } from "@/lib/types";
import { recordBusinessAudit } from "@/lib/logging/business-audit";
import { logger } from "@/lib/logging";

type MenuItemData = {
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
};

type ParseResult =
  | { error: string }
  | { data: MenuItemData };

function parseMenuItemForm(formData: FormData): ParseResult {
  const name = String(formData.get("name") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const isAvailable = formData.get("isAvailable") === "on";

  if (!name) return { error: "نام آیتم الزامی است." };
  if (name.length > 60) {
    return { error: "نام آیتم نباید بیشتر از ۶۰ کاراکتر باشد." };
  }

  const price = Number(priceRaw);
  if (!Number.isSafeInteger(price) || price <= 0) {
    return { error: "قیمت باید یک عدد صحیح مثبت باشد." };
  }
  if (price > 100_000_000) {
    return { error: "قیمت منطقی نیست." };
  }

  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    return { error: "دسته‌بندی نامعتبر است." };
  }

  return {
    data: {
      name,
      price: Math.round(price),
      category,
      isAvailable,
    },
  };
}

export async function createMenuItem(formData: FormData): Promise<ActionResult> {
  if (!(await verifySession())) return { success: false, error: "نشست معتبر نیست. دوباره وارد شو." };
  const parsed = parseMenuItemForm(formData);
  if ("error" in parsed) return { success: false, error: parsed.error };

  try {
    const created = await prisma.menuItem.create({ data: parsed.data });
    await recordBusinessAudit({ event: "menu_item.created", action: "create", entityType: "MenuItem", entityId: created.id, result: "success", changes: { name: created.name, price: created.price, category: created.category, isAvailable: created.isAvailable } });
    revalidatePath("/menu");
    return { success: true };
  } catch (err) {
    logger.error("business.action.failed", "createMenuItem failed", err, { action: "createMenuItem" });
    return { success: false, error: "خطا در ذخیره‌سازی. دوباره تلاش کن." };
  }
}

export async function updateMenuItem(formData: FormData): Promise<ActionResult> {
  if (!(await verifySession())) return { success: false, error: "نشست معتبر نیست. دوباره وارد شو." };
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { success: false, error: "شناسه‌ی آیتم نامعتبر است." };

  const parsed = parseMenuItemForm(formData);
  if ("error" in parsed) return { success: false, error: parsed.error };

  try {
    const updated = await prisma.menuItem.update({
      where: { id },
      data: parsed.data,
    });
    await recordBusinessAudit({ event: "menu_item.updated", action: "update", entityType: "MenuItem", entityId: updated.id, result: "success", changes: { name: updated.name, price: updated.price, category: updated.category, isAvailable: updated.isAvailable } });
    revalidatePath("/menu");
    return { success: true };
  } catch (err) {
    logger.error("business.action.failed", "updateMenuItem failed", err, { action: "updateMenuItem" });
    return { success: false, error: "خطا در به‌روزرسانی. دوباره تلاش کن." };
  }
}

export async function deleteMenuItem(id: string): Promise<ActionResult> {
  if (!(await verifySession())) return { success: false, error: "نشست معتبر نیست. دوباره وارد شو." };
  if (!id) return { success: false, error: "شناسه‌ی آیتم نامعتبر است." };

  try {
    const usageCount = await prisma.orderItem.count({
      where: { menuItemId: id },
    });

    if (usageCount > 0) {
      return {
        success: false,
        error: "این آیتم در سفارشات استفاده شده و قابل حذف نیست. می‌توانی «ناموجود» کنی.",
      };
    }

    await prisma.menuItem.delete({ where: { id } });
    await recordBusinessAudit({ event: "menu_item.deleted", action: "delete", entityType: "MenuItem", entityId: id, result: "success" });
    revalidatePath("/menu");
    return { success: true };
  } catch (err) {
    logger.error("business.action.failed", "deleteMenuItem failed", err, { action: "deleteMenuItem" });
    return { success: false, error: "خطا در حذف. دوباره تلاش کن." };
  }
}
