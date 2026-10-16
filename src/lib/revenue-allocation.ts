/**
 * Allocate a payable order total to its lines in proportion to their gross
 * amounts. Largest-remainder rounding guarantees that allocated line revenue
 * adds up exactly to the order's payable total.
 */
export function allocateNetLineAmounts(
  lines: readonly { gross: number }[],
  payableTotal: number
): number[] {
  if (lines.length === 0) return [];
  if (!Number.isSafeInteger(payableTotal) || payableTotal <= 0) {
    return lines.map(() => 0);
  }

  const grossTotal = lines.reduce((sum, line) => sum + line.gross, 0);
  if (
    !Number.isSafeInteger(grossTotal) ||
    grossTotal <= 0 ||
    lines.some((line) => !Number.isSafeInteger(line.gross) || line.gross < 0)
  ) {
    throw new RangeError("Line gross amounts must be non-negative safe integers.");
  }

  const exactShares = lines.map((line) => (payableTotal * line.gross) / grossTotal);
  const allocated = exactShares.map(Math.floor);
  let remainder = payableTotal - allocated.reduce((sum, amount) => sum + amount, 0);

  const order = exactShares
    .map((exact, index) => ({ index, fraction: exact - allocated[index] }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);

  for (let i = 0; i < remainder; i++) {
    allocated[order[i % order.length].index] += 1;
  }

  return allocated;
}
