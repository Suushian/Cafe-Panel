export const DISCOUNT_TYPES = ["none", "percent", "amount"] as const;

export type DiscountType = (typeof DISCOUNT_TYPES)[number];

export const DISCOUNT_LABELS: Record<DiscountType, string> = {
  none: "بدون تخفیف",
  percent: "درصدی",
  amount: "مبلغی",
};

export function isDiscountType(value: string): value is DiscountType {
  return (DISCOUNT_TYPES as readonly string[]).includes(value);
}

/**
 * Compute the discount amount in tomans from a value and type.
 * Clamps to [0, subtotal].
 */
export function computeDiscountAmount(
  subtotal: number,
  type: DiscountType,
  value: number
): number {
  if (!Number.isSafeInteger(subtotal) || subtotal <= 0) return 0;
  if (type === "none") return 0;
  if (!Number.isFinite(value) || value <= 0) return 0;

  if (type === "percent") {
    return Math.min(subtotal, Math.round((subtotal * Math.min(value, 100)) / 100));
  }

  // Fixed-amount discounts cannot exceed the order subtotal.
  return Math.min(Math.round(value), subtotal);
}

export function computeOrderNetTotal(
  totalPrice: number,
  discountAmount: number
): number {
  if (!Number.isFinite(totalPrice) || totalPrice <= 0) return 0;

  const gross = Math.round(totalPrice);
  const discount = Number.isFinite(discountAmount)
    ? Math.min(gross, Math.max(0, Math.round(discountAmount)))
    : 0;

  return gross - discount;
}