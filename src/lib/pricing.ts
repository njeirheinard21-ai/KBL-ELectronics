export const FREE_SHIPPING_THRESHOLD = 1500;
export const FLAT_SHIPPING_RATE = 15;
export const TAX_RATE = 0.08;

export function calculateShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
}

export function calculateTax(subtotal: number): number {
  return Math.round(subtotal * TAX_RATE * 100) / 100;
}

export function calculateTotals(subtotal: number) {
  const shipping = calculateShipping(subtotal);
  const tax = calculateTax(subtotal);
  return {
    subtotal,
    shipping,
    tax,
    total: Math.round((subtotal + shipping + tax) * 100) / 100,
  };
}
