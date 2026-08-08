import { describe, it, expect } from 'vitest';
import { createOrderSchema } from '../schemas/order.schema';

describe('Order Payload Contract', () => {
  it('valid payload passes', () => {
    const valid = {
      items: [{ id: 'p1', quantity: 2 }],
      shippingAddress: {
        fullName: 'John',
        street: '123 Main',
        city: 'NY',
        postalCode: '10001',
        phone: '123'
      }
    };
    expect(createOrderSchema.safeParse(valid).success).toBe(true);
  });

  it('negative quantity rejected', () => {
    const invalid = {
      items: [{ id: 'p1', quantity: -1 }],
      shippingAddress: {
        fullName: 'John',
        street: '123 Main',
        city: 'NY',
        postalCode: '10001',
        phone: '123'
      }
    };
    expect(createOrderSchema.safeParse(invalid).success).toBe(false);
  });

  it('empty items rejected', () => {
    const invalid = {
      items: [],
      shippingAddress: {
        fullName: 'John',
        street: '123 Main',
        city: 'NY',
        postalCode: '10001',
        phone: '123'
      }
    };
    expect(createOrderSchema.safeParse(invalid).success).toBe(false);
  });

  it('missing address fields rejected', () => {
    const invalid = {
      items: [{ id: 'p1', quantity: 1 }],
      shippingAddress: {
        fullName: 'John',
        // missing fields
      }
    };
    expect(createOrderSchema.safeParse(invalid).success).toBe(false);
  });
});
