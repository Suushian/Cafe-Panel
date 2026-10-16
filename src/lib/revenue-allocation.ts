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
  if (!Number.isSafeInteger(payableTotal) || payableTotal < 0) {
    throw new RangeError("Payable total must be a non-negative safe integer.");
  }
  if (payableTotal === 0) return lines.map(() => 0);

  const grossTotal = lines.reduce((sum, line) => sum + line.gross, 0);
  if (
    !Number.isSafeInteger(grossTotal) ||
    grossTotal <= 0 ||
    lines.some((line) => !Number.isSafeInteger(line.gross) || line.gross < 0)
  ) {
    throw new RangeError("Line gross amounts must be non-negative safe integers.");
  }
  if (payableTotal > grossTotal) {
    throw new RangeError("Payable total cannot exceed the sum of line gross amounts.");
  }

  const denominator = BigInt(grossTotal);
  const shares = lines.map((line, index) => {
    const numerator = BigInt(payableTotal) * BigInt(line.gross);
    return {
      index,
      amount: Number(numerator / denominator),
      remainder: numerator % denominator,
    };
  });
  const allocated = shares.map((share) => share.amount);
  let remainder = payableTotal - allocated.reduce((sum, amount) => sum + amount, 0);

  const order = [...shares].sort(
    (a, b) => (a.remainder === b.remainder ? a.index - b.index : a.remainder > b.remainder ? -1 : 1)
  );
  for (let i = 0; i < remainder; i++) {
    allocated[order[i].index] += 1;
  }

  return allocated;
}
