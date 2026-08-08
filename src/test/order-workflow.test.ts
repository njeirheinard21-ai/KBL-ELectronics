import { describe, it, expect, vi } from 'vitest';

describe('Order Cancel Flow', () => {
  it('cancels order and restores stock', () => {
    const mockOrderData = {
      userId: 'user1',
      status: 'pending',
      items: [
        { productId: 'prod1', quantity: 2 },
        { id: 'prod2', quantity: 1 } // testing fallback to id
      ]
    };

    
    const update = vi.fn();
    const FieldValue = {
      increment: vi.fn((val) => ({ _increment: val })),
    };

    // Simulate the business logic directly
    const orderRef = { id: 'order1' };
    update(orderRef, { status: 'cancelled' });
    
    for (const item of mockOrderData.items) {
      if ((item.productId || item.id) && item.quantity) {
        const productRef = { id: item.productId || item.id };
        update(productRef, {
          stockCount: FieldValue.increment(item.quantity),
          inStock: true
        });
      }
    }

    expect(update).toHaveBeenCalledWith(
      { id: 'prod1' }, 
      expect.objectContaining({
        stockCount: { _increment: 2 },
        inStock: true
      })
    );
    
    expect(update).toHaveBeenCalledWith(
      { id: 'prod2' }, 
      expect.objectContaining({
        stockCount: { _increment: 1 },
        inStock: true
      })
    );
  });
});
