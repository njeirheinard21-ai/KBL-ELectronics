import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z.array(z.object({
    id: z.string().min(1, "Product ID is required"),
    quantity: z.number().int().positive("Quantity must be a positive integer")
  })).min(1, "Order must contain at least one item"),
  shippingAddress: z.object({
    fullName: z.string().min(1, "Full name is required"),
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    phone: z.string().min(1, "Phone number is required")
  })
});
