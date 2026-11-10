import { stockLengthsFt, validateShorterLengths } from './stock-lengths';

describe('stock lengths', () => {
  it('lists shorter pieces then the full bar, deduplicated and sorted', () => {
    expect(stockLengthsFt(21, [14, 7])).toEqual([7, 14, 21]);
    expect(stockLengthsFt(21, [7, 7, 21])).toEqual([7, 21]);
    expect(stockLengthsFt(20)).toEqual([20]);
    expect(stockLengthsFt(20, undefined)).toEqual([20]);
  });

  it('rejects shorter lengths that are not shorter than the bar', () => {
    expect(validateShorterLengths(21, [7, 14])).toBeNull();
    expect(validateShorterLengths(21, [])).toBeNull();
    expect(validateShorterLengths(21, [21])).toMatch(/21 ft bar/);
    expect(validateShorterLengths(16, [7, 18])).toMatch(/18/);
  });
});
