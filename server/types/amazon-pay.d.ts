// server/types/amazon-pay.d.ts
// Amazon Pay SDK Type Declarations

declare module '@amazonpay/amazon-pay-api-sdk-nodejs' {
  // Configuration
  export interface AmazonPayConfig {
    publicKeyId: string;
    privateKey: string | Buffer;
    region: 'us' | 'eu' | 'jp';
    sandbox?: boolean;
    algorithm?: 'AMZN-PAY-RSASSA-PSS' | 'AMZN-PAY-RSASSA-PSS-V2';
  }

  // Checkout Session Payload
  export interface CheckoutSessionPayload {
    webCheckoutDetails: {
      checkoutReviewReturnUrl: string;
      checkoutResultReturnUrl?: string;
    };
    storeId: string;
    scopes?: string[];
    deliverySpecifications?: any;
    chargePermissionType?: 'OneTime' | 'Recurring';
    paymentDetails: {
      paymentIntent: 'Confirm' | 'AuthorizeWithCapture';
      canHandlePendingAuthorization?: boolean;
      chargeAmount: {
        amount: string;
        currencyCode: string;
      };
    };
    merchantMetadata?: {
      merchantReferenceId?: string;
      merchantStoreName?: string;
      noteToBuyer?: string;
      customInformation?: string;
    };
  }

  // Checkout Session Response
  export interface CheckoutSessionResponse {
    checkoutSessionId: string;
    webCheckoutDetails: {
      amazonPayRedirectUrl: string;
      checkoutReviewReturnUrl: string;
      checkoutResultReturnUrl?: string;
    };
    chargePermissionType: string;
    chargePermissionId?: string;
    paymentDetails: {
      chargeAmount: {
        amount: string;
        currencyCode: string;
      };
    };
    buyer?: {
      name?: string;
      email?: string;
      phoneNumber?: string;
      billingAddress?: any;
    };
    statusDetails?: {
      state: string;
      reasonCode?: string;
      reasonDescription?: string;
    };
  }

  // API Response
  export interface ApiResponse<T = any> {
    status: number;
    headers: Record<string, string>;
    data: T;
  }

  // Charge Payload
  export interface ChargePayload {
    chargePermissionId: string;
    chargeAmount: {
      amount: string;
      currencyCode: string;
    };
    captureNow?: boolean;
    softDescriptor?: string;
  }

  // Charge Response
  export interface ChargeResponse {
    chargeId: string;
    chargePermissionId: string;
    chargeAmount: {
      amount: string;
      currencyCode: string;
    };
    captureAmount?: {
      amount: string;
      currencyCode: string;
    };
    statusDetails: {
      state: string;
      reasonCode?: string;
      reasonDescription?: string;
    };
  }

  // WebStore Client
  export class WebStoreClient {
    constructor(config: AmazonPayConfig);

    createCheckoutSession(
      payload: CheckoutSessionPayload,
      headers?: Record<string, string>
    ): Promise<ApiResponse<CheckoutSessionResponse>>;

    getCheckoutSession(
      checkoutSessionId: string,
      headers?: Record<string, string>
    ): Promise<ApiResponse<CheckoutSessionResponse>>;

    updateCheckoutSession(
      checkoutSessionId: string,
      payload: Partial<CheckoutSessionPayload>,
      headers?: Record<string, string>
    ): Promise<ApiResponse<CheckoutSessionResponse>>;

    completeCheckoutSession(
      checkoutSessionId: string,
      payload: {
        chargeAmount: {
          amount: string;
          currencyCode: string;
        };
      },
      headers?: Record<string, string>
    ): Promise<ApiResponse<any>>;

    createCharge(
      payload: ChargePayload,
      headers?: Record<string, string>
    ): Promise<ApiResponse<ChargeResponse>>;

    getCharge(
      chargeId: string,
      headers?: Record<string, string>
    ): Promise<ApiResponse<ChargeResponse>>;
  }

  // Webhook Event
  export interface WebhookEvent {
    ObjectType: 'PAYMENT' | 'CHARGE_PERMISSION' | 'REFUND';
    ObjectId: string;
    Status: 'Completed' | 'Declined' | 'Failed' | 'Authorized' | 'Captured';
    NotificationTimestamp: string;
    MerchantMetadata?: {
      merchantReferenceId?: string;
      merchantStoreName?: string;
      noteToBuyer?: string;
      customInformation?: string;
    };
  }
}
