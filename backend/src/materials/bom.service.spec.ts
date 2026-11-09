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
    expect(bom.totals.total).toBe(
      bom.totals.profileCost + bom.totals.glassCost + bom.totals.hardwareCost + bom.totals.laborCost,
    );
  });

  it('moves to a stronger profile series when the opening is larger', () => {
    const bom = service.generate(
      template('window', 'sliding'),
      { measurements: { width: `9'`, height: `5'` }, panels: 3 },
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
