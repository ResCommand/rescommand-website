/**
 * Parses the numeric portion of a pack-size string.
 * Examples: "50 lb case" → 50, "12 x 32 oz" → 12, "6/4# cs" → 6, "case" → null
 */
export function parsePackSize(packSize: string | null | undefined): number | null {
  if (!packSize) return null;
  // Try common patterns: leading number, "N x M" (take first), "N/M" (take first)
  const xMatch = packSize.match(/^(\d+)\s*x\s*\d+/i);
  if (xMatch) return parseInt(xMatch[1]);
  const slashMatch = packSize.match(/^(\d+)\/\d+/);
  if (slashMatch) return parseInt(slashMatch[1]);
  const leadingNumber = packSize.match(/^(\d+(?:\.\d+)?)/);
  if (leadingNumber) return parseFloat(leadingNumber[1]);
  return null;
}

/**
 * Rounds a quantity up to the nearest multiple of packSize.
 * Returns { qty, cases, rounded } where:
 *   - qty: the rounded quantity (or original if no packSize)
 *   - cases: number of cases/packs (or null)
 *   - rounded: boolean — whether rounding was applied
 */
export function roundToPackSize(
  toOrder: number,
  packSize: string | null | undefined,
): { qty: number; cases: number | null; rounded: boolean } {
  const pack = parsePackSize(packSize);
  if (!pack || pack <= 0 || toOrder <= 0) {
    return { qty: toOrder, cases: null, rounded: false };
  }
  const cases = Math.ceil(toOrder / pack);
  const rounded = cases * pack;
  return { qty: rounded, cases, rounded: rounded !== toOrder };
}
