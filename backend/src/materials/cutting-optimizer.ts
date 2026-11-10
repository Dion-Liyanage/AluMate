/**
 * Cutting optimiser — plans how to cut an order's pieces from stock bars
 * with the least leftover (the 1-D "cutting stock" problem).
 *
 * Uses Best-Fit Decreasing: pieces are sorted longest first and each one goes
 * into the open bar that would be left with the smallest remainder. It is fast,
 * deterministic and typically within a few percent of the optimum.
 *
 * Pieces longer than a bar are split into full bars plus a remainder piece,
 * which must be joined on site (flagged as a warning).
 *
 * When a profile is also sold in shorter pieces (e.g. 7 ft and 14 ft cut from a
 * 21 ft bar), each packed bar is then downsized to the shortest stock length
 * that still holds its cuts, so small jobs don't pay for a whole bar.
 */
import { CuttingSettings, DEFAULT_CUTTING_SETTINGS } from './cutting.constants';

const EPSILON = 1e-6;

/** Minimal shape of a BOM cut-list line (see BomLineResult). */
export interface CutLineInput {
  component: string;
  profileCode: string;
  profileName: string;
  quantity: number;
  cutLengthIn: number;
  /** Total weight of all pieces on the line (kg). */
  weightKg: number;
  pricePerFt: number;
}

export type LeftoverType = 'offcut' | 'scrap' | 'none';

export interface PlannedCut {
  component: string;
  lengthIn: number;
  /** Part of a piece longer than one bar — needs a joint. */
  isJoint?: boolean;
}

export interface PlannedBar {
  index: number;
  /** Length of the stock piece bought for this bar (full bar or a shorter piece). */
  stockLengthIn: number;
  cuts: PlannedCut[];
  usedIn: number;
  kerfIn: number;
  leftoverIn: number;
  leftoverType: LeftoverType;
}

export interface StockPurchase {
  lengthIn: number;
  count: number;
}

export interface ProfileCuttingPlan {
  profileCode: string;
  profileName: string;
  /** Full bar length. */
  barLengthIn: number;
  /** Every length this profile can be bought in, shortest first (ends with the full bar). */
  stockLengthsIn: number[];
  bars: PlannedBar[];
  /** Stock pieces to buy, of any length. */
  barsNeeded: number;
  /** How many pieces of each stock length to buy, longest first. */
  stockToBuy: StockPurchase[];
  pieces: number;
  purchasedKg: number;
  usedKg: number;
  reusableOffcutsKg: number;
  scrapWasteKg: number;
  purchaseCost: number;
}

export interface CuttingPlan {
  settings: CuttingSettings;
  profiles: ProfileCuttingPlan[];
  totals: {
    bars: number;
    pieces: number;
    purchasedKg: number;
    usedKg: number;
    reusableOffcutsKg: number;
    scrapWasteKg: number;
    purchaseCost: number;
    /** Share of purchased aluminium that ends up in the product. */
    efficiencyPct: number;
    /** Share of purchased aluminium that becomes scrap. */
    wasteRatePct: number;
  };
  warnings: string[];
}

const round = (value: number, decimals = 3) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const pct = (part: number, whole: number) => (whole > 0 ? round((part / whole) * 100, 1) : 0);

interface OpenBar {
  stockLengthIn: number;
  cuts: PlannedCut[];
  remainingIn: number;
  usedIn: number;
  kerfIn: number;
}

/** Lays `cuts` along a stock piece in order; null if they don't fit. */
function layOut(cuts: PlannedCut[], stockLengthIn: number, settings: CuttingSettings): OpenBar | null {
  let remainingIn = stockLengthIn;
  let usedIn = 0;
  let kerfIn = 0;
  for (const cut of cuts) {
    if (remainingIn + EPSILON < cut.lengthIn) return null;
    // The saw cut only costs material if there is bar left after the piece.
    const kerf = Math.min(settings.kerfIn, Math.max(0, remainingIn - cut.lengthIn));
    usedIn += cut.lengthIn;
    kerfIn += kerf;
    remainingIn = Math.max(0, remainingIn - cut.lengthIn - kerf);
  }
  return { stockLengthIn, cuts, remainingIn, usedIn, kerfIn };
}

