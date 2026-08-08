
import { auth } from '../lib/firebase';

export interface PaymentRequest {
  orderId: string;
  paymentMethod: 'mtn_momo' | 'orange_money' | 'card' | 'bank_transfer' | 'cash_on_delivery' | 'campay' | 'notch_pay';
  phone?: string;
}

export interface PaymentInitiateResponse {
  success: boolean;
  authorizationUrl?: string;
  paymentId?: string;
  method?: string;
  error?: string;
}

export const paymentService = {
  async initiatePayment(request: PaymentRequest): Promise<PaymentInitiateResponse> {
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : null;
      if (!token) throw new Error("Not authenticated");
      if (!token) throw new Error("Unauthorized");

      const response = await fetch(`/api/payments/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(request)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Payment initiation failed');
      }

      return data;
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Payment initiation error:', err);
      return { success: false, error: err.message };
    }
  }
};
