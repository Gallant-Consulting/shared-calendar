/**
 * Tailwind max-height class for promo images based on width/height ratio.
 * Wider images get a lower cap; tall/portrait images get more vertical room.
 */
export function getPromoImageMaxHeightClass(ratio: number): string {
  if (!Number.isFinite(ratio) || ratio <= 0) {
    return 'max-h-56';
  }
  if (ratio >= 2) {
    return 'max-h-40';
  }
  if (ratio >= 1.25) {
    return 'max-h-64';
  }
  if (ratio >= 0.85) {
    return 'max-h-56';
  }
  /* Portrait / tall: cap height so huge originals don’t dominate the card */
  return 'max-h-80';
}
