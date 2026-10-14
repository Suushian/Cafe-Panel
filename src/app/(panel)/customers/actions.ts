"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types";

type CustomerData = {
  name: string;
  subscriptionCode: string;
  phone: string | null;
};

type ParseResult =
  | { error: string }
  | { data: CustomerData };

function parseCustomerForm(formData: FormData): ParseResult {
  const name = String(formData.get("name") ?? "").trim();
  const subscriptionCode = String(formData.get("subscriptionCode") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();

  if (!name) return { error: "نام مشتری الزامی است." };
  if (name.length > 60) {
    return { error: "نام مشتری نباید بیشتر از ۶۰ کاراکتر باشد." };
  }

  if (!subscriptionCode) return { error: "کد اشتراک الزامی است." };
  if (subscriptionCode.length > 30) {
    return { error: "کد اشتراک نباید بیشتر از ۳۰ کاراکتر باشد." };
  }
  // Allow letters, digits, dash, underscore only (safe for URLs, printing)
  if (!/^[A-Za-z0-9\-_]+$/.test(subscriptionCode)) {
    return {
      error: "کد اشتراک فقط می‌تواند شامل حروف انگلیسی، عدد، خط تیره و زیرخط باشد.",
    };
  }

  let phone: string | null = null;
  if (phoneRaw) {
    const digits = phoneRaw.replace(/[\s\-()]/g, "");
    if (!/^\d{10,15}$/.test(digits)) {
      return { error: "شماره تلفن باید ۱۰ تا ۱۵ رقم باشد." };
    }
    phone = digits;
  }

  return {
    data: { name, subscriptionCode, phone },
  };
}

export async function createCustomer(formData: FormData): Promise<ActionResult> {
  const parsed = parseCustomerForm(formData);
  if ("error" in parsed) return { success: false, error: parsed.error };

  try {
    const existing = await prisma.customer.findUnique({
      where: { subscriptionCode: parsed.data.subscriptionCode },
    });
    if (existing) {
      return { success: false, error: "این کد اشتراک قبلاً ثبت شده است." };
    }

    await prisma.customer.create({ data: parsed.data });
    revalidatePath("/customers");
    return { success: true };
  } catch (err) {
    console.error("createCustomer failed:", err);
    return { success: false, error: "خطا در ذخیره‌سازی. دوباره تلاش کن." };
  }
}

export async function updateCustomer(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { success: false, error: "شناسه‌ی مشتری نامعتبر است." };

  const parsed = parseCustomerForm(formData);
  if ("error" in parsed) return { success: false, error: parsed.error };

  try {
    const conflict = await prisma.customer.findFirst({
      where: {
        subscriptionCode: parsed.data.subscriptionCode,
        NOT: { id },
      },
    });
    if (conflict) {
      return { success: false, error: "این کد اشتراک قبلاً برای مشتری دیگری ثبت شده است." };
    }

    await prisma.customer.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/customers");
    revalidatePath("/orders");
    return { success: true };
  } catch (err) {
    console.error("updateCustomer failed:", err);
    return { success: false, error: "خطا در به‌روزرسانی. دوباره تلاش کن." };
  }
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  if (!id) return { success: false, error: "شناسه‌ی مشتری نامعتبر است." };

  try {
    // Count related orders (for information; SetNull lets delete proceed)
    const orderCount = await prisma.order.count({
      where: { customerId: id },
    });

    await prisma.customer.delete({ where: { id } });
    revalidatePath("/customers");
    revalidatePath("/orders");

    // Note: orders keep their data, just customerId becomes null
    return { success: true };
  } catch (err) {
    console.error("deleteCustomer failed:", err);
    return { success: false, error: "خطا در حذف. دوباره تلاش کن." };
  }
}