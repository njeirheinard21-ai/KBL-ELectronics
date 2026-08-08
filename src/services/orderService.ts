import { collection, getDocs, query, where, orderBy, startAfter, QueryDocumentSnapshot, DocumentData, limit, getAggregateFromServer, sum, getCountFromServer } from 'firebase/firestore';
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

  async getDashboardStats(): Promise<{ totalRevenue: number, totalOrders: number, recentOrders: Order[] }> {
    try {
      const qRecent = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(10));
      const snapshot = await withRetry(() => getDocs(qRecent));
      const recentOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      
      const coll = collection(db, 'orders');
      const aggregateSnapshot = await getAggregateFromServer(coll, {
        totalRevenue: sum('total')
      });
      const countSnapshot = await getCountFromServer(coll);
      
      return {
        totalRevenue: aggregateSnapshot.data().totalRevenue || 0,
        totalOrders: countSnapshot.data().count || 0,
        recentOrders
      };
    } catch (e: unknown) {
      const err = e as Error;
      logger.warn("Failed to fetch dashboard stats", { error: err.message });
      return { totalRevenue: 0, totalOrders: 0, recentOrders: [] };
    }
  },
  async getAllOrders(limitCount: number = 100): Promise<Order[]> {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(limitCount));
      const snapshot = await withRetry(() => getDocs(q));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    } catch (e: unknown) {
      const err = e as Error;
      logger.warn("Failed to fetch all orders", { error: err.message });
      return [];
    }
  },
  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    try {
      const q = query(collection(db, 'orders'), where('orderNumber', '==', orderNumber), limit(1));
      const snapshot = await withRetry(() => getDocs(q));
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Order;
    } catch (error: unknown) {
      const err = error as Error;
      logger.warn("Failed to fetch order", { error: err.message, orderNumber });
      return null;
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


