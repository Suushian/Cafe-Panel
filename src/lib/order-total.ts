/** SQLite-backed Prisma Int fields use the signed 32-bit integer range. */
export const MAX_ORDER_TOTAL = 2_147_483_647;

export function isValidOrderTotal(total: number): boolean {
  return Number.isSafeInteger(total) && total > 0 && total <= MAX_ORDER_TOTAL;
}

/** The payable amount must never be negative, even for legacy or malformed rows. */
export function getPayableAmount(totalPrice: number, discountAmount: number): number {
  return Math.max(0, totalPrice - discountAmount);
}
