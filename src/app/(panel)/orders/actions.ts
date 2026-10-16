"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import type { ActionResult } from "@/lib/types";
import { isOrderStatus, type OrderStatus } from "@/lib/order-status";
import { isOrderType } from "@/lib/order-type";
import { isDiscountType, computeDiscountAmount } from "@/lib/discount";
import { recordBusinessAudit } from "@/lib/logging/business-audit";
import { logger } from "@/lib/logging";

type CartLine = {
  menuItemId: string;
  quantity: number;
};

function parseCart(raw: string): CartLine[] | { error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "سبد خرید نامعتبر است." };
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { error: "سبد خرید خالی است." };
  }

  const lines: CartLine[] = [];
  for (const entry of parsed) {
    if (typeof entry !== "object" || entry === null) {
      return { error: "سبد خرید نامعتبر است." };
    }
    const e = entry as Record<string, unknown>;
    const menuItemId = String(e.menuItemId ?? "").trim();
    const quantity = Number(e.quantity);

    if (!menuItemId) return { error: "شناسه‌ی آیتم نامعتبر است." };
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 100) {
      return { error: "تعداد نامعتبر است." };
    }

    lines.push({ menuItemId, quantity });
  }

  return lines;
}

/* ---------- Parse common fields ---------- */

type OrderInput = {
  cart: CartLine[];
  orderType: string;
  discountType: string;
  discountValue: number;
  customerId: string | null;
};

type ParseOrderResult = { error: string } | { data: OrderInput };

function parseOrderForm(formData: FormData): ParseOrderResult {
  const rawCart = String(formData.get("cart") ?? "");
  if (!rawCart) return { error: "سبد خرید خالی است." };

  const orderTypeRaw = String(formData.get("orderType") ?? "dine_in").trim();
  if (!isOrderType(orderTypeRaw)) {
    return { error: "نوع سفارش نامعتبر است." };
  }

  const discountTypeRaw = String(formData.get("discountType") ?? "none").trim();
  if (!isDiscountType(discountTypeRaw)) {
    return { error: "نوع تخفیف نامعتبر است." };
  }

  const discountValueRaw = Number(formData.get("discountValue") ?? 0);
  if (
    discountTypeRaw !== "none" &&
    (!Number.isSafeInteger(discountValueRaw) ||
      discountValueRaw < 0 ||
      discountValueRaw > 1_000_000_000)
  ) {
    return { error: "مقدار تخفیف نامعتبر است." };
  }

  const customerIdRaw = String(formData.get("customerId") ?? "").trim();
  const customerId = customerIdRaw || null;

  const parsedCart = parseCart(rawCart);
  if ("error" in parsedCart) return { error: parsedCart.error };

  return {
    data: {
      cart: parsedCart,
      orderType: orderTypeRaw,
      discountType: discountTypeRaw,
      discountValue:
        discountTypeRaw === "none" ? 0 : discountValueRaw,
      customerId,
    },
  };
}

/* ---------- Resolve menu items + compute totals ---------- */

type ResolvedLine = {
  menuItemId: string;
  quantity: number;
  unitPrice: number;
};

type ResolvedOrder = {
  lines: ResolvedLine[];
  totalPrice: number;
  discountAmount: number;
};

async function resolveOrder(input: OrderInput): Promise<
  { error: string } | { data: ResolvedOrder }
> {
  // Validate customer (if provided)
  if (input.customerId) {
    const customer = await prisma.customer.findUnique({
      where: { id: input.customerId },
      select: { id: true },
    });
    if (!customer) return { error: "مشتری انتخاب‌شده معتبر نیست." };
  }

  const ids = input.cart.map((l) => l.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: ids } },
  });

  if (menuItems.length !== ids.length) {
    return { error: "برخی آیتم‌ها یافت نشدند." };
  }

  const map = new Map(menuItems.map((m) => [m.id, m]));

  for (const line of input.cart) {
    const item = map.get(line.menuItemId);
    if (!item) return { error: "آیتم یافت نشد." };
    if (!item.isAvailable) {
      return { error: `آیتم «${item.name}» موجود نیست.` };
    }
  }

  const lines: ResolvedLine[] = input.cart.map((line) => {
    const item = map.get(line.menuItemId)!;
    return {
      menuItemId: item.id,
      quantity: line.quantity,
      unitPrice: item.price,
    };
  });

  const totalPrice = lines.reduce(
    (sum, l) => sum + l.unitPrice * l.quantity,
    0
  );

  // Prisma Int fields are signed 32-bit integers. Reject an oversized subtotal
  // before it reaches the database, where it would otherwise fail generically.
  if (!Number.isSafeInteger(totalPrice) || totalPrice > 2_147_483_647) {
    return { error: "مجموع سفارش از محدوده مجاز بیشتر است." };
  }

  const discountAmount = computeDiscountAmount(
    totalPrice,
    input.discountType as "none" | "percent" | "amount",
    input.discountValue
  );

  return { data: { lines, totalPrice, discountAmount } };
}

