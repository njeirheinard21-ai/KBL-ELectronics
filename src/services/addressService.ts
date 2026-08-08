import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { logger } from '../lib/logger';

export interface Address {
  id?: string;
  fullName: string;
  street: string;
  city: string;
  postalCode: string;
  phone: string;
  isDefault?: boolean;
}

const LOCAL_STORAGE_KEY = 'kbl_user_addresses';

const getLocalAddresses = (userId: string): Address[] => {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalAddresses = (userId: string, addresses: Address[]) => {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId}`, JSON.stringify(addresses));
  } catch (e) {
    console.warn("Failed to save addresses to localStorage", e);
  }
};

export const addressService = {
  async getUserAddresses(userId: string): Promise<Address[]> {
    if (!userId) return [];
    try {
      const q = query(collection(db, 'users', userId, 'addresses'));
      const snapshot = await getDocs(q);
      const addresses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Address));
      if (addresses.length > 0) {
        saveLocalAddresses(userId, addresses);
        return addresses;
      }
      return getLocalAddresses(userId);
    } catch (e: unknown) {
      const err = e as Error;
      logger.warn("Failed to fetch addresses from remote server", { error: err.message, userId });
      return getLocalAddresses(userId);
    }
  },
  async createAddress(userId: string, address: Omit<Address, 'id'>): Promise<string> {
    const localId = 'addr_' + Date.now();
    const newAddress: Address = { ...address, id: localId };
    
    const currentLocal = getLocalAddresses(userId);
    saveLocalAddresses(userId, [...currentLocal, newAddress]);

    try {
      const docRef = await addDoc(collection(db, 'users', userId, 'addresses'), address);
      return docRef.id;
    } catch (e: unknown) {
      const err = e as Error;
      logger.warn("Failed to save created address to remote database", { error: err.message, userId });
      return localId;
    }
  },
  async updateAddress(userId: string, addressId: string, address: Partial<Address>): Promise<void> {
    const currentLocal = getLocalAddresses(userId);
    const updatedLocal = currentLocal.map(a => a.id === addressId ? { ...a, ...address } : a);
    saveLocalAddresses(userId, updatedLocal);

    try {
      const docRef = doc(db, 'users', userId, 'addresses', addressId);
      await updateDoc(docRef, address);
    } catch (e: unknown) {
      const err = e as Error;
      logger.warn("Failed to update remote address", { error: err.message, userId, addressId });
    }
  },
  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const currentLocal = getLocalAddresses(userId);
    const updatedLocal = currentLocal.filter(a => a.id !== addressId);
    saveLocalAddresses(userId, updatedLocal);

    try {
      const docRef = doc(db, 'users', userId, 'addresses', addressId);
      await deleteDoc(docRef);
    } catch (e: unknown) {
      const err = e as Error;
      logger.warn("Failed to delete remote address", { error: err.message, userId, addressId });
    }
  },
  async setDefaultAddress(userId: string, addressId: string): Promise<void> {
    try {
      const addresses = await this.getUserAddresses(userId);
      const updated = addresses.map(addr => ({ ...addr, isDefault: addr.id === addressId }));
      saveLocalAddresses(userId, updated);

      const updates = addresses.map(addr => {
        if (!addr.id) return Promise.resolve();
        const docRef = doc(db, 'users', userId, 'addresses', addr.id);
        return updateDoc(docRef, { isDefault: addr.id === addressId });
      });
      await Promise.all(updates);
    } catch (e: unknown) {
      const err = e as Error;
      logger.warn("Failed to set default address remotely", { error: err.message, userId, addressId });
    }
  }
};
