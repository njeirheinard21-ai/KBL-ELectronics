import { Request, Response, NextFunction, Router } from "express";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth, DecodedIdToken } from "firebase-admin/auth";
import { z } from "zod";
import { logger } from "../logger";
import { calculateTotals } from "../../lib/pricing";
import { createOrderSchema } from "../../schemas/order.schema";
interface ProductData { stockCount?: number; inStock?: boolean; name?: string; brand?: string; image?: string; price?: number; }

export interface AuthenticatedRequest extends Request {
  user: DecodedIdToken & { role?: string };
}

export const workflowsRouter = Router();

// Middleware to verify Firebase Auth Token
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    (req as AuthenticatedRequest).user = decodedToken as DecodedIdToken & { role?: string };
    next();
  } catch (error: unknown) {
    const err = error as Error;
    logger.error('Token verification failed', { error: err.message });
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

workflowsRouter.use(authenticate);


workflowsRouter.post('/orders', async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const parseResult = createOrderSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid order request data' });
  }

  const db = getFirestore();
  const { items, shippingAddress } = parseResult.data;
  const userId = authReq.user.uid;

  try {
    const orderResult = await db.runTransaction(async (t) => {
      let subtotal = 0;
      const productRefs = items.map((item: { id: string }) => db.collection('products').doc(item.id));
      const productDocs = await t.getAll(...productRefs);

      const orderItems: Array<{ productId: string, name: string, image: string, brand: string, unitPrice: number, quantity: number, lineTotal: number }> = [];
      productDocs.forEach((doc, index) => {
        if (!doc.exists) throw new Error(`Product ${items[index].id} not found`);
        const productData = doc.data() as ProductData;
        if (!productData) throw new Error(`Product ${items[index].id} data missing`);
        const stockCount = typeof productData.stockCount === 'number' ? productData.stockCount : 0;
        
        if (!productData.inStock || stockCount < items[index].quantity) {
          throw new Error(`Product ${productData.name || items[index].id} is out of stock`);
        }
        
        const unitPrice = productData.price || 0;
        const quantity = items[index].quantity;
        const lineTotal = unitPrice * quantity;
        
        orderItems.push({
          productId: items[index].id,
          name: productData.name || '',
          brand: productData.brand || '',
          image: productData.image || '',
          unitPrice,
          quantity,
          lineTotal
        });
        
        subtotal += lineTotal;
      });

      const { shipping, tax, total } = calculateTotals(subtotal);

      // Collision-resistant order number
      const orderNumber = 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();

      const orderRef = db.collection('orders').doc();
      const orderData = {
        orderNumber,
        userId,
        items: orderItems,
        subtotal,
        shipping,
        tax,
        total,
        status: 'pending',
        shippingAddress,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      
      t.set(orderRef, orderData);

      // Decrement stock for each item
      productDocs.forEach((doc, index) => {
        const productData = doc.data() as ProductData;
        const currentStock = typeof productData?.stockCount === 'number' ? productData.stockCount : 0;
        const newStock = currentStock - items[index].quantity;
        t.update(doc.ref, {
          stockCount: FieldValue.increment(-items[index].quantity),
          inStock: newStock > 0,
        });

        // Add to inventory ledger
        t.set(db.collection('inventory_ledger').doc(), {
          productId: doc.id,
          operation: 'subtract',
          adjustmentQuantity: items[index].quantity,
          previousQuantity: currentStock,
          newQuantity: newStock,
          actor: userId,
          reason: 'Order placement - ' + orderRef.id,
          timestamp: FieldValue.serverTimestamp(),
        });
      });
      
      // Audit Log
      t.set(db.collection('audit_logs').doc(), {
        action: 'ORDER_CREATED',
        userId,
        orderId: orderRef.id,
        timestamp: FieldValue.serverTimestamp(),
      });

      return { id: orderRef.id, ...orderData };
    });

    logger.info('Order created successfully', { orderId: orderResult.id, userId });
    return res.json(orderResult);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error('Order creation failed', { error: err.message, userId });
    if (err.message && err.message.includes('is out of stock')) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(400).json({ error: 'Unable to process request' });
  }
});

const cancelOrderSchema = z.object({
  id: z.string().trim().min(1),
});

