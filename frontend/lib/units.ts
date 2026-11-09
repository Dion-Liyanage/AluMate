/** Formats inches as feet-inches to the nearest 1/8", e.g. 62.5 → 5' 2½". */
export function formatFeetInches(totalInches: number): string {
  const eighths = Math.round(totalInches * 8);
  const feet = Math.floor(eighths / 96);
  const remainingEighths = eighths - feet * 96;
  const wholeInches = Math.floor(remainingEighths / 8);
  const fraction = remainingEighths % 8;
  const fractionLabel = ["", "⅛", "¼", "⅜", "½", "⅝", "¾", "⅞"][fraction];
  const inchesLabel = `${wholeInches}${fractionLabel}"`;
  if (feet === 0) return inchesLabel;
  return wholeInches === 0 && fraction === 0 ? `${feet}'` : `${feet}' ${inchesLabel}`;
}

export function formatLKR(amount: number): string {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatKg(kg: number): string {
  return `${(kg || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} kg`;
}
