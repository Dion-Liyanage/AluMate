/**
 * Stock lengths a profile can be bought in.
 *
 * Every profile has a full bar length (e.g. 21 ft). Some suppliers also sell
 * shorter pieces cut from that bar (e.g. 7 ft and 14 ft from a 21 ft sliding
 * window bar), so the workshop doesn't have to buy a whole bar for a small job.
 */

/** All purchasable lengths in feet, shortest first, always ending with the full bar. */
export function stockLengthsFt(barLengthFt: number, shorterLengthsFt: number[] = []): number[] {
  const shorter = shorterLengthsFt.filter((length) => length > 0 && length < barLengthFt);
  return [...new Set([...shorter, barLengthFt])].sort((a, b) => a - b);
}

/** Error message if any shorter length is not shorter than the full bar, otherwise null. */
export function validateShorterLengths(barLengthFt: number, shorterLengthsFt: number[] = []): string | null {
  const invalid = shorterLengthsFt.filter((length) => !(length > 0 && length < barLengthFt));
  return invalid.length
    ? `Shorter stock lengths must be between 0 and the ${barLengthFt} ft bar length (got ${invalid.join(', ')} ft)`
    : null;
}