workflowsRouter.post('/orders/:id/cancel', async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const paramResult = cancelOrderSchema.safeParse(req.params);
  if (!paramResult.success) {
    return res.status(400).json({ error: 'Invalid order ID' });
  }

  const db = getFirestore();
  const orderId = paramResult.data.id;
  const userId = authReq.user.uid;

  try {
    await db.runTransaction(async (t) => {
      const orderRef = db.collection('orders').doc(orderId);
      const orderDoc = await t.get(orderRef);
      if (!orderDoc.exists) throw new Error('Order not found');
      
      const orderData = orderDoc.data();
      if (!orderData) throw new Error('Order data missing');
      if (orderData.userId !== userId && !(authReq.user.role === 'super_admin' || authReq.user.role === 'admin' || authReq.user.role === 'staff')) {
        throw new Error('Unauthorized');
      }
      if (orderData.status !== 'pending' && orderData.status !== 'processing') {
        throw new Error('Cannot cancel order in current status');
      }

      t.update(orderRef, { status: 'cancelled', updatedAt: FieldValue.serverTimestamp() });

      // Restore stock
      if (orderData.items && Array.isArray(orderData.items)) {
        for (const item of orderData.items) {
          if ((item.productId || item.id) && item.quantity) {
            const productRef = db.collection('products').doc(item.productId || item.id);
            // Fetch current stock to write accurate ledger entry
            const productDoc = await t.get(productRef);
            const currentStock = productDoc.data()?.stockCount || 0;
            const newStock = currentStock + item.quantity;
            
            t.update(productRef, {
              stockCount: FieldValue.increment(item.quantity),
              inStock: true,
            });
            
            t.set(db.collection('inventory_ledger').doc(), {
              productId: item.productId || item.id,
              operation: 'add',
              adjustmentQuantity: item.quantity,
              previousQuantity: currentStock,
              newQuantity: newStock,
              actor: userId,
              reason: 'Order cancellation - ' + orderId,
              timestamp: FieldValue.serverTimestamp(),
            });
          }
        }
      }
      
      t.set(db.collection('audit_logs').doc(), {
        action: 'ORDER_CANCELLED',
        userId,
        orderId,
        timestamp: FieldValue.serverTimestamp(),
      });
    });

    logger.info('Order cancelled', { orderId, userId });
    return res.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error;
    logger.error('Order cancellation failed', { error: err.message, userId, orderId });
    return res.status(400).json({ error: 'Unable to process cancellation' });
  }
});

// REVIEW APPROVAL
workflowsRouter.post('/reviews/:id/approve', async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  if (!(authReq.user.role === 'super_admin' || authReq.user.role === 'admin' || authReq.user.role === 'staff')) return res.status(403).json({ error: 'Forbidden' });
  const db = getFirestore();
  try {
    const reviewRef = db.collection('reviews').doc(req.params.id);
    await reviewRef.update({ status: 'approved', updatedAt: FieldValue.serverTimestamp() });
    
    // Audit Log
    await db.collection('audit_logs').add({
      action: 'REVIEW_APPROVED',
      userId: authReq.user.uid,
      reviewId: req.params.id,
      timestamp: FieldValue.serverTimestamp(),
    });
    
    return res.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error;
    logger.error('Review approval failed', { error: err.message });
    return res.status(500).json({ error: 'Unable to approve review' });
  }
});

const updateInventorySchema = z.object({
  productId: z.string().trim().min(1),
  quantity: z.number().int().min(0),
  operation: z.enum(['add', 'set', 'subtract']),
  reason: z.string().trim().optional(),
});

// INVENTORY UPDATE
workflowsRouter.post('/inventory/update', async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  if (!(authReq.user.role === 'super_admin' || authReq.user.role === 'admin' || authReq.user.role === 'staff')) return res.status(403).json({ error: 'Forbidden' });
  const parseResult = updateInventorySchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid inventory update data' });
  }

  const db = getFirestore();
  const { productId, quantity, operation } = parseResult.data;
  try {
    await db.runTransaction(async (t) => {
      const productRef = db.collection('products').doc(productId);
      const productDoc = await t.get(productRef);
      if (!productDoc.exists) throw new Error('Product not found');
      
      const currentStock = productDoc.data()?.stockCount || 0;
      let newStock = currentStock;
      if (operation === 'add') newStock += quantity;
      else if (operation === 'set') newStock = quantity;
      else if (operation === 'subtract') newStock = Math.max(0, currentStock - quantity);

      t.update(productRef, { stockCount: newStock, inStock: newStock > 0 });
      
      t.set(db.collection('audit_logs').doc(), {
        action: 'INVENTORY_UPDATED',
        userId: authReq.user.uid,
        productId,
        oldStock: currentStock,
        newStock,
        timestamp: FieldValue.serverTimestamp(),
      });
    });
    return res.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error;
    logger.error('Inventory update failed', { error: err.message });
    return res.status(500).json({ error: 'Unable to update inventory' });
  }
});

