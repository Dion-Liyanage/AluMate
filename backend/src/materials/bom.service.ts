import { BadRequestException, Injectable } from '@nestjs/common';
import { evaluateFormula, FormulaError, FormulaScope } from './formula.util';
import { planCutting } from './cutting-optimizer';
import { stockLengthsFt } from './stock-lengths';
import type { Profile } from './schemas/profile.schema';
import type { ProductTemplate, SizeBand } from './schemas/product-template.schema';

const INCHES_PER_METRE = 39.3701;
const WOOD_FINISH_SURCHARGE = 0.3;

export interface BomInput {
  measurements: Record<string, string | number>;
  panels?: number;
  verticalBars?: number;
  horizontalBars?: number;
  color?: string;
}

export interface BomLineResult {
  component: string;
  profileCode: string;
  profileName: string;
  series: string;
  thicknessMm: number;
  cutAngle: number;
  quantity: number;
  cutLengthIn: number;
  totalLengthFt: number;
  weightKg: number;
  pricePerFt: number;
  cost: number;
}

export interface BomProfileSummary {
  profileCode: string;
  profileName: string;
  thicknessMm: number;
  /** Full stock bar length. */
  barLengthFt: number;
  /** Every length the profile can be bought in, shortest first (ends with the full bar). */
  stockLengthsFt: number[];
  totalLengthFt: number;
  weightKg: number;
  cost: number;
  /** Full bars needed if every bar were used perfectly (theoretical lower bound). */
  minimumBars: number;
  /** Stock pieces to purchase according to the cutting optimiser (includes saw-cut allowance). */
  barsNeeded: number;
  /** Stock pieces to purchase by length, longest first. */
  stockToBuy: { lengthFt: number; count: number }[];
  longestCutIn: number;
}

export interface BomResult {
  templateId?: string;
  productType: string;
  systemType: string;
  templateName: string;
  sizeBand: string;
  inputs: {
    widthIn: number;
    heightIn: number;
    panels: number;
    verticalBars: number;
    horizontalBars: number;
    billableAreaSqFt: number;
    color?: string;
  };
  lines: BomLineResult[];
  profiles: BomProfileSummary[];
  totals: {
    totalLengthFt: number;
    aluminiumWeightKg: number;
    /** Stock bars to purchase, from the cutting optimiser. */
    barsNeeded: number;
    /** Planned scrap as % of purchased aluminium. */
    plannedWasteRatePct: number;
    profileCost: number;
    glassCost: number;
    hardwareCost: number;
    laborCost: number;
    finishSurcharge: number;
    materialCost: number;
    total: number;
  };
  laborRatePerSqFt: number;
  explanation: string[];
  warnings: string[];
  generatedAt: string;
}

type TemplateLike = Pick<
  ProductTemplate,
  'productType' | 'systemType' | 'name' | 'minPanels' | 'maxPanels' | 'defaultPanels' | 'sizeBands'
> & { _id?: unknown };

