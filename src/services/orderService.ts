import { collection, getDocs, query, where, orderBy, startAfter, QueryDocumentSnapshot, DocumentData, limit } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { logger, withRetry } from '../lib/logger';

export interface Order {
  id?: string;
  orderNumber?: string;
  userId: string;
  items: { productId: string, name: string, brand: string, image: string, unitPrice: number, quantity: number, lineTotal: number }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt?: { toMillis?: () => number; toDate?: () => Date } | null;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    postalCode: string;
    phone: string;
  };
}

export const orderService = {
  async createOrder(orderData: { items: { id: string, quantity: number }[], shippingAddress: Order['shippingAddress'] }): Promise<{ id: string; orderNumber: string }> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const token = await user.getIdToken();
    const response = await fetch('/api/workflows/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || 'Failed to create order');
    }

    const data = await response.json();
    return { id: data.id, orderNumber: data.orderNumber };
  },

  
  async getPaginatedOrders(pageSize: number = 10, lastDoc?: QueryDocumentSnapshot<DocumentData>): Promise<{ orders: Order[], lastDoc?: QueryDocumentSnapshot<DocumentData> }> {
    try {
      let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(pageSize));
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }
      const snapshot = await withRetry(() => getDocs(q));
      if (!snapshot.empty) {
        return {
          orders: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)),
          lastDoc: snapshot.docs[snapshot.docs.length - 1]
        };
      }
      return { orders: [], lastDoc: undefined };
    } catch (e: unknown) {
      const err = e as Error;
      logger.warn("Failed to fetch paginated orders", { error: err.message });
      return { orders: [], lastDoc: undefined };
    }
  },
  
  async cancelOrder(orderId: string): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    const token = await user.getIdToken();
    const response = await fetch(`/api/workflows/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || 'Failed to cancel order');
    }
    return true;
  },

  async getAllOrders(): Promise<Order[]> {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await withRetry(() => getDocs(q));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    } catch (e: unknown) {
      const err = e as Error;
      logger.warn("Failed to fetch all orders", { error: err.message });
      return [];
    }
  },

  async getUserOrders(userId: string): Promise<Order[]> {
    if (!userId) return [];
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', userId)
      );
      const snapshot = await withRetry(() => getDocs(q));
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      
      return orders.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0);
        return timeB - timeA;
      });
    } catch (e: unknown) {
      const err = e as Error;
      logger.warn("Failed to fetch user orders", { error: err.message, userId });
      return [];
    }
  }
};
