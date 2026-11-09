/**
 * Pricing rules for the AI assistant.
 *
 * The chat never shows the exact figure from the pricing engine — that belongs in the
 * formal quotation, after measurement and cutting-plan optimisation. Instead it shows:
 *   - an indicative RANGE when the customer has given every detail, or
 *   - a "STARTING FROM" price for a small standard unit when only the product is known.
 */

/** How far below / above the engine's figure the indicative range goes. */
export const RANGE_BELOW_PCT = 10;
export const RANGE_ABOVE_PCT = 20;

/** Small "standard" sizes used for starting-from prices (feet). */
export const REFERENCE_SIZES: Record<string, { widthFt: number; heightFt: number }[]> = {
  window: [
    { widthFt: 3, heightFt: 3 },
    { widthFt: 4, heightFt: 4 },
  ],
  door: [
    { widthFt: 3, heightFt: 7 },
    { widthFt: 4, heightFt: 7 },
  ],
};

/** Round to a "clean" step so the number reads as approximate. */
export function priceStep(amount: number) {
  if (amount < 20_000) return 500;
  if (amount < 100_000) return 1_000;
  return 5_000;
}

export function roundDown(amount: number) {
  const step = priceStep(amount);
  return Math.max(step, Math.floor(amount / step) * step);
}

export function roundUp(amount: number) {
  const step = priceStep(amount);
  return Math.ceil(amount / step) * step;
}

/** Turns an exact engine total into an indicative, rounded range. */
export function toPriceRange(total: number) {
  const low = roundDown(total * (1 - RANGE_BELOW_PCT / 100));
  const high = Math.max(low + priceStep(total), roundUp(total * (1 + RANGE_ABOVE_PCT / 100)));
  return { minRs: low, maxRs: high };
}

export const REQUIRED_RANGE_FIELDS = ['productType', 'systemType', 'widthFt', 'heightFt', 'panels', 'color'] as const;

/** Which details are still missing before a range can be given. */
export function missingRangeFields(args: Record<string, unknown>) {
  return REQUIRED_RANGE_FIELDS.filter((f) => {
    const v = args[f];
    if (f === 'widthFt' || f === 'heightFt' || f === 'panels') return !(Number(v) > 0);
    return typeof v !== 'string' || !v.trim();
  });
}
