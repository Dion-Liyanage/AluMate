import { BadRequestException } from '@nestjs/common';
import { BomService, parseDimensionToInches } from './bom.service';
import { evaluateFormula, validateFormula } from './formula.util';
import { SAMPLE_PROFILES, SAMPLE_TEMPLATES } from './sample-data';
import type { Profile } from './schemas/profile.schema';

const profiles = new Map<string, Profile>(
  SAMPLE_PROFILES.map((p) => [p.code, { ...p, isActive: true, isSample: true } as Profile]),
);
const template = (productType: string, systemType: string) =>
  SAMPLE_TEMPLATES.find((t) => t.productType === productType && t.systemType === systemType) as any;

describe('formula.util', () => {
  const scope = { W: 48, H: 36, P: 2, MV: 1, TR: 0 };

  it('respects precedence, parentheses and functions', () => {
    expect(evaluateFormula('(W - 2) / P + 1', scope)).toBe(24);
    expect(evaluateFormula('2 * (P - 1)', scope)).toBe(2);
    expect(evaluateFormula('P * max(1, TR)', scope)).toBe(2);
    expect(evaluateFormula('-H + ceil(2.1)', scope)).toBe(-33);
    expect(evaluateFormula('w × 2', scope)).toBe(96);
  });

  it('rejects unsafe or unknown input', () => {
    expect(validateFormula('process.exit()')).toBeTruthy();
    expect(validateFormula('W; drop')).toMatch(/Unexpected character/);
    expect(validateFormula('W +')).toBeTruthy();
    expect(validateFormula('foo(1)')).toMatch(/Unknown name/);
    expect(validateFormula('(W')).toMatch(/parenthesis/);
    expect(() => evaluateFormula('W / (P - 2)', scope)).toThrow(/Division by zero/);
  });
});

describe('parseDimensionToInches', () => {
  it('parses feet/inches strings and plain feet', () => {
    expect(parseDimensionToInches(`5'2"`)).toBe(62);
    expect(parseDimensionToInches(`4'`)).toBe(48);
    expect(parseDimensionToInches(`10"`)).toBe(10);
    expect(parseDimensionToInches(3)).toBe(36);
    expect(parseDimensionToInches('')).toBe(0);
  });
});

