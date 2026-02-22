// src/routes/payments.ts
// COMPLETE PAYMENT SOLUTION: Stripe + Amazon Pay + Webhooks
// Uses same Turso database as existing routes

import Stripe from 'stripe';
import { WebStoreClient } from '@amazonpay/amazon-pay-api-sdk-nodejs';
import { createClient } from '@libsql/client';

export interface Env {
  // Stripe
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  
  // Amazon Pay
  AMAZON_PAY_PUBLIC_KEY_ID: string;
  AMAZON_PAY_PRIVATE_KEY: string;
  AMAZON_PAY_STORE_ID: string;
  AMAZON_PAY_WEBHOOK_PUBLIC_KEY: string;
  
  // Database (uses same Turso DB as existing routes)
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
  
  // General
  CORS_ORIGIN?: string;
  FRONTEND_URL?: string;
  NODE_ENV?: string;
}

// Interfaces for request/response types
interface PaymentRequest {
  amount: number;
  currency?: string;
  customerInfo: {
    email: string;
    firstName: string;
    lastName: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  items?: any[];
}

interface OrderData {
  orderNumber: string;
  customerInfo: any;
  paymentMethod?: string;
  paymentIntentId?: string;
  total: number;
  shipping: number;
  tax: number;
  items: any[];
}

// ═══════════════════════════════════════════════════════════
// 1. STRIPE: CREATE PAYMENT INTENT
// ═══════════════════════════════════════════════════════════
export async function createStripePaymentIntent(request: Request, env: Env): Promise<Response> {
  try {
    const { amount, currency, customerInfo } = (await request.json()) as PaymentRequest;

    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia' as any,
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency || 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        customerEmail: customerInfo.email,
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
      },
      receipt_email: customerInfo.email,
    });

    return new Response(JSON.stringify({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': env.CORS_ORIGIN || env.FRONTEND_URL || '*',
      },
    });
  } catch (error: any) {
    console.error('❌ Stripe Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': env.CORS_ORIGIN || env.FRONTEND_URL || '*',
      },
    });
  }
}

// ═══════════════════════════════════════════════════════════
// 2. STRIPE: WEBHOOK HANDLER
// ═══════════════════════════════════════════════════════════
export async function handleStripeWebhook(request: Request, env: Env): Promise<Response> {
  const sig = request.headers.get('stripe-signature');
  
  if (!sig) {
    return new Response('No signature', { status: 400 });
  }

  try {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia' as any,
    });

    const body = await request.text();
    const event = stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET);

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('✅ Stripe payment succeeded:', paymentIntent.id);
        await updateOrderStatus(paymentIntent.id, 'paid', env);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('❌ Stripe payment failed:', failedPayment.id);
        await updateOrderStatus(failedPayment.id, 'failed', env);
        break;
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error: any) {
    console.error('❌ Stripe webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
}

// ═══════════════════════════════════════════════════════════
// 3. AMAZON PAY: CREATE CHECKOUT SESSION
// ═══════════════════════════════════════════════════════════
export async function createAmazonPayCheckout(request: Request, env: Env): Promise<Response> {
  try {
    const { amount, customerInfo, items } = (await request.json()) as PaymentRequest;

    const client = new WebStoreClient({
      publicKeyId: env.AMAZON_PAY_PUBLIC_KEY_ID,
      privateKey: env.AMAZON_PAY_PRIVATE_KEY.replace(/\\n/g, '\n'),
      region: 'us',
      sandbox: env.NODE_ENV !== 'production',
    });

    const idempotencyKey = crypto.randomUUID().replace(/-/g, '');

    const payload = {
      webCheckoutDetails: {
        checkoutReviewReturnUrl: `${env.FRONTEND_URL}/checkout/review`,
        checkoutResultReturnUrl: `${env.FRONTEND_URL}/checkout/success`,
      },
      storeId: env.AMAZON_PAY_STORE_ID,
      scopes: ['name', 'email', 'phoneNumber', 'billingAddress'],
      paymentDetails: {
        paymentIntent: 'Confirm' as const,
        canHandlePendingAuthorization: false,
        chargeAmount: {
          amount: amount.toFixed(2),
          currencyCode: 'USD',
        },
      },
      merchantMetadata: {
        merchantReferenceId: `ORDER-${crypto.randomUUID().substring(0, 8)}`,
        merchantStoreName: 'EternoLUX',
        noteToBuyer: 'Thank you for choosing EternoLUX.',
        customInformation: JSON.stringify({ customerInfo, items }),
      },
    };

    const headers = {
      'x-amz-pay-idempotency-key': idempotencyKey,
    };

    const response = await client.createCheckoutSession(payload, headers);

    return new Response(JSON.stringify({
      checkoutSessionId: response.data.checkoutSessionId,
      checkoutUrl: response.data.webCheckoutDetails.amazonPayRedirectUrl,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': env.CORS_ORIGIN || env.FRONTEND_URL || '*',
      },
    });
  } catch (error: any) {
    console.error('❌ Amazon Pay Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': env.CORS_ORIGIN || env.FRONTEND_URL || '*',
      },
    });
  }
}

