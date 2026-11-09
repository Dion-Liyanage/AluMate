import { planCutting, planCuttingFromBom, CutLineInput } from './cutting-optimizer';
import { BomService } from './bom.service';
import { SAMPLE_PROFILES, SAMPLE_TEMPLATES } from './sample-data';
import type { Profile } from './schemas/profile.schema';

const KG_PER_IN = 0.01;
const line = (component: string, quantity: number, cutLengthIn: number, profileCode = 'P1'): CutLineInput => ({
  component,
  profileCode,
  profileName: profileCode,
  quantity,
  cutLengthIn,
  weightKg: quantity * cutLengthIn * KG_PER_IN,
  pricePerFt: 100,
});
const settings = { kerfIn: 0.125, minReusableOffcutIn: 18 };

describe('planCutting', () => {
  it('packs the example from the docs into 2 bars', () => {
    // 6, 6, 4, 4, 3, 3 ft on 16 ft bars
    const plan = planCutting(
      [line('A', 2, 72), line('B', 2, 48), line('C', 2, 36)],
      { P1: 16 },
      settings,
    );
    const profile = plan.profiles[0];
    expect(profile.barsNeeded).toBe(2);
    expect(profile.pieces).toBe(6);

    // Every piece is placed exactly once and no bar is overfilled.
    const placed = profile.bars.flatMap((bar) => bar.cuts.map((cut) => cut.lengthIn)).sort((a, b) => a - b);
    expect(placed).toEqual([36, 36, 48, 48, 72, 72]);
    for (const bar of profile.bars) {
      expect(bar.usedIn + bar.kerfIn + bar.leftoverIn).toBeCloseTo(192, 6);
    }
  });

  it('classifies leftovers as reusable offcuts or scrap and balances the material', () => {
    const plan = planCutting([line('Long', 1, 150), line('Short', 1, 180)], { P1: 16 }, settings);
    const leftovers = plan.profiles[0].bars.map((bar) => [bar.leftoverType, bar.leftoverIn]);
    expect(leftovers).toContainEqual(['offcut', 41.875]); // 192 - 150 - kerf
    expect(leftovers).toContainEqual(['scrap', 11.875]); // 192 - 180 - kerf

    const t = plan.totals;
    expect(t.usedKg + t.reusableOffcutsKg + t.scrapWasteKg).toBeCloseTo(t.purchasedKg, 2);
    expect(t.purchaseCost).toBe(2 * 16 * 100);
    expect(t.efficiencyPct).toBeCloseTo((330 / 384) * 100, 0);
  });

  it('does not charge a saw cut when a piece uses the rest of the bar exactly', () => {
    const plan = planCutting([line('Exact', 2, 96)], { P1: 16 }, settings);
    const bar = plan.profiles[0].bars[0];
    expect(plan.profiles[0].barsNeeded).toBe(2); // 96 + kerf + 96 > 192
    expect(bar.leftoverType).toBe('offcut');
  });

  it('splits pieces longer than a bar and warns about the joint', () => {
    const plan = planCutting([line('Huge', 1, 240)], { P1: 16 }, settings);
    expect(plan.profiles[0].barsNeeded).toBe(2);
    expect(plan.profiles[0].bars.flatMap((b) => b.cuts).every((c) => c.isJoint)).toBe(true);
    expect(plan.warnings[0]).toMatch(/needs a joint/);
  });

  it('plans each profile separately', () => {
    const plan = planCutting([line('A', 2, 100, 'P1'), line('B', 2, 100, 'P2')], { P1: 16, P2: 20 }, settings);
    expect(plan.profiles.map((p) => [p.profileCode, p.barsNeeded])).toEqual([
      ['P1', 2],
      ['P2', 1],
    ]);
  });

  it('works from a real BOM snapshot', () => {
    const profiles = new Map<string, Profile>(
      SAMPLE_PROFILES.map((p) => [p.code, { ...p, isActive: true, isSample: true } as Profile]),
    );
    const bom = new BomService().generate(
      SAMPLE_TEMPLATES[0] as any,
      { measurements: { width: `6'`, height: `4'` }, panels: 2 },
      profiles,
    );
    const plan = planCuttingFromBom(bom);

    expect(plan.totals.bars).toBe(bom.totals.barsNeeded);
    expect(plan.totals.usedKg).toBeCloseTo(bom.totals.aluminiumWeightKg, 1);
    expect(plan.totals.purchasedKg).toBeGreaterThanOrEqual(plan.totals.usedKg);
    for (const profile of bom.profiles) {
      expect(profile.barsNeeded).toBeGreaterThanOrEqual(profile.minimumBars);
    }
  });
});
