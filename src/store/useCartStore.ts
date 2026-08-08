import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types/product';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItemProduct: (productId: string, freshProduct: Product) => void;
  clearCart: () => void;
}

export const selectTotalItems = (state: CartState): number =>
  state.items.reduce((total, item) => total + item.quantity, 0);

export const selectSubtotal = (state: CartState): number =>
  state.items.reduce((total, item) => total + item.product.price * item.quantity, 0);

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      setIsOpen: (open) => set({ isOpen: open }),
      
      addItem: (product, quantity = 1) => set((state) => {
        const validQuantity = Math.max(1, quantity);
        const existingItem = state.items.find(item => item.product.id === product.id);
        if (existingItem) {
          return {
            items: state.items.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + validQuantity }
                : item
            ),
            isOpen: true
          };
        }
        return { items: [...state.items, { product, quantity: validQuantity }], isOpen: true };
      }),

      removeItem: (productId) => set((state) => ({
        items: state.items.filter(item => item.product.id !== productId)
      })),

      updateQuantity: (productId, quantity) => set((state) => {
        if (quantity < 1) {
          return { items: state.items.filter(item => item.product.id !== productId) };
        }
        return {
          items: state.items.map(item =>
            item.product.id === productId ? { ...item, quantity } : item
          )
        };
      }),

      updateItemProduct: (productId, freshProduct) => set((state) => ({
        items: state.items.map(item => 
          item.product.id === productId ? { ...item, product: freshProduct } : item
        )
      })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'kbl-cart-storage',
      version: 1,
      migrate: (persistedState: unknown) => {
        if (
          persistedState &&
          typeof persistedState === 'object' &&
          ('totalItems' in persistedState || 'subtotal' in persistedState)
        ) {
          return { items: [] };
        }
        return persistedState as CartState;
      },
    }
  )
);