describe('BomService', () => {
  const service = new BomService();

  it('builds a sliding window cut list in the standard band', () => {
    const bom = service.generate(
      template('window', 'sliding'),
      { measurements: { width: `4'`, height: `4'` }, panels: 2 },
      profiles,
    );

    expect(bom.sizeBand).toContain('70mm');
    const rails = bom.lines.find((l) => l.component.includes('top & bottom rails'))!;
    expect(rails.quantity).toBe(4);
    expect(rails.cutLengthIn).toBe(24); // (48 - 2) / 2 + 1
    expect(bom.lines.some((l) => l.component.includes('transom'))).toBe(false); // TR = 0 → skipped
    expect(bom.totals.aluminiumWeightKg).toBeGreaterThan(0);
    // 4ft × 4ft = 16 sq.ft × LKR 3,000 all-inclusive
    expect(bom.pricing).toEqual({ method: 'per-sq-ft', ratePerSqFt: 3000 });
    expect(bom.totals.total).toBe(48_000);
    expect(bom.totals.materialCost + bom.totals.laborCost).toBe(48_000);
  });

  it('moves to a stronger profile series when the opening is larger', () => {
    const bom = service.generate(
      template('window', 'sliding'),
      { measurements: { width: `7'`, height: `5'` }, panels: 3 },
      profiles,
    );
    expect(bom.sizeBand).toContain('80mm');
    expect(bom.lines.every((l) => l.profileCode.startsWith('SW80') || l.profileCode === 'GB-STD')).toBe(true);
  });

  it('uses leaf width to pick the swing door band', () => {
    const single = service.generate(
      template('door', 'swing'),
      { measurements: { width: `3'`, height: `7'` }, panels: 1 },
      profiles,
    );
    const wideSingle = service.generate(
      template('door', 'swing'),
      { measurements: { width: `4'`, height: `7'` }, panels: 1 },
      profiles,
    );
    const double = service.generate(
      template('door', 'swing'),
      { measurements: { width: `6'`, height: `7'` }, panels: 2 },
      profiles,
    );
    expect(single.sizeBand).toContain('100mm');
    expect(wideSingle.sizeBand).toContain('120mm');
    expect(double.sizeBand).toContain('100mm'); // each leaf is 3ft
  });

  it('adds mullions, transoms and glazing beads from studio bars on fixed windows', () => {
    const plain = service.generate(
      template('window', 'fixed'),
      { measurements: { width: `6'`, height: `4'` } },
      profiles,
    );
    const divided = service.generate(
      template('window', 'fixed'),
      { measurements: { width: `6'`, height: `4'` }, verticalBars: 2, horizontalBars: 1 },
      profiles,
    );
    const beads = (bom: typeof plain) =>
      bom.lines.filter((l) => l.profileCode === 'GB-STD').reduce((sum, l) => sum + l.quantity, 0);

    expect(plain.lines.some((l) => l.component.startsWith('Mullion'))).toBe(false);
    expect(divided.lines.find((l) => l.component.startsWith('Mullion'))!.quantity).toBe(2);
    expect(beads(plain)).toBe(4);
    expect(beads(divided)).toBe(24); // 6 panes × 4 beads
  });

  it('applies the wood finish surcharge', () => {
    const input = { measurements: { width: `4'`, height: `4'` } };
    const plain = service.generate(template('window', 'swing'), input, profiles);
    const wood = service.generate(template('window', 'swing'), { ...input, color: 'wood-finish' }, profiles);
    expect(wood.totals.finishSurcharge).toBe(Math.round(plain.totals.total * 0.3));
  });

  it('rejects invalid panel counts and missing sizes', () => {
    expect(() =>
      service.generate(template('window', 'sliding'), { measurements: { width: `4'`, height: `4'` }, panels: 1 }, profiles),
    ).toThrow(BadRequestException);
    expect(() =>
      service.generate(template('door', 'sliding'), { measurements: { width: `6'` } }, profiles),
    ).toThrow(/Width and height/);
  });

  it('every sample template generates a valid BOM', () => {
    for (const sample of SAMPLE_TEMPLATES) {
      const bom = service.generate(
        sample as any,
        { measurements: { width: `5'`, height: `7'` }, panels: sample.defaultPanels, verticalBars: 1, horizontalBars: 1 },
        profiles,
      );
      expect(bom.lines.length).toBeGreaterThan(3);
      expect(bom.lines.every((l) => l.cutLengthIn > 0 && l.quantity > 0)).toBe(true);
    }
  });
});

describe('stock bar lengths', () => {
  const service = new BomService();

  it('sample sliding window profiles are 21 ft bars also sold as 7 ft and 14 ft', () => {
    const sliding = SAMPLE_PROFILES.filter((p) => p.series.includes('Sliding Window'));
    expect(sliding.length).toBeGreaterThan(0);
    for (const p of sliding) {
      expect(p.barLengthFt).toBe(21);
      expect(p.shorterLengthsFt).toEqual([7, 14]);
    }
  });

  it('sample swing/fixed window and door profiles are 20 ft bars', () => {
    const others = SAMPLE_PROFILES.filter((p) => !p.series.includes('Sliding Window'));
    for (const p of others) {
      expect(p.barLengthFt).toBe(20);
      expect(p.shorterLengthsFt).toEqual([]);
    }
  });

  it('a small sliding window buys shorter pieces where possible', () => {
    const bom = service.generate(
      template('window', 'sliding'),
      { measurements: { width: `3'`, height: `3'` }, panels: 2 },
      profiles,
    );
    for (const profile of bom.profiles) {
      expect(profile.stockLengthsFt).toEqual([7, 14, 21]);
      expect(profile.stockToBuy.reduce((n, s) => n + s.count, 0)).toBe(profile.barsNeeded);
    }
    const lengthsBought = bom.profiles.flatMap((p) => p.stockToBuy.map((s) => s.lengthFt));
    expect(lengthsBought.some((ft) => ft < 21)).toBe(true);
  });

  it('door profiles only use 20 ft bars', () => {
    const bom = service.generate(
      template('door', 'swing'),
      { measurements: { width: `3'`, height: `7'` }, panels: 1 },
      profiles,
    );
    for (const profile of bom.profiles) {
      expect(profile.stockLengthsFt).toEqual([20]);
      expect(profile.stockToBuy.every((s) => s.lengthFt === 20)).toBe(true);
    }
  });
});

