"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/categories";
import type { ActionResult } from "@/lib/types";

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
  if (!Number.isFinite(price) || price <= 0) {
    return { error: "قیمت باید یک عدد مثبت باشد." };
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
  const parsed = parseMenuItemForm(formData);
  if ("error" in parsed) return { success: false, error: parsed.error };

  try {
    await prisma.menuItem.create({ data: parsed.data });
    revalidatePath("/menu");
    return { success: true };
  } catch (err) {
    console.error("createMenuItem failed:", err);
    return { success: false, error: "خطا در ذخیره‌سازی. دوباره تلاش کن." };
  }
}

export async function updateMenuItem(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { success: false, error: "شناسه‌ی آیتم نامعتبر است." };

  const parsed = parseMenuItemForm(formData);
  if ("error" in parsed) return { success: false, error: parsed.error };

  try {
    await prisma.menuItem.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/menu");
    return { success: true };
  } catch (err) {
    console.error("updateMenuItem failed:", err);
    return { success: false, error: "خطا در به‌روزرسانی. دوباره تلاش کن." };
  }
}

export async function deleteMenuItem(id: string): Promise<ActionResult> {
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
    revalidatePath("/menu");
    return { success: true };
  } catch (err) {
    console.error("deleteMenuItem failed:", err);
    return { success: false, error: "خطا در حذف. دوباره تلاش کن." };
  }
}