const round = (value: number, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

/** Parses 5'2", 5', 62", "5" (feet) or 5 (feet) into inches. */
export function parseDimensionToInches(value: string | number | undefined): number {
  if (value === undefined || value === null || value === '') return 0;
  if (typeof value === 'number') return value * 12;

  const text = String(value).trim();
  const feet = /(\d+(?:\.\d+)?)\s*'/.exec(text);
  const inches = /(\d+(?:\.\d+)?)\s*"/.exec(text);
  if (feet || inches) {
    return (feet ? Number(feet[1]) * 12 : 0) + (inches ? Number(inches[1]) : 0);
  }
  const plain = Number(text);
  return Number.isFinite(plain) ? plain * 12 : 0;
}

export function formatFeetInches(totalInches: number): string {
  const rounded = Math.round(totalInches * 8) / 8; // nearest 1/8"
  const feet = Math.floor(rounded / 12);
  const inches = round(rounded - feet * 12, 3);
  return feet > 0 ? `${feet}' ${inches}"` : `${inches}"`;
}

@Injectable()
export class BomService {
  generate(template: TemplateLike, input: BomInput, profilesByCode: Map<string, Profile>): BomResult {
    const widthIn = parseDimensionToInches(input.measurements?.width);
    const heightIn = parseDimensionToInches(input.measurements?.height);
    if (widthIn <= 0 || heightIn <= 0) {
      throw new BadRequestException('Width and height are required to calculate materials');
    }

    const requestedPanels = Number(input.panels ?? input.measurements?.panelCount ?? template.defaultPanels);
    const panels = Math.round(requestedPanels);
    if (!Number.isFinite(panels) || panels < template.minPanels || panels > template.maxPanels) {
      throw new BadRequestException(
        template.minPanels === template.maxPanels
          ? `${template.name} uses ${template.minPanels} panel`
          : `${template.name} supports ${template.minPanels}–${template.maxPanels} panels`,
      );
    }

    const verticalBars = Math.max(0, Math.round(input.verticalBars ?? 0));
    const horizontalBars = Math.max(0, Math.round(input.horizontalBars ?? 0));

    const widthFt = widthIn / 12;
    const heightFt = heightIn / 12;
    const exactAreaSqFt = widthFt * heightFt;
    const panelWidthFt = widthFt / panels;

    const bandIndex = template.sizeBands.findIndex((band) =>
      this.bandFits(band, widthFt, heightFt, exactAreaSqFt, panelWidthFt),
    );
    if (bandIndex === -1) {
      throw new BadRequestException(
        `${round(widthFt, 1)}ft × ${round(heightFt, 1)}ft is larger than any standard ${template.name.toLowerCase()} configuration. Please contact us for a custom-engineered quotation.`,
      );
    }
    const band = template.sizeBands[bandIndex];

    const scope: FormulaScope = { W: widthIn, H: heightIn, P: panels, MV: verticalBars, TR: horizontalBars };
    const lineResults: BomLineResult[] = [];
    const warnings: string[] = [];

    for (const line of band.lines) {
      const quantity = Math.round(this.evaluate(line.quantityFormula, scope, line.component, 'quantity'));
      if (quantity < 0) {
        throw new BadRequestException(`"${line.component}" quantity is negative for this size`);
      }
      if (quantity === 0) continue;

      const cutLengthIn = round(this.evaluate(line.lengthFormula, scope, line.component, 'length'), 3);
      if (cutLengthIn <= 0) {
        throw new BadRequestException(`"${line.component}" cut length is not positive for this size`);
      }

      const profile = profilesByCode.get(line.profileCode);
      if (!profile || !profile.isActive) {
        throw new BadRequestException(
          `Profile ${line.profileCode} used by "${line.component}" is missing or inactive`,
        );
      }

      if (cutLengthIn > profile.barLengthFt * 12) {
        warnings.push(
          `${line.component}: ${formatFeetInches(cutLengthIn)} cut is longer than the ${profile.barLengthFt}ft ${profile.code} bar — requires a joint or a longer bar.`,
        );
      }

      const totalLengthIn = quantity * cutLengthIn;
      lineResults.push({
        component: line.component,
        profileCode: profile.code,
        profileName: profile.name,
        series: profile.series,
        thicknessMm: profile.thicknessMm,
        cutAngle: line.cutAngle,
        quantity,
        cutLengthIn,
        totalLengthFt: round(totalLengthIn / 12),
        weightKg: round((totalLengthIn / INCHES_PER_METRE) * profile.weightKgPerM, 3),
        pricePerFt: profile.pricePerFt,
        cost: Math.round((totalLengthIn / 12) * profile.pricePerFt),
      });
    }

    const profiles = this.summariseByProfile(lineResults, profilesByCode);
    const cuttingPlan = planCutting(
      lineResults,
      Object.fromEntries(profiles.map((profile) => [profile.profileCode, profile.stockLengthsFt])),
    );
    for (const profile of profiles) {
      const plan = cuttingPlan.profiles.find((p) => p.profileCode === profile.profileCode);
      profile.barsNeeded = plan?.barsNeeded ?? profile.minimumBars;
      profile.stockToBuy = plan
        ? plan.stockToBuy.map(({ lengthIn, count }) => ({ lengthFt: round(lengthIn / 12), count }))
        : [{ lengthFt: profile.barLengthFt, count: profile.minimumBars }];
    }

    // Billing follows the existing shop convention: inches round up to the next foot.
    const billableAreaSqFt = Math.ceil(widthFt) * Math.ceil(heightFt);
    const profileCost = lineResults.reduce((sum, line) => sum + line.cost, 0);
    const glassCost = Math.round(billableAreaSqFt * band.glassRatePerSqFt);
    const hardwareCost = Math.round(panels * band.hardwareCostPerPanel);
    const laborCost = Math.round(billableAreaSqFt * band.laborRatePerSqFt);
    const subtotal = profileCost + glassCost + hardwareCost + laborCost;
    const finishSurcharge = input.color === 'wood-finish' ? Math.round(subtotal * WOOD_FINISH_SURCHARGE) : 0;

    const explanation = [
      `${template.name}: ${formatFeetInches(widthIn)} wide × ${formatFeetInches(heightIn)} high, ${panels} panel${panels > 1 ? 's' : ''}`,
      `Size band "${band.name}" selected${bandIndex > 0 ? ' — the opening is too large for lighter profiles' : ''}`,
      `${lineResults.reduce((sum, line) => sum + line.quantity, 0)} aluminium pieces, ${round(
        lineResults.reduce((sum, line) => sum + line.weightKg, 0),
        2,
      )} kg of profile`,
    ];
    if (verticalBars || horizontalBars) {
      explanation.push(
        `Includes ${verticalBars} vertical and ${horizontalBars} horizontal bar${horizontalBars === 1 ? '' : 's'} from your design`,
      );
    }
    if (finishSurcharge) explanation.push('Wood finish selected — 30% surcharge applied');

    return {
      templateId: template._id ? String(template._id) : undefined,
      productType: template.productType,
      systemType: template.systemType,
      templateName: template.name,
      sizeBand: band.name,
      inputs: {
        widthIn: round(widthIn, 3),
        heightIn: round(heightIn, 3),
        panels,
        verticalBars,
        horizontalBars,
        billableAreaSqFt,
        color: input.color,
      },
      lines: lineResults,
      profiles,
      totals: {
        totalLengthFt: round(lineResults.reduce((sum, line) => sum + line.totalLengthFt, 0)),
        aluminiumWeightKg: round(lineResults.reduce((sum, line) => sum + line.weightKg, 0), 3),
        barsNeeded: cuttingPlan.totals.bars,
        plannedWasteRatePct: cuttingPlan.totals.wasteRatePct,
        profileCost,
        glassCost,
        hardwareCost,
        laborCost,
        finishSurcharge,
        materialCost: profileCost + glassCost + hardwareCost,
        total: subtotal + finishSurcharge,
      },
      laborRatePerSqFt: band.laborRatePerSqFt,
      explanation,
      warnings,
      generatedAt: new Date().toISOString(),
    };
  }

  private bandFits(
    band: SizeBand,
    widthFt: number,
    heightFt: number,
    areaSqFt: number,
    panelWidthFt: number,
  ): boolean {
    const within = (value: number, limit?: number | null) =>
      limit === undefined || limit === null || value <= limit + 1e-9;
    return (
      within(widthFt, band.maxWidthFt) &&
      within(heightFt, band.maxHeightFt) &&
      within(areaSqFt, band.maxAreaSqFt) &&
      within(panelWidthFt, band.maxPanelWidthFt)
    );
  }

  private evaluate(formula: string, scope: FormulaScope, component: string, field: string): number {
    try {
      return evaluateFormula(formula, scope);
    } catch (error) {
      const message = error instanceof FormulaError ? error.message : 'invalid formula';
      throw new BadRequestException(`"${component}" ${field} formula: ${message}`);
    }
  }

  private summariseByProfile(
    lines: BomLineResult[],
    profilesByCode: Map<string, Profile>,
  ): BomProfileSummary[] {
    const summary = new Map<string, BomProfileSummary>();
    for (const line of lines) {
      const profile = profilesByCode.get(line.profileCode)!;
      const current = summary.get(line.profileCode) ?? {
        profileCode: profile.code,
        profileName: profile.name,
        thicknessMm: profile.thicknessMm,
        barLengthFt: profile.barLengthFt,
        stockLengthsFt: stockLengthsFt(profile.barLengthFt, profile.shorterLengthsFt),
        totalLengthFt: 0,
        weightKg: 0,
        cost: 0,
        minimumBars: 0,
        barsNeeded: 0,
        stockToBuy: [],
        longestCutIn: 0,
      };
      current.totalLengthFt = round(current.totalLengthFt + line.totalLengthFt);
      current.weightKg = round(current.weightKg + line.weightKg, 3);
      current.cost += line.cost;
      current.longestCutIn = Math.max(current.longestCutIn, line.cutLengthIn);
      current.minimumBars = Math.ceil(current.totalLengthFt / profile.barLengthFt);
      summary.set(line.profileCode, current);
    }
    return Array.from(summary.values());
  }
}