// ═══════════════════════════════════════════════════════════
// 4. AMAZON PAY: WEBHOOK HANDLER
// ═══════════════════════════════════════════════════════════
export async function handleAmazonPayWebhook(request: Request, env: Env): Promise<Response> {
  try {
    const bodyText = await request.text();
    const signature = request.headers.get('x-amz-pay-signature');
    const timestamp = request.headers.get('x-amz-pay-date');

    if (!signature || !timestamp) {
      return new Response('Missing signature', { status: 400 });
    }

    // Verify signature
    const isVerified = await verifyAmazonSignature(
      timestamp + bodyText,
      signature,
      env.AMAZON_PAY_WEBHOOK_PUBLIC_KEY
    );

    if (!isVerified) {
      console.error('❌ Invalid Amazon Pay signature');
      return new Response('Invalid signature', { status: 401 });
    }

    const event = JSON.parse(bodyText);
    
    if (event.ObjectType === 'PAYMENT' && event.Status === 'Completed') {
      console.log('✅ Amazon Pay payment completed:', event.ObjectId);
      await updateOrderStatus(event.ObjectId, 'paid', env);
    } else if (event.Status === 'Declined' || event.Status === 'Failed') {
      console.log('❌ Amazon Pay payment failed:', event.ObjectId);
      await updateOrderStatus(event.ObjectId, 'failed', env);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error: any) {
    console.error('❌ Amazon Pay webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════
// 5. CREATE ORDER (Called from frontend)
// ═══════════════════════════════════════════════════════════
export async function createOrder(request: Request, env: Env): Promise<Response> {
  try {
    const orderData = (await request.json()) as OrderData;

    // Use same Turso DB as existing routes
    const db = createClient({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    });
    
    const orderId = `EL-${Date.now()}`;
    
    await db.execute({
      sql: `INSERT INTO orders (
        id, order_number, customer_email, customer_name, 
        shipping_address, payment_method, payment_intent_id,
        subtotal, shipping_cost, tax, total, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        orderId,
        orderData.orderNumber,
        orderData.customerInfo.email,
        `${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}`,
        JSON.stringify({
          address: orderData.customerInfo.address,
          city: orderData.customerInfo.city,
          state: orderData.customerInfo.state,
          zip: orderData.customerInfo.zip,
        }),
        orderData.paymentMethod || 'stripe',
        orderData.paymentIntentId || '',
        orderData.total - orderData.shipping - orderData.tax,
        orderData.shipping,
        orderData.tax,
        orderData.total,
        'pending',
        new Date().toISOString(),
      ],
    });

    // Insert order items
    if (orderData.items && Array.isArray(orderData.items)) {
      for (const item of orderData.items) {
        await db.execute({
          sql: `INSERT INTO order_items (
            id, order_id, product_id, product_name, quantity, price
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          args: [
            `item_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            orderId,
            item.productId,
            item.name,
            item.quantity,
            item.price,
          ],
        });
      }
    }

    console.log(`✅ Order created: ${orderId}`);

    return new Response(JSON.stringify({
      success: true,
      orderId,
      orderNumber: orderData.orderNumber,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': env.CORS_ORIGIN || env.FRONTEND_URL || '*',
      },
    });
  } catch (error: any) {
    console.error('❌ Create order error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': env.CORS_ORIGIN || env.FRONTEND_URL || '*',
      },
    });
  }
}

// ═══════════════════════════════════════════════════════════
// HELPER: Verify Amazon Signature
// ═══════════════════════════════════════════════════════════
async function verifyAmazonSignature(
  message: string,
  signatureBase64: string,
  publicKeyPem: string
): Promise<boolean> {
  try {
    const signatureBuffer = Uint8Array.from(atob(signatureBase64), c => c.charCodeAt(0));

    const publicKey = await crypto.subtle.importKey(
      'spki',
      pemToArrayBuffer(publicKeyPem),
      { name: 'RSA-PSS', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const messageBuffer = new TextEncoder().encode(message);
    
    return await crypto.subtle.verify(
      { name: 'RSA-PSS', saltLength: 32 },
      publicKey,
      signatureBuffer,
      messageBuffer
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const pemContents = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\n/g, '')
    .replace(/\r/g, '');
  
  const binaryString = atob(pemContents);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes.buffer;
}

// ═══════════════════════════════════════════════════════════
// HELPER: Update Order Status
// ═══════════════════════════════════════════════════════════
async function updateOrderStatus(paymentIntentId: string, status: string, env: Env): Promise<void> {
  try {
    // Use same Turso DB as existing routes
    const db = createClient({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    });

    await db.execute({
      sql: `UPDATE orders SET status = ?, updated_at = ? WHERE payment_intent_id = ?`,
      args: [status, new Date().toISOString(), paymentIntentId],
    });

    console.log(`✅ Order updated: ${paymentIntentId} -> ${status}`);
  } catch (error) {
    console.error('❌ Failed to update order:', error);
  }
}
