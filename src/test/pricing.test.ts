import { describe, it, expect } from 'vitest';
import { calculateShipping, calculateTax, calculateTotals, FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_RATE } from '../lib/pricing';

describe('Pricing', () => {
  it('free shipping threshold', () => {
    expect(calculateShipping(FREE_SHIPPING_THRESHOLD - 1)).toBe(FLAT_SHIPPING_RATE);
    expect(calculateShipping(FREE_SHIPPING_THRESHOLD)).toBe(0);
    expect(calculateShipping(FREE_SHIPPING_THRESHOLD + 1)).toBe(0);
  });

  it('tax rounding', () => {
    // 100 * 0.08 = 8
    expect(calculateTax(100)).toBe(8);
    // 99.99 * 0.08 = 7.9992 => 8.00
    expect(calculateTax(99.99)).toBe(8);
  });

  it('totals calculation', () => {
    const totals = calculateTotals(1000);
    expect(totals.shipping).toBe(FLAT_SHIPPING_RATE);
    expect(totals.tax).toBe(80);
    expect(totals.total).toBe(1000 + FLAT_SHIPPING_RATE + 80);
  });
});
