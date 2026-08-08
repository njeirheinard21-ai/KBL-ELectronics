import { Request, Response, Router } from "express";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { logger } from "../logger";
import { AuthenticatedRequest } from "./workflows";
import crypto from "crypto";


export const paymentsRouter = Router();

// Notch Pay API Key
const NOTCHPAY_PRIVATE_KEY = process.env.NOTCHPAY_PRIVATE_KEY;

const initPaymentSchema = z.object({
  orderId: z.string().trim().min(1),
  paymentMethod: z.enum(['mtn_momo', 'orange_money', 'card', 'bank_transfer', 'cash_on_delivery', 'campay', 'notch_pay']),
  phone: z.string().optional(),
});

paymentsRouter.post('/initialize', async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user.uid;

  const parseResult = initPaymentSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid payment initialization data' });
  }

  const { orderId, paymentMethod } = parseResult.data;
  const db = getFirestore();

  try {
    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderData = orderDoc.data();
    if (orderData?.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (orderData?.status === 'paid' || orderData?.status === 'processing') {
      return res.status(400).json({ error: 'Order is already paid or processing' });
    }

    // Verify authoritative total
    const total = orderData?.total || 0;
    
    // Create payment transaction record
    const paymentRef = db.collection('payments').doc();
    const paymentData = {
      orderId,
      userId,
      amount: total,
      currency: 'XAF',
      method: paymentMethod,
      status: 'initiated',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    
    await paymentRef.set(paymentData);
    
    // Update order status to payment_pending
    await orderRef.update({
      status: 'payment_pending',
      paymentId: paymentRef.id,
      updatedAt: FieldValue.serverTimestamp(),
    });

    if (paymentMethod === 'cash_on_delivery') {
      // Direct success for COD (might require admin approval in real life)
      await paymentRef.update({ status: 'successful', updatedAt: FieldValue.serverTimestamp() });
      await orderRef.update({ status: 'processing', updatedAt: FieldValue.serverTimestamp() });
      return res.json({ success: true, method: 'cash_on_delivery', paymentId: paymentRef.id });
    }

    // Connect to actual provider using official APIs (Notch Pay example)
    if (!NOTCHPAY_PRIVATE_KEY) {
      logger.error('Payment keys not configured');
      return res.status(500).json({ error: 'Payment gateway is not configured' });
    }

    const response = await fetch('https://api.notchpay.co/payments/initialize', {
      method: 'POST',
      headers: {
        'Authorization': NOTCHPAY_PRIVATE_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: authReq.user.email || 'customer@kblelectronics.com',
        amount: total,
        currency: 'XAF',
        reference: paymentRef.id, // we use our payment ID as reference
        description: `Order ${orderData?.orderNumber}`
      })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(`Payment provider error: ${result.message || JSON.stringify(result)}`);
    }

    // Save the provider reference
    await paymentRef.update({
      providerReference: result.transaction?.reference,
      authorizationUrl: result.authorization_url,
      updatedAt: FieldValue.serverTimestamp()
    });

    return res.json({
      success: true,
      authorizationUrl: result.authorization_url,
      paymentId: paymentRef.id
    });

  } catch (error: unknown) {
    const err = error as Error;
    logger.error('Payment initialization failed', { error: err.message, orderId });
    return res.status(500).json({ error: 'Payment initialization failed. ' + err.message });
  }
});


paymentsRouter.post('/webhook', async (req: Request, res: Response) => {
  const db = getFirestore();
  
  // Verify Webhook signature
  const signature = req.headers['x-notch-signature'];
  if (!signature || !NOTCHPAY_PRIVATE_KEY) {
    return res.status(401).send('Missing signature or key');
  }

  // Calculate signature
  const hmac = crypto.createHmac('sha256', NOTCHPAY_PRIVATE_KEY);
  hmac.update(JSON.stringify(req.body));
  const calculatedSignature = hmac.digest('hex');

  if (signature !== calculatedSignature) {
    logger.warn('Invalid webhook signature');
    return res.status(401).send('Invalid signature');
  }

  const { event, data } = req.body;
  if (event === 'payment.complete') {
    const paymentId = data.reference;
    try {
      await db.runTransaction(async (t) => {
        const paymentRef = db.collection('payments').doc(paymentId);
        const paymentDoc = await t.get(paymentRef);

        if (!paymentDoc.exists) {
          throw new Error('Payment not found');
        }

        const paymentData = paymentDoc.data();
        if (paymentData?.status === 'successful') {
          // Idempotent: already processed
          return;
        }

        const orderId = paymentData?.orderId;
        const orderRef = db.collection('orders').doc(orderId);
        
        t.update(paymentRef, {
          status: 'successful',
          updatedAt: FieldValue.serverTimestamp(),
          providerData: data
        });

        t.update(orderRef, {
          status: 'paid', // Mark order paid
          updatedAt: FieldValue.serverTimestamp()
        });

        // Add audit log
        t.set(db.collection('audit_logs').doc(), {
          action: 'PAYMENT_SUCCESSFUL',
          orderId,
          paymentId,
          amount: data.amount,
          timestamp: FieldValue.serverTimestamp()
        });
      });
      return res.status(200).send('Webhook processed');
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Webhook processing failed', { error: err.message });
      return res.status(500).send('Server Error');
    }
  } else if (event === 'payment.failed' || event === 'payment.canceled' || event === 'payment.expired') {
    const paymentId = data.reference;
    try {
      await db.runTransaction(async (t) => {
         const paymentRef = db.collection('payments').doc(paymentId);
         const paymentDoc = await t.get(paymentRef);
         if (!paymentDoc.exists) throw new Error('Payment not found');
         const paymentData = paymentDoc.data();
         if (paymentData?.status === 'failed' || paymentData?.status === 'cancelled' || paymentData?.status === 'successful') {
           return;
         }
         
         const newStatus = event.split('.')[1] === 'canceled' ? 'cancelled' : event.split('.')[1];
         t.update(paymentRef, {
           status: newStatus,
           updatedAt: FieldValue.serverTimestamp(),
           providerData: data
         });
         
         const orderRef = db.collection('orders').doc(paymentData?.orderId);
         t.update(orderRef, {
            status: 'pending', // Revert to pending so user can retry
            updatedAt: FieldValue.serverTimestamp()
         });
      });
      return res.status(200).send('Webhook processed');
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Webhook failure processing failed', { error: err.message });
      return res.status(500).send('Server Error');
    }
  }

  res.status(200).send('Event not handled');
});