/** Moves a packed bar onto the shortest stock length that still holds all its cuts. */
function downsize(bar: OpenBar, stockLengthsIn: number[], settings: CuttingSettings): OpenBar {
  for (const length of stockLengthsIn) {
    if (length >= bar.stockLengthIn) break;
    const fitted = layOut(bar.cuts, length, settings);
    if (fitted) return fitted;
  }
  return bar;
}

function packProfile(
  pieces: PlannedCut[],
  barLengthIn: number,
  settings: CuttingSettings,
): OpenBar[] {
  const bars: OpenBar[] = [];
  const sorted = [...pieces].sort((a, b) => b.lengthIn - a.lengthIn);

  for (const piece of sorted) {
    // Best fit: the bar whose remainder after this cut would be smallest.
    let best: OpenBar | undefined;
    let bestRemainder = Infinity;
    for (const bar of bars) {
      if (bar.remainingIn + EPSILON < piece.lengthIn) continue;
      const remainder = bar.remainingIn - piece.lengthIn - settings.kerfIn;
      if (remainder < bestRemainder) {
        best = bar;
        bestRemainder = remainder;
      }
    }

    const target = best ?? { stockLengthIn: barLengthIn, cuts: [], remainingIn: barLengthIn, usedIn: 0, kerfIn: 0 };
    if (!best) bars.push(target);

    // The saw cut only costs material if there is bar left after the piece.
    const kerf = Math.min(settings.kerfIn, Math.max(0, target.remainingIn - piece.lengthIn));
    target.cuts.push(piece);
    target.usedIn += piece.lengthIn;
    target.kerfIn += kerf;
    target.remainingIn = Math.max(0, target.remainingIn - piece.lengthIn - kerf);
  }

  return bars;
}

/**
 * @param lines          BOM cut-list lines
 * @param stockLengthsFt for each profile code, the full bar length in feet, or every
 *                       purchasable length (the longest is taken as the full bar)
 */
