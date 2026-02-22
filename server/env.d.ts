// env.d.ts (ROOT)
// Environment variables and general type declarations

export interface Env {
  // Server
  NODE_ENV: "development" | "staging" | "production";
  SERVER_PORT?: string;
  ENVIRONMENT?: string;
  
  // Database
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
  
  // CORS
  CORS_ORIGIN: string;
  
  // Security
  ALLOWED_ORIGINS?: string;
  COOKIE_DOMAIN?: string;
  SESSION_MAX_AGE?: string;
  
  // Optional
  JWT_SECRET?: string;
  API_KEY?: string;
  
  // Stripe
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  
  // Amazon Pay
  AMAZON_PAY_PUBLIC_KEY_ID?: string;
  AMAZON_PAY_PRIVATE_KEY?: string;
  AMAZON_PAY_STORE_ID?: string;
  AMAZON_PAY_WEBHOOK_PUBLIC_KEY?: string;
  
  // Frontend
  FRONTEND_URL?: string;
}

// Cloudflare Workers module
declare module "cloudflare:workers" {
  export const env: Env;
}

// Cloudflare Node.js compatibility
declare module "cloudflare:node" {
  export function httpServerHandler(options: { port: number }): any;
}

// Global request extension
declare global {
  namespace Express {
    interface Request {
      env: Env;
      user?: any;
      sessionId?: string;
    }
  }
}

export {};
