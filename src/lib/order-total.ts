/** SQLite-backed Prisma Int fields use the signed 32-bit integer range. */
export const MAX_ORDER_TOTAL = 2_147_483_647;

export function isValidOrderTotal(total: number): boolean {
  return Number.isSafeInteger(total) && total > 0 && total <= MAX_ORDER_TOTAL;
}
