import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, startAfter, DocumentData, QueryDocumentSnapshot, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types/product';
import { logger, withRetry } from '../lib/logger';

const PRODUCTS_COLLECTION = 'products';

// Helper to convert Firestore doc to Product
const mapProduct = (doc: QueryDocumentSnapshot<DocumentData>): Product => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name || '',
    brand: data.brand || '',
    price: data.price || 0,
    originalPrice: data.originalPrice,
    category: data.category || '',
    image: data.image || '',
    rating: data.rating || 0,
    reviews: data.reviews || 0,
    inStock: data.inStock ?? true,
    stockCount: data.stockCount || 0,
    features: data.features || [],
    isNew: data.isNew,
    hasDeal: data.hasDeal,
  };
};

export const productService = {
  
  async createProduct(product: Omit<Product, 'id'>): Promise<string | null> {
    const searchKeywords = Array.from(new Set([
      ...(product.name || '').toLowerCase().split(/\s+/),
      ...(product.brand || '').toLowerCase().split(/\s+/),
      ...(product.category || '').toLowerCase().split(/\s+/)
    ])).filter(Boolean);
    const productWithKeywords = { ...product, searchKeywords };
    try {
      const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), productWithKeywords);
      return docRef.id;
    } catch (e: unknown) {
      const err = e as Error;
      logger.error("Failed to create product", { error: err.message });
      throw e;
    }
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<boolean> {
    const updateData = { ...product } as Partial<Product> & { searchKeywords?: string[] };
    if (product.name || product.brand || product.category) {
      updateData.searchKeywords = Array.from(new Set([
        ...(product.name || '').toLowerCase().split(/\s+/),
        ...(product.brand || '').toLowerCase().split(/\s+/),
        ...(product.category || '').toLowerCase().split(/\s+/)
      ])).filter(Boolean);
    }
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      await updateDoc(docRef, updateData);
      return true;
    } catch (e: unknown) {
      const err = e as Error;
      logger.error("Failed to update product", { error: err.message });
      throw e;
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      await deleteDoc(docRef);
      return true;
    } catch (e: unknown) {
      const err = e as Error;
      logger.error("Failed to delete product", { error: err.message });
      throw e;
    }
  },

  
  async getPaginatedProducts(pageSize: number = 10, lastDoc?: QueryDocumentSnapshot<DocumentData>, searchTerm?: string): Promise<{ products: Product[], lastDoc?: QueryDocumentSnapshot<DocumentData> }> {
    try {
      let q;
      if (searchTerm) {
        const qLower = searchTerm.toLowerCase();
        q = query(collection(db, PRODUCTS_COLLECTION), where('searchKeywords', 'array-contains', qLower), limit(pageSize));
      } else {
        q = query(collection(db, PRODUCTS_COLLECTION), orderBy('name'), limit(pageSize));
      }
      
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }
      
      const snapshot = await withRetry(() => getDocs(q));
      if (!snapshot.empty) {
        return {
          products: snapshot.docs.map(mapProduct),
          lastDoc: snapshot.docs[snapshot.docs.length - 1]
        };
      }
      return { products: [], lastDoc: undefined };
    } catch (e: unknown) {
      const err = e as Error;
      logger.error("Firestore fetch failed", { error: err.message });
      throw err;
    }
  },

  async getAllProducts(limitCount: number = 100): Promise<Product[]> {
    try {
      const q = query(collection(db, PRODUCTS_COLLECTION), limit(limitCount));
      const snapshot = await withRetry(() => getDocs(q));
      if (!snapshot.empty) {
        return snapshot.docs.map(mapProduct);
      }
      return [];
    } catch (e: unknown) {
      const err = e as Error;
      logger.error("Firestore fetch failed", { error: err.message });
      throw err;
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const snapshot = await withRetry(() => getDoc(doc(db, PRODUCTS_COLLECTION, id)));
      if (snapshot.exists()) {
        return mapProduct(snapshot as QueryDocumentSnapshot<DocumentData>);
      }
      return null;
    } catch (e: unknown) {
      const err = e as Error;
      logger.error("Firestore fetch failed", { error: err.message, id });
      throw err;
    }
  },

  async getFeaturedProducts(count: number = 4): Promise<Product[]> {
    try {
      const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('rating', 'desc'), limit(count));
      const snapshot = await withRetry(() => getDocs(q));
      if (!snapshot.empty) {
        return snapshot.docs.map(mapProduct);
      }
      return [];
    } catch (e: unknown) {
      const err = e as Error;
      logger.error("Firestore fetch failed", { error: err.message });
      throw err;
    }
  },

  async getFlashDeals(count: number = 4): Promise<Product[]> {
    try {
      const q = query(collection(db, PRODUCTS_COLLECTION), where('hasDeal', '==', true), limit(count));
      const snapshot = await withRetry(() => getDocs(q));
      if (!snapshot.empty) {
        return snapshot.docs.map(mapProduct);
      }
      return [];
    } catch (e: unknown) {
      const err = e as Error;
      logger.error("Firestore fetch failed", { error: err.message });
      throw err;
    }
  },

    async searchProducts(queryStr: string): Promise<Product[]> {
    try {
      const qLower = queryStr.toLowerCase();
      const q = query(collection(db, PRODUCTS_COLLECTION), where('searchKeywords', 'array-contains', qLower), limit(20));
      const snapshot = await withRetry(() => getDocs(q));
      if (!snapshot.empty) {
        return snapshot.docs.map(mapProduct);
      }
      return [];
    } catch (e: unknown) {
      const err = e as Error;
      logger.error("Search failed", { error: err.message });
      throw err;
    }
  },

  async getRelatedProducts(productId: string, limitCount: number = 4): Promise<Product[]> {
    try {
      const currentProduct = await this.getProductById(productId);
      if (!currentProduct) return [];
      
      const categoryProducts = await this.getProductsByCategory(currentProduct.category);
      return categoryProducts.filter(p => p.id !== productId).slice(0, limitCount);
    } catch (e: unknown) {
      const err = e as Error;
      logger.error("Failed to get related products", { error: err.message });
      throw err;
    }
  },

    async getNewArrivals(count: number = 4): Promise<Product[]> {
    try {
      const q = query(collection(db, PRODUCTS_COLLECTION), where('isNew', '==', true), limit(count));
      const snapshot = await withRetry(() => getDocs(q));
      if (!snapshot.empty) {
        return snapshot.docs.map(mapProduct);
      }
      return [];
    } catch (e: unknown) {
      const err = e as Error;
      logger.error("Failed to get new arrivals", { error: err.message });
      throw err;
    }
  },
  
    async getProductsByBrand(brand: string): Promise<Product[]> {
    try {
      const q = query(collection(db, PRODUCTS_COLLECTION), where('brand', '==', brand));
      const snapshot = await withRetry(() => getDocs(q));
      if (!snapshot.empty) {
        return snapshot.docs.map(mapProduct);
      }
      return [];
    } catch (e: unknown) {
      const err = e as Error;
      logger.error("Failed to get products by brand", { error: err.message });
      throw err;
    }
  },

  async getProductsByCategory(category: string, limitCount: number = 100): Promise<Product[]> {
    try {
      const q = query(collection(db, PRODUCTS_COLLECTION), where('category', '==', category), limit(limitCount));
      const snapshot = await withRetry(() => getDocs(q));
      if (!snapshot.empty) {
        return snapshot.docs.map(mapProduct);
      }
      return [];
    } catch (e: unknown) {
      const err = e as Error;
      logger.error("Firestore fetch failed", { error: err.message });
      throw err;
    }
  }
};

