import { missingRangeFields, roundDown, roundUp, toPriceRange } from './ai-pricing';

describe('AI assistant pricing rules', () => {
  it('turns an exact total into a rounded range around it', () => {
    const { minRs, maxRs } = toPriceRange(134_378);
    expect(minRs).toBe(120_000); // 120,940 rounded down to 5,000
    expect(maxRs).toBe(165_000); // 161,253 rounded up to 5,000
    expect(minRs).toBeLessThan(134_378);
    expect(maxRs).toBeGreaterThan(134_378);
  });

  it('uses finer steps for smaller amounts', () => {
    expect(toPriceRange(42_968)).toEqual({ minRs: 38_000, maxRs: 52_000 });
    expect(roundDown(12_340)).toBe(12_000);
    expect(roundUp(12_340)).toBe(12_500);
  });

  it('never returns an empty or zero range', () => {
    const { minRs, maxRs } = toPriceRange(300);
    expect(minRs).toBeGreaterThan(0);
    expect(maxRs).toBeGreaterThan(minRs);
  });

  it('reports which details are missing', () => {
    expect(missingRangeFields({ productType: 'window', systemType: 'sliding', widthFt: 7, heightFt: 4 })).toEqual([
      'panels',
      'color',
    ]);
    expect(
      missingRangeFields({ productType: 'window', systemType: 'sliding', widthFt: 7, heightFt: 4, panels: 2, color: 'white' }),
    ).toEqual([]);
    expect(missingRangeFields({ productType: 'door', systemType: 'swing', widthFt: 0, heightFt: 7, panels: 1, color: '' })).toEqual([
      'widthFt',
      'color',
    ]);
  });
});
