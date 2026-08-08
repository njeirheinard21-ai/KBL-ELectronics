import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore, selectTotalItems, selectSubtotal } from '../store/useCartStore';
import { Product } from '../types/product';

const mockProduct: Product = {
  id: 'p1',
  name: 'Test Product',
  brand: 'Test',
  price: 100,
  originalPrice: 120,
  category: 'Audio',
  image: 'test.jpg',
  rating: 5,
  reviews: 1,
  inStock: true,
  stockCount: 10,
  features: [],
  isNew: true,
  hasDeal: false
};

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('adds item and computes total', () => {
    useCartStore.getState().addItem(mockProduct, 2);
    const state = useCartStore.getState();
    expect(state.items.length).toBe(1);
    expect(selectTotalItems(state)).toBe(2);
    expect(selectSubtotal(state)).toBe(200);
  });

  it('updates quantity and removes item on zero', () => {
    useCartStore.getState().addItem(mockProduct, 1);
    useCartStore.getState().updateQuantity('p1', 3);
    expect(selectTotalItems(useCartStore.getState())).toBe(3);

    useCartStore.getState().updateQuantity('p1', 0);
    expect(useCartStore.getState().items.length).toBe(0);
  });

  it('quantity clamping on add', () => {
    useCartStore.getState().addItem(mockProduct, -1);
    expect(selectTotalItems(useCartStore.getState())).toBe(1); // Valid quantity clamps to 1
  });
});