export function planCutting(
  lines: CutLineInput[],
  stockLengthsFt: Record<string, number | number[]>,
  settings: CuttingSettings = DEFAULT_CUTTING_SETTINGS,
): CuttingPlan {
  const warnings: string[] = [];
  const byProfile = new Map<string, CutLineInput[]>();
  for (const line of lines) {
    if (line.quantity <= 0 || line.cutLengthIn <= 0) continue;
    byProfile.set(line.profileCode, [...(byProfile.get(line.profileCode) ?? []), line]);
  }

  const profiles: ProfileCuttingPlan[] = [];

  for (const [profileCode, profileLines] of byProfile) {
    const lengthsFt = ([] as number[]).concat(stockLengthsFt[profileCode] ?? []);
    const stockLengthsIn = [...new Set(lengthsFt.filter((ft) => ft > 0).map((ft) => ft * 12))].sort(
      (a, b) => a - b,
    );
    const barLengthIn = stockLengthsIn[stockLengthsIn.length - 1] ?? 0;
    if (barLengthIn <= 0) {
      warnings.push(`${profileCode}: unknown stock bar length — skipped in the cutting plan.`);
      continue;
    }

    const totalPieceLengthIn = profileLines.reduce((sum, l) => sum + l.quantity * l.cutLengthIn, 0);
    const totalWeightKg = profileLines.reduce((sum, l) => sum + l.weightKg, 0);
    const kgPerIn = totalPieceLengthIn > 0 ? totalWeightKg / totalPieceLengthIn : 0;
    const pricePerFt = profileLines[0].pricePerFt;

    const pieces: PlannedCut[] = [];
    const fullBars: OpenBar[] = [];
    for (const line of profileLines) {
      for (let i = 0; i < line.quantity; i++) {
        let remaining = line.cutLengthIn;
        if (remaining > barLengthIn + EPSILON) {
          warnings.push(
            `${line.component} (${profileCode}) is longer than one ${round(barLengthIn / 12, 2)}ft bar and needs a joint.`,
          );
          while (remaining > barLengthIn + EPSILON) {
            fullBars.push({
              stockLengthIn: barLengthIn,
              cuts: [{ component: line.component, lengthIn: barLengthIn, isJoint: true }],
              remainingIn: 0,
              usedIn: barLengthIn,
              kerfIn: 0,
            });
            remaining -= barLengthIn;
          }
          pieces.push({ component: line.component, lengthIn: round(remaining), isJoint: true });
        } else {
          pieces.push({ component: line.component, lengthIn: line.cutLengthIn });
        }
      }
    }

    const packed = [
      ...fullBars,
      ...packProfile(pieces, barLengthIn, settings).map((bar) => downsize(bar, stockLengthsIn, settings)),
    ];

    let usedIn = 0;
    let offcutIn = 0;
    let scrapIn = 0;
    const bars: PlannedBar[] = packed.map((bar, index) => {
      const leftoverIn = round(bar.remainingIn);
      const leftoverType: LeftoverType =
        leftoverIn <= EPSILON ? 'none' : leftoverIn >= settings.minReusableOffcutIn ? 'offcut' : 'scrap';
      usedIn += bar.usedIn;
      if (leftoverType === 'offcut') offcutIn += leftoverIn;
      else scrapIn += leftoverIn;
      scrapIn += bar.kerfIn; // saw dust is scrap too
      return {
        index: index + 1,
        stockLengthIn: bar.stockLengthIn,
        cuts: bar.cuts,
        usedIn: round(bar.usedIn),
        kerfIn: round(bar.kerfIn),
        leftoverIn,
        leftoverType,
      };
    });

    const purchasedIn = bars.reduce((sum, bar) => sum + bar.stockLengthIn, 0);
    const counts = new Map<number, number>();
    for (const bar of bars) counts.set(bar.stockLengthIn, (counts.get(bar.stockLengthIn) ?? 0) + 1);
    const stockToBuy = [...counts.entries()]
      .sort(([a], [b]) => b - a)
      .map(([lengthIn, count]) => ({ lengthIn, count }));

    profiles.push({
      profileCode,
      profileName: profileLines[0].profileName,
      barLengthIn,
      stockLengthsIn,
      bars,
      barsNeeded: bars.length,
      stockToBuy,
      pieces: pieces.length + fullBars.length,
      purchasedKg: round(purchasedIn * kgPerIn),
      usedKg: round(usedIn * kgPerIn),
      reusableOffcutsKg: round(offcutIn * kgPerIn),
      scrapWasteKg: round(scrapIn * kgPerIn),
      purchaseCost: Math.round((purchasedIn / 12) * pricePerFt),
    });
  }

  const sum = (key: keyof ProfileCuttingPlan) =>
    profiles.reduce((total, profile) => total + (profile[key] as number), 0);
  const purchasedKg = round(sum('purchasedKg'));
  const usedKg = round(sum('usedKg'));
  const scrapWasteKg = round(sum('scrapWasteKg'));

  return {
    settings,
    profiles,
    totals: {
      bars: sum('barsNeeded'),
      pieces: sum('pieces'),
      purchasedKg,
      usedKg,
      reusableOffcutsKg: round(sum('reusableOffcutsKg')),
      scrapWasteKg,
      purchaseCost: sum('purchaseCost'),
      efficiencyPct: pct(usedKg, purchasedKg),
      wasteRatePct: pct(scrapWasteKg, purchasedKg),
    },
    warnings: [...new Set(warnings)],
  };
}

/**
 * Builds a cutting plan from a stored BOM snapshot (order.bomSnapshot).
 * Snapshots saved before shorter stock lengths existed only have `barLengthFt`.
 */
export function planCuttingFromBom(
  bom: {
    lines: CutLineInput[];
    profiles: { profileCode: string; barLengthFt: number; stockLengthsFt?: number[] }[];
  },
  settings: CuttingSettings = DEFAULT_CUTTING_SETTINGS,
): CuttingPlan {
  const lengths = Object.fromEntries(
    bom.profiles.map((p) => [p.profileCode, p.stockLengthsFt?.length ? p.stockLengthsFt : p.barLengthFt]),
  );
  return planCutting(bom.lines, lengths, settings);
}
