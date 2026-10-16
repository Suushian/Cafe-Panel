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

/** Validate values accepted by the server for each discount type. */
export function isValidDiscountValue(type: DiscountType, value: number): boolean {
  if (type === "none") return true;
  if (!Number.isSafeInteger(value) || value < 0 || value > 1_000_000_000) return false;
  return type !== "percent" || value <= 100;
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
  if (type === "none") return 0;
  if (!Number.isFinite(value) || value <= 0) return 0;

  if (type === "percent") {
    if (value > 100) return subtotal;
    return Math.round((subtotal * value) / 100);
  }

  // amount
  return Math.min(Math.round(value), subtotal);
}