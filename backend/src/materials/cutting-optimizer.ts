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
  cuts: PlannedCut[];
  usedIn: number;
  kerfIn: number;
  leftoverIn: number;
  leftoverType: LeftoverType;
}

export interface ProfileCuttingPlan {
  profileCode: string;
  profileName: string;
  barLengthIn: number;
  bars: PlannedBar[];
  barsNeeded: number;
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
  cuts: PlannedCut[];
  remainingIn: number;
  usedIn: number;
  kerfIn: number;
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

    const target = best ?? { cuts: [], remainingIn: barLengthIn, usedIn: 0, kerfIn: 0 };
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
 * @param lines        BOM cut-list lines
 * @param barLengthFt  stock bar length for each profile code
 */
export function planCutting(
  lines: CutLineInput[],
  barLengthFt: Record<string, number>,
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
    const barLengthIn = (barLengthFt[profileCode] ?? 0) * 12;
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

    const packed = [...fullBars, ...packProfile(pieces, barLengthIn, settings)];

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
        cuts: bar.cuts,
        usedIn: round(bar.usedIn),
        kerfIn: round(bar.kerfIn),
        leftoverIn,
        leftoverType,
      };
    });

    profiles.push({
      profileCode,
      profileName: profileLines[0].profileName,
      barLengthIn,
      bars,
      barsNeeded: bars.length,
      pieces: pieces.length + fullBars.length,
      purchasedKg: round(bars.length * barLengthIn * kgPerIn),
      usedKg: round(usedIn * kgPerIn),
      reusableOffcutsKg: round(offcutIn * kgPerIn),
      scrapWasteKg: round(scrapIn * kgPerIn),
      purchaseCost: Math.round(((bars.length * barLengthIn) / 12) * pricePerFt),
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

/** Builds a cutting plan from a stored BOM snapshot (order.bomSnapshot). */
export function planCuttingFromBom(
  bom: { lines: CutLineInput[]; profiles: { profileCode: string; barLengthFt: number }[] },
  settings: CuttingSettings = DEFAULT_CUTTING_SETTINGS,
): CuttingPlan {
  const barLengths = Object.fromEntries(bom.profiles.map((p) => [p.profileCode, p.barLengthFt]));
  return planCutting(bom.lines, barLengths, settings);
}