describe('window pricing per sq.ft', () => {
  const service = new BomService();
  const quote = (systemType: string, w: string, h: string, extra: Record<string, unknown> = {}) =>
    service.generate(
      template('window', systemType),
      { measurements: { width: w, height: h }, panels: systemType === 'sliding' ? 2 : 1, ...extra } as any,
      profiles,
    );

  it.each([
    // [width, height, series, rate]
    [`6'`, `4'`, '70mm', 3000], // exactly at the 70mm limit
    [`5'`, `3'`, '70mm', 3000],
    [`4'`, `6'`, '80mm', 4500], // too tall for 70mm (width ≤ 6 AND height ≤ 4)
    [`6'6"`, `4'`, '80mm', 4500], // too wide for 70mm
    [`8'`, `10'`, '80mm', 4500], // exactly at the 80mm limit
    [`9'`, `5'`, '100mm', 7000], // too wide for 80mm
    [`8'`, `11'`, '100mm', 7000], // too tall for 80mm
    [`14'`, `12'`, '100mm', 7000], // no upper limit
  ])('sliding %s × %s → %s at LKR %d/sq.ft', (w, h, series, rate) => {
    const bom = quote('sliding', w, h);
    expect(bom.sizeBand).toContain(series);
    expect(bom.pricing.ratePerSqFt).toBe(rate);
    expect(bom.totals.total).toBe(bom.inputs.billableAreaSqFt * rate);
  });

  it('extra-large sliding windows are cut from the 100mm SW100 profiles', () => {
    const bom = quote('sliding', `10'`, `6'`);
    expect(bom.lines.every((l) => l.profileCode.startsWith('SW100'))).toBe(true);
    for (const p of bom.profiles) expect(p.stockLengthsFt).toEqual([7, 14, 21]);
  });

  it.each([
    [`4'`, `3'`, '41mm', 3000],
    [`4'`, `12'`, '41mm', 3000], // any height while ≤ 4 ft wide
    [`4'1"`, `3'`, '60mm', 4500],
    [`8'`, `5'`, '60mm', 4500],
  ])('swing %s × %s → %s at LKR %d/sq.ft', (w, h, series, rate) => {
    const bom = quote('swing', w, h);
    expect(bom.sizeBand).toContain(series);
    expect(bom.totals.total).toBe(bom.inputs.billableAreaSqFt * rate);
  });

  it('bills part feet as a whole foot, as before', () => {
    const bom = quote('sliding', `5'6"`, `3'2"`); // billed 6 × 4
    expect(bom.inputs.billableAreaSqFt).toBe(24);
    expect(bom.totals.total).toBe(72_000);
  });

  it('adds 30% on top for wood finish', () => {
    const bom = quote('sliding', `4'`, `4'`, { color: 'wood-finish' });
    expect(bom.totals.finishSurcharge).toBe(14_400);
    expect(bom.totals.total).toBe(62_400);
  });

  it('splits the price into labour (area × labour rate) and material (the rest)', () => {
    const bom = quote('sliding', `4'`, `4'`);
    expect(bom.totals.laborCost).toBe(16 * 250);
    expect(bom.totals.materialCost).toBe(48_000 - 4_000);
  });

  it('the panel count does not change a per-sq.ft price', () => {
    const two = quote('sliding', `6'`, `4'`, { panels: 2 });
    const three = quote('sliding', `6'`, `4'`, { panels: 3 });
    expect(three.totals.total).toBe(two.totals.total);
  });

  it('bands without a per-sq.ft rate are still itemised (doors unchanged)', () => {
    const bom = service.generate(
      template('door', 'swing'),
      { measurements: { width: `3'`, height: `7'` }, panels: 1 },
      profiles,
    );
    expect(bom.pricing.method).toBe('itemised');
    expect(bom.totals.total).toBe(
      bom.totals.profileCost + bom.totals.glassCost + bom.totals.hardwareCost + bom.totals.laborCost,
    );
  });
});
