type EventParams = Record<string, unknown>;

class AnalyticsService {
  private logEvent(eventName: string, params?: EventParams) {
    if (typeof window !== 'undefined') {
      // If we had GA installed, we would use window.gtag here.
      // For now, we will push to a dataLayer array and log to console in dev mode
      const w = window as unknown as { dataLayer: unknown[] };
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({ event: eventName, ...params });
      
      if (import.meta.env.DEV) {
        console.log(`[Analytics] ${eventName}`, params);
      }
    }
  }

  pageView(url: string) {
    this.logEvent('page_view', { page_path: url });
  }

  productView(product: { id: string; name: string; price: number; category: string }) {
    this.logEvent('view_item', {
      currency: 'XAF',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price
      }]
    });
  }

  addToCart(product: { id: string; name: string; price: number; category: string }, quantity: number) {
    this.logEvent('add_to_cart', {
      currency: 'XAF',
      value: product.price * quantity,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        quantity: quantity
      }]
    });
  }
  
  removeFromCart(product: { id: string; name: string; price: number; category: string }, quantity: number) {
    this.logEvent('remove_from_cart', {
      currency: 'XAF',
      value: product.price * quantity,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        quantity: quantity
      }]
    });
  }

  beginCheckout(total: number, items: { product: { id: string; name: string; price: number; }, quantity: number }[]) {
    this.logEvent('begin_checkout', {
      currency: 'XAF',
      value: total,
      items: items.map((item) => ({
        item_id: item.product.id,
        item_name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }))
    });
  }

  paymentStarted(orderId: string, total: number) {
    this.logEvent('add_payment_info', {
      currency: 'XAF',
      value: total,
      payment_type: 'Mobile Money',
      transaction_id: orderId
    });
  }

  purchase(orderId: string, total: number, items: { product?: { id: string; name: string; }, productId?: string, name?: string, price: number, quantity: number }[]) {
    this.logEvent('purchase', {
      currency: 'XAF',
      transaction_id: orderId,
      value: total,
      items: items.map((item) => ({
        item_id: item.product?.id || item.productId,
        item_name: item.product?.name || item.name,
        price: item.price,
        quantity: item.quantity
      }))
    });
  }
  
  signUp(method: string) {
    this.logEvent('sign_up', { method });
  }
  
  login(method: string) {
    this.logEvent('login', { method });
  }
  
  search(query: string) {
    this.logEvent('search', { search_term: query });
  }
  
  wishlistAdd(product: { id: string; name: string; price: number }) {
    this.logEvent('add_to_wishlist', {
      currency: 'XAF',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        price: product.price
      }]
    });
  }
}

export const analytics = new AnalyticsService();