const warrantyRequestSchema = z.object({
  orderId: z.string().trim().min(1),
  productId: z.string().trim().min(1),
  issueDescription: z.string().trim().min(10).max(2000),
});

// WARRANTY REQUEST
workflowsRouter.post('/warranty/request', async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const parseResult = warrantyRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid warranty request data' });
  }

  const db = getFirestore();
  const { orderId, productId, issueDescription } = parseResult.data;
  const userId = authReq.user.uid;

  try {
    // Verify user owns the order
    const orderDoc = await db.collection('orders').doc(orderId).get();
    if (!orderDoc.exists || orderDoc.data()?.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const warrantyRef = db.collection('warranty_requests').doc();
    await warrantyRef.set({
      userId,
      orderId,
      productId,
      issueDescription,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp()
    });
    
    return res.json({ success: true, id: warrantyRef.id });
  } catch (error: unknown) {
    const err = error as Error;
    logger.error('Warranty request failed', { error: err.message, userId });
    return res.status(500).json({ error: 'Unable to submit warranty request' });
  }
});


const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'payment_pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
});

workflowsRouter.post('/orders/:id/status', async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  if (!(authReq.user.role === 'super_admin' || authReq.user.role === 'admin' || authReq.user.role === 'staff')) return res.status(403).json({ error: 'Forbidden' });
  
  const paramResult = z.object({ id: z.string() }).safeParse(req.params);
  if (!paramResult.success) return res.status(400).json({ error: 'Invalid order ID' });
  
  const bodyResult = updateOrderStatusSchema.safeParse(req.body);
  if (!bodyResult.success) return res.status(400).json({ error: 'Invalid status' });

  const db = getFirestore();
  const orderId = paramResult.data.id;
  const newStatus = bodyResult.data.status;
  
  try {
    await db.runTransaction(async (t) => {
      const orderRef = db.collection('orders').doc(orderId);
      const orderDoc = await t.get(orderRef);
      if (!orderDoc.exists) throw new Error('Order not found');
      
      const orderData = orderDoc.data();
      const oldStatus = orderData?.status;
      
      if (oldStatus === newStatus) return;

      // Status transition validation
      const validTransitions: Record<string, string[]> = {
        'pending': ['payment_pending', 'paid', 'cancelled'],
        'payment_pending': ['paid', 'cancelled'],
        'paid': ['processing', 'cancelled', 'refunded'],
        'processing': ['shipped', 'cancelled', 'refunded'],
        'shipped': ['delivered', 'returned'],
        'delivered': ['returned'],
        'cancelled': [],
        'refunded': []
      };
      
      // If we want strict transitions, we could enforce it here. The prompt says: "Only allow valid state transitions."
      if (validTransitions[oldStatus] && !validTransitions[oldStatus].includes(newStatus)) {
        throw new Error(`Invalid state transition from ${oldStatus} to ${newStatus}`);
      }

      t.update(orderRef, { status: newStatus, updatedAt: FieldValue.serverTimestamp() });
      
      t.set(db.collection('audit_logs').doc(), {
        action: 'ORDER_STATUS_UPDATED',
        userId: authReq.user.uid,
        orderId,
        oldStatus,
        newStatus,
        timestamp: FieldValue.serverTimestamp(),
      });
      
      // If transitioning to cancelled, restore stock?
      // Wait, there's a dedicated /cancel endpoint for users. For admins, they might just cancel it here.
      if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
         if (orderData?.items && Array.isArray(orderData.items)) {
            for (const item of orderData.items) {
              if ((item.productId || item.id) && item.quantity) {
                const productRef = db.collection('products').doc(item.productId || item.id);
                const productDoc = await t.get(productRef);
                const currentStock = productDoc.data()?.stockCount || 0;
                const newStock = currentStock + item.quantity;
                
                t.update(productRef, {
                  stockCount: FieldValue.increment(item.quantity),
                  inStock: true,
                });
                
                t.set(db.collection('inventory_ledger').doc(), {
                  productId: item.productId || item.id,
                  operation: 'add',
                  adjustmentQuantity: item.quantity,
                  previousQuantity: currentStock,
                  newQuantity: newStock,
                  actor: authReq.user.uid,
                  reason: 'Admin order cancellation - ' + orderId,
                  timestamp: FieldValue.serverTimestamp(),
                });
              }
            }
          }
      }
    });
    return res.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error;
    logger.error('Order status update failed', { error: err.message, orderId });
    return res.status(400).json({ error: err.message || 'Unable to update status' });
  }
});