/* ---------- createOrder ---------- */

export async function createOrder(formData: FormData): Promise<ActionResult> {
  if (!(await verifySession())) return { success: false, error: "نشست معتبر نیست. دوباره وارد شو." };
  const parsed = parseOrderForm(formData);
  if ("error" in parsed) return { success: false, error: parsed.error };

  const resolved = await resolveOrder(parsed.data);
  if ("error" in resolved) return { success: false, error: resolved.error };

  try {
    const createdOrder = await prisma.order.create({
      data: {
        totalPrice: resolved.data.totalPrice,
        status: "open",
        orderType: parsed.data.orderType,
        discountType: parsed.data.discountType,
        discountValue: parsed.data.discountValue,
        discountAmount: resolved.data.discountAmount,
        customerId: parsed.data.customerId,
        items: {
          create: resolved.data.lines,
        },
      },
    });

    await recordBusinessAudit({ event: "order.created", action: "create", entityType: "Order", entityId: createdOrder.id, result: "success", changes: { totalPrice: createdOrder.totalPrice, status: createdOrder.status, orderType: createdOrder.orderType, discountAmount: createdOrder.discountAmount, itemCount: resolved.data.lines.length } });
    revalidatePath("/orders");
    if (parsed.data.customerId) revalidatePath("/customers");
    return { success: true };
  } catch (err) {
    logger.error("business.action.failed", "createOrder failed", err, { action: "createOrder" });
    return { success: false, error: "خطا در ثبت سفارش. دوباره تلاش کن." };
  }
}

/* ---------- updateOrder ---------- */

export async function updateOrder(formData: FormData): Promise<ActionResult> {
  if (!(await verifySession())) return { success: false, error: "نشست معتبر نیست. دوباره وارد شو." };
  const orderId = String(formData.get("orderId") ?? "").trim();
  if (!orderId) {
    return { success: false, error: "شناسه‌ی سفارش نامعتبر است." };
  }

  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true },
  });
  if (!existing) {
    return { success: false, error: "سفارش یافت نشد." };
  }
  if (existing.status !== "open") {
    return {
      success: false,
      error: "فقط سفارش‌های باز قابل ویرایش هستند.",
    };
  }

  const parsed = parseOrderForm(formData);
  if ("error" in parsed) return { success: false, error: parsed.error };

  const resolved = await resolveOrder(parsed.data);
  if ("error" in resolved) return { success: false, error: resolved.error };

  try {
    await prisma.$transaction(async (tx) => {
      // Replace all items
      await tx.orderItem.deleteMany({ where: { orderId } });

      await tx.order.update({
        where: { id: orderId },
        data: {
          totalPrice: resolved.data.totalPrice,
          orderType: parsed.data.orderType,
          discountType: parsed.data.discountType,
          discountValue: parsed.data.discountValue,
          discountAmount: resolved.data.discountAmount,
          customerId: parsed.data.customerId,
          items: {
            create: resolved.data.lines,
          },
        },
      });
    });

    await recordBusinessAudit({ event: "order.updated", action: "update", entityType: "Order", entityId: orderId, result: "success", changes: { totalPrice: resolved.data.totalPrice, orderType: parsed.data.orderType, discountAmount: resolved.data.discountAmount, itemCount: resolved.data.lines.length } });
    revalidatePath("/orders");
    revalidatePath("/customers");
    return { success: true };
  } catch (err) {
    logger.error("business.action.failed", "updateOrder failed", err, { action: "updateOrder" });
    return { success: false, error: "خطا در ویرایش سفارش. دوباره تلاش کن." };
  }
}

/* ---------- updateOrderStatus ---------- */

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<ActionResult> {
  if (!(await verifySession())) return { success: false, error: "نشست معتبر نیست. دوباره وارد شو." };
  if (!orderId) return { success: false, error: "شناسه‌ی سفارش نامعتبر است." };
  if (!isOrderStatus(status)) {
    return { success: false, error: "وضعیت نامعتبر است." };
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
    await recordBusinessAudit({ event: "order.status.updated", action: "update_status", entityType: "Order", entityId: updatedOrder.id, result: "success", changes: { status: updatedOrder.status } });
    revalidatePath("/orders");
    return { success: true };
  } catch (err) {
    logger.error("business.action.failed", "updateOrderStatus failed", err, { action: "updateOrderStatus" });
    return { success: false, error: "خطا در تغییر وضعیت. دوباره تلاش کن." };
  }
}