export interface PaymentRequest {
  order_id: string;
  method: 'mtn_momo' | 'orange_money' | 'card' | 'bank_transfer' | 'cash_on_delivery';
  phone?: string;
  amount_xaf: number;
}

export interface PaymentInitiateResponse {
  success: boolean;
  ref?: string;
  message?: string;
  error?: string;
}

export interface PaymentStatusResponse {
  status: 'pending' | 'successful' | 'failed';
  ref: string;
  error?: string;
}

/**
 * Payment Service for calling Supabase Edge Functions.
 * Make sure you have your Supabase URL and anon key properly configured.
 */
export const paymentService = {
  /**
   * Initiates a payment push request (e.g. Mobile Money) via Supabase Edge Functions.
   */
  async initiatePayment(request: PaymentRequest): Promise<PaymentInitiateResponse> {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/initiate-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Payment initiation failed');
      }

      return await response.json();
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Payment initiation error:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Polls the payment status until it's successful, failed, or times out.
   */
  async pollPaymentStatus(ref: string, maxDurationMs: number = 180000, intervalMs: number = 3000): Promise<PaymentStatusResponse> {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    const startTime = Date.now();

    while (Date.now() - startTime < maxDurationMs) {
      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/initiate-payment/status?ref=${encodeURIComponent(ref)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });

        if (response.ok) {
          const data: PaymentStatusResponse = await response.json();
          if (data.status === 'successful' || data.status === 'failed') {
            return data;
          }
        }
      } catch (err) {
        console.warn('Error polling payment status', err);
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    return { status: 'failed', ref, error: 'Payment timed out after 3 minutes' };
  }
};
