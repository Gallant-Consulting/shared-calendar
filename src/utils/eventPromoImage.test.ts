import { describe, expect, it } from 'vitest';
import { getPromoImageMaxHeightClass } from './eventPromoImage';

describe('getPromoImageMaxHeightClass', () => {
  it('returns default for invalid ratio', () => {
    expect(getPromoImageMaxHeightClass(NaN)).toBe('max-h-56');
    expect(getPromoImageMaxHeightClass(-1)).toBe('max-h-56');
    expect(getPromoImageMaxHeightClass(0)).toBe('max-h-56');
  });

  it('uses a short cap for very wide banners (ratio >= 2)', () => {
    expect(getPromoImageMaxHeightClass(2)).toBe('max-h-40');
    expect(getPromoImageMaxHeightClass(3)).toBe('max-h-40');
  });

  it('uses a medium-high cap for wide typical images (1.25 <= ratio < 2)', () => {
    expect(getPromoImageMaxHeightClass(1.25)).toBe('max-h-64');
    expect(getPromoImageMaxHeightClass(1.5)).toBe('max-h-64');
    expect(getPromoImageMaxHeightClass(1.99)).toBe('max-h-64');
  });

  it('uses the square-ish cap for near-square images (0.85 <= ratio < 1.25)', () => {
    expect(getPromoImageMaxHeightClass(0.85)).toBe('max-h-56');
    expect(getPromoImageMaxHeightClass(1)).toBe('max-h-56');
    expect(getPromoImageMaxHeightClass(1.24)).toBe('max-h-56');
  });

  it('uses a tall cap for portrait images (ratio < 0.85)', () => {
    expect(getPromoImageMaxHeightClass(0.84)).toBe('max-h-80');
    expect(getPromoImageMaxHeightClass(0.5)).toBe('max-h-80');
  });
});
