// src/routes/paymentRoutes.ts
// Payment routes for Express - Uses same Turso DB as existing routes

import { Router, Request, Response } from 'express';
import {
  createStripePaymentIntent,
  handleStripeWebhook,
  createAmazonPayCheckout,
  handleAmazonPayWebhook,
  createOrder,
  type Env,
} from './payments';

const router = Router();

// ═══════════════════════════════════════════════════════════
// HELPER: Convert Express req to Workers Request
// ═══════════════════════════════════════════════════════════
async function toWorkerRequest(req: Request): Promise<globalThis.Request> {
  const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  
  const headers = new Headers();
  Object.keys(req.headers).forEach(key => {
    const value = req.headers[key];
    if (value) {
      headers.set(key, Array.isArray(value) ? value[0] : value);
    }
  });

  return new globalThis.Request(url, {
    method: req.method,
    headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' 
      ? JSON.stringify(req.body) 
      : undefined,
  });
}

// ═══════════════════════════════════════════════════════════
// HELPER: Convert Workers Response to Express response
// ═══════════════════════════════════════════════════════════
async function sendWorkerResponse(workerRes: globalThis.Response, expressRes: Response) {
  const body = await workerRes.text();
  
  // Copy headers
  workerRes.headers.forEach((value, key) => {
    expressRes.setHeader(key, value);
  });
  
  // Send response
  expressRes.status(workerRes.status).send(body);
}

// ═══════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════

// Stripe: Create Payment Intent
router.post('/stripe/create-intent', async (req: Request, res: Response) => {
  try {
    const env = (req as any).env as Env;
    const workerRequest = await toWorkerRequest(req);
    const workerResponse = await createStripePaymentIntent(workerRequest, env);
    await sendWorkerResponse(workerResponse, res);
  } catch (error: any) {
    console.error('Payment intent error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Stripe: Webhook
router.post('/stripe/webhook', async (req: Request, res: Response) => {
  try {
    const env = (req as any).env as Env;
    
    const signature = req.headers['stripe-signature'] as string;
    if (!signature) {
      return res.status(400).json({ success: false, error: 'No signature' });
    }

    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const headers = new Headers();
    headers.set('stripe-signature', signature);
    headers.set('content-type', 'application/json');

    const workerRequest = new globalThis.Request(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body),
    });

    const workerResponse = await handleStripeWebhook(workerRequest, env);
    await sendWorkerResponse(workerResponse, res);
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Amazon Pay: Create Checkout
router.post('/amazon/checkout', async (req: Request, res: Response) => {
  try {
    const env = (req as any).env as Env;
    const workerRequest = await toWorkerRequest(req);
    const workerResponse = await createAmazonPayCheckout(workerRequest, env);
    await sendWorkerResponse(workerResponse, res);
  } catch (error: any) {
    console.error('Amazon Pay error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Amazon Pay: Webhook
router.post('/amazon/webhook', async (req: Request, res: Response) => {
  try {
    const env = (req as any).env as Env;
    
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const headers = new Headers();
    
    const signature = req.headers['x-amz-pay-signature'] as string;
    const timestamp = req.headers['x-amz-pay-date'] as string;
    
    if (signature) headers.set('x-amz-pay-signature', signature);
    if (timestamp) headers.set('x-amz-pay-date', timestamp);

    const workerRequest = new globalThis.Request(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body),
    });

    const workerResponse = await handleAmazonPayWebhook(workerRequest, env);
    await sendWorkerResponse(workerResponse, res);
  } catch (error: any) {
    console.error('Amazon Pay webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create Order
router.post('/orders', async (req: Request, res: Response) => {
  try {
    const env = (req as any).env as Env;
    const workerRequest = await toWorkerRequest(req);
    const workerResponse = await createOrder(workerRequest, env);
    await sendWorkerResponse(workerResponse, res);
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
