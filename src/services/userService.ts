import { collection, getDocs, query, orderBy, limit, startAfter, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { logger, withRetry } from '../lib/logger';

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  createdAt?: unknown;
  ordersCount?: number;
  totalSpent?: number;
}

export const userService = {
  
  async getPaginatedUsers(pageSize: number = 10, lastDoc?: QueryDocumentSnapshot<DocumentData>): Promise<{ users: UserProfile[], lastDoc?: QueryDocumentSnapshot<DocumentData> }> {
    try {
      // NOTE: requires composite index if ordering by createdAt. Since we don't know if we have one, let's order by email (which exists in users)
      // or we can order by doc id (__name__) by not specifying orderBy. Let's just limit and startAfter.
      let q = query(collection(db, 'users'), orderBy('email'), limit(pageSize));
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }
      const snapshot = await withRetry(() => getDocs(q));
      if (!snapshot.empty) {
        return {
          users: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile)),
          lastDoc: snapshot.docs[snapshot.docs.length - 1]
        };
      }
      return { users: [], lastDoc: undefined };
    } catch (e: unknown) {
      const err = e as Error;
      logger.warn("Failed to fetch paginated users", { error: err.message });
      return { users: [], lastDoc: undefined };
    }
  },

  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const snapshot = await withRetry(() => getDocs(collection(db, 'users')));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
    } catch (e: unknown) {
      const err = e as Error;
      logger.warn("Failed to fetch all users", { error: err.message });
      return [];
    }
  },
};
